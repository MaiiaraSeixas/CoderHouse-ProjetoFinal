// Importa o modelo ProductModel
// Esta linha importa a definição do modelo de dados para os produtos.
// Assim como no exemplo anterior, este modelo provavelmente define a estrutura
// dos documentos de produto no banco de dados MongoDB e como interagir com eles.
import ProductModel from '../models/product.model.js';

// Importa o plugin de paginação mongoose-paginate-v2
// Esta linha importa uma biblioteca externa (mongoose-paginate-v2) que adiciona
// funcionalidades de paginação aos modelos do Mongoose. Isso facilita a
// implementação de resultados paginados em consultas ao banco de dados.
import mongoosePaginate from 'mongoose-paginate-v2';

// Ativa o plugin de paginação no schema do Mongoose
// Embora não haja código explícito aqui para ativar o plugin no schema,
// geralmente isso é feito no arquivo de definição do modelo (product.model.js)
// utilizando algo como 'ProductSchema.plugin(mongoosePaginate);'.
// A importação aqui torna o plugin disponível para ser usado com o ProductModel.

// Define a classe ProductManagerMongo
// Declaração de uma classe chamada ProductManagerMongo, responsável por
// gerenciar operações relacionadas a produtos, especificamente utilizando MongoDB.
export class ProductManagerMongo {
  // Método assíncrono para buscar produtos com paginação
  // Este método permite buscar produtos de forma paginada, ou seja,
  // dividindo os resultados em várias páginas para melhorar a performance
  // e a experiência do usuário ao lidar com um grande número de produtos.
  async paginateProducts(filter, options) {
    // Utiliza o método 'paginate' fornecido pelo plugin mongoose-paginate-v2
    // para realizar a busca paginada de produtos.
    // 'filter' é um objeto que define os critérios de busca (por exemplo, buscar
    // produtos de uma determinada categoria).
    // 'options' é um objeto que especifica as opções de paginação, como o número
    // da página desejada ('page'), o número de itens por página ('limit'),
    // e outros parâmetros de ordenação ou campos a serem selecionados.
    const result = await ProductModel.paginate(filter, options);

    // Verifica se a página solicitada é maior que o número total de páginas
    // e se há algum resultado (para evitar erros quando não há produtos).
    if (options.page > result.totalPages && result.totalPages !== 0) {
      // Se a página solicitada não existir, retorna um objeto de resultado
      // modificado para indicar que a página está fora do limite.
      return {
        // Mantém as outras propriedades do resultado original.
        ...result,
        // Define 'docs' como um array vazio, pois não há documentos na página inexistente.
        docs: [],
        // Mantém o número da página solicitada.
        page: options.page,
        // Indica que há uma página anterior (a última página válida).
        hasPrevPage: true,
        // Indica que não há uma próxima página.
        hasNextPage: false,
        // Define a página anterior como a última página válida.
        prevPage: result.totalPages,
        // Não há próxima página.
        nextPage: null,
        // Define o link para a página anterior (a última página válida).
        prevLink: `/api/products?page=${result.totalPages}&limit=${options.limit}`,
        // Não há link para a próxima página.
        nextLink: null
      };
    }

    // Se a página solicitada for válida, retorna o resultado da paginação.
    return result;
  }

  // Método assíncrono para buscar um produto por ID
  // Este método busca um produto específico no banco de dados utilizando seu ID único.
  async getById(id) {
    // Utiliza o método 'findById' do Mongoose para buscar um documento
    // na coleção de produtos que corresponde ao ID fornecido.
    return await ProductModel.findById(id);
  }

  // Método assíncrono para criar um novo produto
  // Este método adiciona um novo produto ao banco de dados.
  async createProduct(product) {
    // Utiliza o método 'create' do Mongoose para inserir um novo documento
    // na coleção de produtos com os dados fornecidos no objeto 'product'.
    return await ProductModel.create(product);
  }

  // Método assíncrono para atualizar um produto por ID
  // Este método permite modificar os dados de um produto existente no banco de dados,
  // identificado pelo seu ID.
  async updateProduct(id, data) {
    // Utiliza o método 'findByIdAndUpdate' do Mongoose para buscar um produto
    // pelo ID e atualizar seus dados com as informações fornecidas em 'data'.
    // '{ new: true }' garante que o método retorne o documento modificado.
    return await ProductModel.findByIdAndUpdate(id, data, { new: true });
  }

  // Método assíncrono para deletar um produto por ID
  // Este método remove um produto do banco de dados com base no seu ID.
  async deleteProduct(id) {
    // Utiliza o método 'findByIdAndDelete' do Mongoose para buscar e remover
    // um documento da coleção de produtos com o ID fornecido.
    return await ProductModel.findByIdAndDelete(id);
  }
}