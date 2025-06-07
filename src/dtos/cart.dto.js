// src/dtos/cart.dto.js

export default class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.products = cart.products.map(item => ({
      productId: item.product._id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.quantity * item.product.price
    }));
  }

  get total() {
    return this.products.reduce((acc, item) => acc + item.subtotal, 0);
  }
}
