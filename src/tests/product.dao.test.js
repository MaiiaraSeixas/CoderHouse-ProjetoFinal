import { expect } from 'chai';
import sinon from 'sinon';
import { ProductDAO } from '../daos/mongo/product.dao.js';
import ProductModel from '../models/product.model.js';

describe('Teste de Unidade para ProductDAO', () => {
  let productDAO;

  beforeEach(() => {
    productDAO = new ProductDAO();
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Deve encontrar produtos com paginação', async () => {
    const query = { category: 'test' };
    const options = { page: 1, limit: 10 };
    const productsMock = { docs: [{ name: 'Product 1' }], totalDocs: 1, page: 1, limit: 10 };

    const paginateStub = sinon.stub(ProductModel, 'paginate').resolves(productsMock);

    const result = await productDAO.findProducts(query, options);

    expect(result).to.deep.equal(productsMock);
    expect(paginateStub.calledOnceWith(query, options)).to.be.true;
  });

  it('Deve encontrar um produto pelo ID', async () => {
    const productId = 'some-product-id';
    const productMock = { _id: productId, name: 'Test Product' };

    const findByIdStub = sinon.stub(ProductModel, 'findById').returns({
      lean: sinon.stub().resolves(productMock)
    });

    const result = await productDAO.findProductById(productId);

    expect(result).to.deep.equal(productMock);
    expect(findByIdStub.calledOnceWith(productId)).to.be.true;
  });

  it('Deve criar um novo produto', async () => {
    const productData = { name: 'New Product', price: 100 };
    const createdProductMock = { _id: 'new-id', ...productData };

    sinon.stub(ProductModel.prototype, 'save').resolves(createdProductMock);

    const result = await productDAO.createProduct(productData);

    expect(result).to.deep.equal(createdProductMock);
  });

  it('Deve atualizar um produto existente', async () => {
    const productId = 'some-product-id';
    const productData = { name: 'Updated Product' };
    const updatedProductMock = { _id: productId, ...productData };

    const findByIdAndUpdateStub = sinon.stub(ProductModel, 'findByIdAndUpdate').returns({
      lean: sinon.stub().resolves(updatedProductMock)
    });

    const result = await productDAO.updateProduct(productId, productData);

    expect(result).to.deep.equal(updatedProductMock);
    expect(findByIdAndUpdateStub.calledOnceWith(productId, productData, { new: true })).to.be.true;
  });

  it('Deve deletar um produto', async () => {
    const productId = 'some-product-id';
    const deleteResultMock = { acknowledged: true, deletedCount: 1 };

    const findByIdAndDeleteStub = sinon.stub(ProductModel, 'findByIdAndDelete').resolves(deleteResultMock);

    const result = await productDAO.deleteProduct(productId);

    expect(result).to.deep.equal(deleteResultMock);
    expect(findByIdAndDeleteStub.calledOnceWith(productId)).to.be.true;
  });
});
