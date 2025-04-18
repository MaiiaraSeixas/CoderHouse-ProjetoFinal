import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: String,
  price: Number,
  stock: Number,
  category: String,
  thumbnails: [String],
  status: Boolean
});

productSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;
