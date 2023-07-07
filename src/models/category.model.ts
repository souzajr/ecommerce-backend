import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';
import { IEcommerce } from './ecommerce.model';

export interface ICategory extends mongoose.Document {
  ecommerce: IEcommerce;
  name: string;
  url: string;
}

const CategorySchema = new mongoose.Schema(
  {
    ecommerce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ecommerce',
      required: true,
    },
    name: { type: String, required: true },
    url: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

CategorySchema.plugin(timeZone);
CategorySchema.plugin(mongoosePaginate);

CategorySchema.index({ name: 'text' }, { default_language: 'none' });

const Category = mongoose.model<ICategory, mongoose.PaginateModel<ICategory>>(
  'Category',
  CategorySchema
);

export default Category;
