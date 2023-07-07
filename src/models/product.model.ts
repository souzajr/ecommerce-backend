import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';
import { ITag } from './tag.model';
import { ISubCategory } from './subcategory.model';
import { IEcommerce } from './ecommerce.model';
import { ICategory } from './category.model';

export interface IProduct extends mongoose.Document {
  name: string;
  url: string;
  type: 'physical' | 'digital' | 'course';
  price: number;
  promoPrice: number;
  catalog: boolean;
  ecommerce: IEcommerce;
  category: ICategory;
  subCategory: ISubCategory;
  tags: ITag[];
  allowCoupon: boolean;
  freeProduct: boolean;
  featured: boolean;
  coverPhoto: string;
  gallery?: { _id: string; url: string }[];
  description?: string;
  shortDescription?: string;
  showProduct: boolean;
  preSaleDate?: string | null;
  cashback: number;
  stock: number;
  shipping: {
    weight: number;
    height: number;
    length: number;
    width: number;
    description: string;
  };
  variations: {
    type: 'color' | 'size';
    value: string;
  }[];
}

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    price: { type: Number, required: true },
    promoPrice: Number,
    catalog: Boolean,
    description: String,
    shortDescription: String,
    ecommerce: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Ecommerce',
    },
    presaleDate: { type: String, default: null },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    type: { type: String, required: true },
    showProduct: { type: Boolean, default: true },
    featured: { type: Boolean, required: true },
    freeProduct: { type: Boolean, required: true },
    shipping: {
      weight: Number,
      height: Number,
      length: Number,
      width: Number,
      description: String,
    },
    coverPhoto: String,
    gallery: [
      {
        url: String,
      },
    ],
    allowCoupon: { type: Boolean, default: true },
    cashback: Number,
    stock: { type: Number, default: 0 },
    variations: [
      {
        type: { type: String },
        value: { type: String },
      },
    ],
  },
  { timestamps: true }
);

ProductSchema.plugin(timeZone);
ProductSchema.plugin(mongoosePaginate);

ProductSchema.index({ name: 'text' }, { default_language: 'none' });

const Product = mongoose.model<IProduct, mongoose.PaginateModel<IProduct>>(
  'Product',
  ProductSchema
);

export default Product;
