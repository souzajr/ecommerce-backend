import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';
import { IEcommerce } from './ecommerce.model';

export interface INewsletter extends mongoose.Document {
  ecommerce: IEcommerce;
  name: string;
  url: string;
}

const NewsletterSchema = new mongoose.Schema(
  {
    ecommerce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ecommerce',
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

NewsletterSchema.plugin(timeZone);
NewsletterSchema.plugin(mongoosePaginate);

const Newsletter = mongoose.model<
  INewsletter,
  mongoose.PaginateModel<INewsletter>
>('Newsletter', NewsletterSchema);

export default Newsletter;
