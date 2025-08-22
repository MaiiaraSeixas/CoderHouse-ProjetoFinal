import { expect } from 'chai';
import sinon from 'sinon';
import { CartDAO } from '../daos/mongo/cart.dao.js';
import CartModel from '../models/cart.model.js';

describe('Teste de Unidade para CartDAO', () => {
  let cartDAO;

  beforeEach(() => {
    cartDAO = new CartDAO();
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Deve encontrar um carrinho pelo ID', async () => {
    const cartId = 'some-cart-id';
    const cartMock = { _id: cartId, products: [] };

    const findByIdStub = sinon.stub(CartModel, 'findById').returns({
      populate: sinon.stub().returnsThis(),
      lean: sinon.stub().resolves(cartMock)
    });

    const result = await cartDAO.findCartById(cartId);

    expect(result).to.deep.equal(cartMock);
    expect(findByIdStub.calledOnceWith(cartId)).to.be.true;
  });

  it('Deve criar um novo carrinho', async () => {
    const cartData = { products: [] };
    const createdCartMock = { _id: 'new-id', ...cartData };

    sinon.stub(CartModel.prototype, 'save').resolves(createdCartMock);

    const result = await cartDAO.createCart(cartData);

    expect(result).to.deep.equal(createdCartMock);
  });

  it('Deve atualizar um carrinho existente', async () => {
    const cartId = 'some-cart-id';
    const cartData = { products: [{ product: 'prod-1', quantity: 2 }] };
    const updatedCartMock = { _id: cartId, ...cartData };

    const findByIdAndUpdateStub = sinon.stub(CartModel, 'findByIdAndUpdate').returns({
      lean: sinon.stub().resolves(updatedCartMock)
    });

    const result = await cartDAO.updateCart(cartId, cartData);

    expect(result).to.deep.equal(updatedCartMock);
    expect(findByIdAndUpdateStub.calledOnceWith(cartId, cartData, { new: true })).to.be.true;
  });

  it('Deve deletar um carrinho', async () => {
    const cartId = 'some-cart-id';
    const deleteResultMock = { acknowledged: true, deletedCount: 1 };

    const findByIdAndDeleteStub = sinon.stub(CartModel, 'findByIdAndDelete').resolves(deleteResultMock);

    const result = await cartDAO.deleteCart(cartId);

    expect(result).to.deep.equal(deleteResultMock);
    expect(findByIdAndDeleteStub.calledOnceWith(cartId)).to.be.true;
  });

  it('Deve adicionar um produto a um carrinho', async () => {
    const cartId = 'some-cart-id';
    const productId = 'prod-1';
    const quantity = 1;
    const cartMock = {
      _id: cartId,
      products: [],
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(CartModel, 'findById').resolves(cartMock);

    const result = await cartDAO.addProductToCart(cartId, productId, quantity);

    expect(result.products).to.have.lengthOf(1);
    expect(result.products[0].product).to.equal(productId);
    expect(cartMock.save.calledOnce).to.be.true;
  });

  it('Deve remover um produto de um carrinho', async () => {
    const cartId = 'some-cart-id';
    const productId = 'prod-1';
    const updatedCartMock = { _id: cartId, products: [] };

    const findByIdAndUpdateStub = sinon.stub(CartModel, 'findByIdAndUpdate').resolves(updatedCartMock);

    const result = await cartDAO.removeProductFromCart(cartId, productId);

    expect(result).to.deep.equal(updatedCartMock);
    expect(findByIdAndUpdateStub.calledOnce).to.be.true;
  });

  it('Deve limpar todos os produtos de um carrinho', async () => {
    const cartId = 'some-cart-id';
    const updatedCartMock = { _id: cartId, products: [] };

    const findByIdAndUpdateStub = sinon.stub(CartModel, 'findByIdAndUpdate').resolves(updatedCartMock);

    const result = await cartDAO.clearProductsFromCart(cartId);

    expect(result).to.deep.equal(updatedCartMock);
    expect(findByIdAndUpdateStub.calledOnceWith(cartId, { products: [] }, { new: true })).to.be.true;
  });

  it('Deve encontrar todos os carrinhos', async () => {
    const cartsMock = [{ _id: 'cart-1' }, { _id: 'cart-2' }];

    const findStub = sinon.stub(CartModel, 'find').returns({
      lean: sinon.stub().resolves(cartsMock)
    });

    const result = await cartDAO.findAllCarts();

    expect(result).to.deep.equal(cartsMock);
    expect(findStub.calledOnce).to.be.true;
  });
});
