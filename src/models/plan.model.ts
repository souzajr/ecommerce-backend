import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';

export interface IPlan extends mongoose.Document {
  name: string;
  price: number;
  gateway: string;
  type: 'digital' | 'course' | 'physical';
  description: [
    {
      text: string;
    }
  ];
}

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    gateway: { type: String, required: true },
    type: { type: String, required: true },
    description: [
      {
        text: String,
      },
    ],
  },
  { timestamps: true }
);

PlanSchema.plugin(timeZone);
PlanSchema.plugin(mongoosePaginate);

const Plan = mongoose.model<IPlan, mongoose.PaginateModel<IPlan>>(
  'Plan',
  PlanSchema
);

export default Plan;
