import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';
import { IEcommerce } from './ecommerce.model';

export interface IBanner extends mongoose.Document {
  ecommerce: IEcommerce;
  url: string;
  link?: string;
  position?: number;
}

const BannerSchema = new mongoose.Schema(
  {
    ecommerce: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Ecommerce',
    },
    url: { type: String, required: true },
    link: String,
    position: Number,
  },
  { timestamps: true }
);

BannerSchema.plugin(timeZone);
BannerSchema.plugin(mongoosePaginate);

const Banner = mongoose.model<IBanner, mongoose.PaginateModel<IBanner>>(
  'Banner',
  BannerSchema
);

export default Banner;
