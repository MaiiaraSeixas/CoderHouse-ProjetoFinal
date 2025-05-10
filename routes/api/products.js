import express from 'express'; // Importa o Express.
import fs from 'fs/promises'; // Importa funcionalidades assíncronas do sistema de arquivos.
import path from 'path'; // Importa o módulo path para manipulação de caminhos.
import { fileURLToPath } from 'url'; // Importa função para obter o caminho do arquivo atual.
import { v4 as uuidv4 } from 'uuid'; // Importa a função para gerar IDs únicos.

const router = express.Router(); // Cria um roteador do Express.
const __filename = fileURLToPath(import.meta.url); // Obtém o caminho do arquivo atual.
const __dirname = path.dirname(__filename); // Obtém o diretório do arquivo atual.
const productsFile = path.join(__dirname, '../../data/productos.json'); // Define o caminho para o arquivo de produtos.

// Helpers
const readProducts = async () => { // Função assíncrona para ler os produtos do arquivo.
    try {
        const data = await fs.readFile(productsFile, 'utf-8'); // Lê o conteúdo do arquivo.
        return JSON.parse(data); // Converte o JSON para um array de objetos.
    } catch (err) {
        console.error('Erro ao ler o JSON:', err.message);
        return []; // Retorna um array vazio em caso de erro.
    }
};

const writeProducts = async (products) => { // Função assíncrona para escrever os produtos no arquivo.
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2)); // Escreve o array de objetos como JSON formatado no arquivo.
};

// GET /api/products
router.get('/', async (req, res) => { // Rota para listar produtos com paginação, filtro e ordenação.
    try {
        const products = await readProducts(); // Lê a lista de produtos.
        const { limit = 10, page = 1, query, sort } = req.query; // Obtém os parâmetros de consulta.
        const numLimit = parseInt(limit); // Converte o limite para número.
        const numPage = parseInt(page); // Converte a página para número.

        if (isNaN(numLimit) || numLimit <= 0 || isNaN(numPage) || numPage <= 0) { // Valida os parâmetros de limite e página.
            return res.status(400).json({ error: 'Parâmetros de limite ou página inválidos' });
        }

        const filteredProducts = query // Filtra os produtos por categoria, se a query estiver presente.
            ? products.filter(product =>
                product.category.toLowerCase().includes(query.toLowerCase())
            )
            : products;

        let sortedProducts = [...filteredProducts]; // Cria uma cópia para ordenação.
        if (sort === 'asc') { // Ordena por preço ascendente.
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sort === 'desc') { // Ordena por preço descendente.
            sortedProducts.sort((a, b) => b.price - a.price);
        }

        const startIndex = (numPage - 1) * numLimit; // Calcula o índice inicial para a página.
        const endIndex = startIndex + numLimit; // Calcula o índice final para a página.
        const paginatedProducts = sortedProducts.slice(startIndex, endIndex); // Obtém os produtos da página atual.

        const totalProducts = sortedProducts.length; // Obtém o total de produtos filtrados e ordenados.
        const totalPages = Math.ceil(totalProducts / numLimit); // Calcula o total de páginas.
        const hasPrevPage = numPage > 1; // Verifica se há página anterior.
        const hasNextPage = numPage < totalPages; // Verifica se há próxima página.
        const prevPage = hasPrevPage ? numPage - 1 : null; // Define o número da página anterior.
        const nextPage = hasNextPage ? numPage + 1 : null; // Define o número da próxima página.

        res.json({ // Responde com os produtos paginados e informações sobre a paginação.
            status: 'sucesso',
            payload: paginatedProducts,
            totalPages,
            page: numPage,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            prevLink: hasPrevPage ? `/api/products?limit=${numLimit}&page=${prevPage}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}` : null,
            nextLink: hasNextPage ? `/api/products?limit=${numLimit}&page=${nextPage}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}` : null
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao carregar os produtos' }); // Responde com erro 500 em caso de falha.
    }
});

// POST /api/products
router.post('/', async (req, res) => { // Rota para adicionar um novo produto.
    try {
        const { title, description, code, price, stock, category } = req.body; // Obtém os dados do produto do corpo da requisição.

        if (!title || !description || !code || !price || !stock || !category) { // Valida se todos os campos obrigatórios estão presentes.
            return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        }

        const products = await readProducts(); // Lê a lista de produtos.

        const newProduct = { // Cria um novo objeto de produto com um ID único.
            id: uuidv4(),
            title,
            description,
            code,
            price,
            stock,
            category
        };

        products.push(newProduct); // Adiciona o novo produto à lista.
        await writeProducts(products); // Escreve a lista atualizada no arquivo.

        res.status(201).json(newProduct); // Responde com o produto criado e status 201 (Criado).
    } catch (err) {
        res.status(500).json({ error: 'Erro interno ao criar produto' }); // Responde com erro 500 em caso de falha.
    }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => { // Rota para atualizar um produto existente.
    try {
        const products = await readProducts(); // Lê a lista de produtos.
        const index = products.findIndex(p => p.id === req.params.pid); // Encontra o índice do produto pelo ID.

        if (index === -1) { // Responde com erro 404 se o produto não for encontrado.
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        products[index] = { ...products[index], ...req.body }; // Atualiza as propriedades do produto com os dados da requisição.
        await writeProducts(products); // Escreve a lista atualizada no arquivo.

        res.json(products[index]); // Responde com o produto atualizado.
    } catch (err) {
        res.status(500).json({ error: 'Erro interno ao atualizar produto' }); // Responde com erro 500 em caso de falha.
    }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => { // Rota para deletar um produto.
    try {
        const products = await readProducts(); // Lê a lista de produtos.
        const index = products.findIndex(p => p.id === req.params.pid); // Encontra o índice do produto pelo ID.

        if (index === -1) { // Responde com erro 404 se o produto não for encontrado.
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const deleted = products.splice(index, 1); // Remove o produto da lista.
        await writeProducts(products); // Escreve a lista atualizada no arquivo.

        res.json({ status: 'deletado', product: deleted }); // Responde com sucesso e o produto deletado.
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar produto' }); // Responde com erro 500 em caso de falha.
    }
});

export default router; // Exporta o roteador configurado.