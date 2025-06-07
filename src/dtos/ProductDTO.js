export default class ProductDTO {
  constructor(product) {
    this.id = product._id?.toString();
    this.title = product.title;
    this.description = product.description;
    this.price = Number(product.price.toFixed(2));
    this.category = product.category;
    this.stock = product.stock;
    this.status = product.status;
    this.thumbnails = product.thumbnails || [];
  }
}
