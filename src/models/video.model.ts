import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';
import { IEcommerce } from './ecommerce.model';
import { IProduct } from './product.model';

export interface IVideo extends mongoose.Document {
  ecommerce: IEcommerce;
  product: IProduct;
  name: string;
  url: string;
  type: 'youtube' | 'vimeo';
}

const VideoSchema = new mongoose.Schema(
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
    url: { type: String, require: true },
    type: { type: String, require: true },
  },
  { timestamps: true }
);

VideoSchema.plugin(timeZone);
VideoSchema.plugin(mongoosePaginate);

const Video = mongoose.model<IVideo, mongoose.PaginateModel<IVideo>>(
  'Video',
  VideoSchema
);

export default Video;
