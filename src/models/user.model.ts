import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  role: string;
  address: {
    street: string;
    streetNumber: string;
    neighborhood: string;
    complement: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  documents: {
    typeDoc: string;
    document: string;
  };
  phone: string;
  listCoupon: [
    {
      coupon: mongoose.Schema.Types.ObjectId;
    }
  ];
  deletedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Number;
  cashback: number;
  googleId: string;
  facebookId: string;
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String,
    role: String,
    address: {
      street: String,
      streetNumber: String,
      neighborhood: String,
      complement: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    documents: {
      typeDoc: String,
      document: String,
    },
    phone: String,
    listCoupon: [
      {
        coupon: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Coupon',
        },
      },
    ],
    deletedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Number,
    cashback: { type: Number, default: 0 },
    googleId: String,
    facebookId: String,
  },
  { timestamps: true }
);

UserSchema.plugin(timeZone);
UserSchema.plugin(mongoosePaginate);

UserSchema.index({ name: 'text' }, { default_language: 'none' });

const User = mongoose.model<IUser, mongoose.PaginateModel<IUser>>(
  'User',
  UserSchema
);

export default User;
