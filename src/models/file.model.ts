import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';
import { IEcommerce } from './ecommerce.model';
import { IProduct } from './product.model';

export interface IFile extends mongoose.Document {
  ecommerce: IEcommerce;
  product: IProduct;
  name: string;
  key: string;
}

const FileSchema = new mongoose.Schema(
  {
    ecommerce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ecommerce',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, require: true },
    key: { type: String, require: true },
  },
  { timestamps: true }
);

FileSchema.plugin(timeZone);
FileSchema.plugin(mongoosePaginate);

const File = mongoose.model<IFile, mongoose.PaginateModel<IFile>>(
  'File',
  FileSchema
);

export default File;
