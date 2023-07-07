import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';
import { IEcommerce } from './ecommerce.model';

export interface ITag extends mongoose.Document {
  ecommerce: IEcommerce;
  name: string;
  url: string;
}

const TagSchema = new mongoose.Schema(
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

TagSchema.plugin(timeZone);
TagSchema.plugin(mongoosePaginate);

TagSchema.index({ name: 'text' }, { default_language: 'none' });

const Tag = mongoose.model<ITag, mongoose.PaginateModel<ITag>>(
  'Tag',
  TagSchema
);

export default Tag;
