import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';
import { IEcommerce } from './ecommerce.model';
import { ICategory } from './category.model';

export interface ISubCategory extends mongoose.Document {
  category: ICategory;
  ecommerce: IEcommerce;
  name: string;
  url: string;
}

const SubCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    ecommerce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ecommerce',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

SubCategorySchema.plugin(timeZone);
SubCategorySchema.plugin(mongoosePaginate);

SubCategorySchema.index({ name: 'text' }, { default_language: 'none' });

const SubCategory = mongoose.model<
  ISubCategory,
  mongoose.PaginateModel<ISubCategory>
>('SubCategory', SubCategorySchema);

export default SubCategory;
