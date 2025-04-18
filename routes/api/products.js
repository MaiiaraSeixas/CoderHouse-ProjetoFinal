import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsFile = path.join(__dirname, '../../data/productos.json');

// Helpers
const readProducts = async () => {
    try {
        const data = await fs.readFile(productsFile, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Erro ao ler o JSON:', err.message);
        return [];
    }
};

const writeProducts = async (products) => {
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
};

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await readProducts();
        const { limit = 10, page = 1, query, sort } = req.query;
        const numLimit = parseInt(limit);
        const numPage = parseInt(page);

        if (isNaN(numLimit) || numLimit <= 0 || isNaN(numPage) || numPage <= 0) {
            return res.status(400).json({ error: 'Parâmetros de limite ou página inválidos' });
        }

        const filteredProducts = query
            ? products.filter(product =>
                product.category.toLowerCase().includes(query.toLowerCase())
            )
            : products;

        let sortedProducts = [...filteredProducts];
        if (sort === 'asc') {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sort === 'desc') {
            sortedProducts.sort((a, b) => b.price - a.price);
        }

        const startIndex = (numPage - 1) * numLimit;
        const endIndex = startIndex + numLimit;
        const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

        const totalProducts = sortedProducts.length;
        const totalPages = Math.ceil(totalProducts / numLimit);
        const hasPrevPage = numPage > 1;
        const hasNextPage = numPage < totalPages;
        const prevPage = hasPrevPage ? numPage - 1 : null;
        const nextPage = hasNextPage ? numPage + 1 : null;

        res.json({
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
        res.status(500).json({ error: 'Erro ao carregar os produtos' });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        }

        const products = await readProducts();

        const newProduct = {
            id: uuidv4(),
            title,
            description,
            code,
            price,
            stock,
            category
        };

        products.push(newProduct);
        await writeProducts(products);

        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno ao criar produto' });
    }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
    try {
        const products = await readProducts();
        const index = products.findIndex(p => p.id === req.params.pid);

        if (index === -1) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        products[index] = { ...products[index], ...req.body };
        await writeProducts(products);

        res.json(products[index]);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno ao atualizar produto' });
    }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
    try {
        const products = await readProducts();
        const index = products.findIndex(p => p.id === req.params.pid);

        if (index === -1) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const deleted = products.splice(index, 1);
        await writeProducts(products);

        res.json({ status: 'deletado', product: deleted });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

export default router;
