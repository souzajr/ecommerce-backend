import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import timeZone from 'mongoose-timezone';
import { IPlan } from './plan.model';
import { IUser } from './user.model';

export interface IEcommerce extends mongoose.Document {
  name: string;
  url: string;
  status: string;
  gateway: string;
  planEnd: string;
  plan: IPlan;
  owner: IUser;
  logotipo: string;
  font: {
    name: string;
    file: string;
  };
  socialNetwork: {
    facebook: string;
    youtube: string;
    instagram: string;
  };
  colors: {
    primary: string;
    secondary: string;
    terciary: string;
    quaternary: string;
  };
  metas: {
    description: string;
    fav: string;
    favApple: string;
    keywords: string;
  };
  infos: {
    email: string;
    phone: string;
  };
  menuLinks: [
    {
      url: string;
      name: string;
    }
  ];
  payment: {
    apiKey: string;
    encryptionkey: string;
    creditCard: {
      interestRate: number;
      freeInstallments: number;
      maxInstallments: number;
      discount: number;
      enabled: boolean;
    };
    boleto: {
      discount: number;
      enabled: boolean;
    };
    pix: {
      discount: number;
      enabled: boolean;
    };
  };
  delivery: {
    apiKey?: string;
    zipCode?: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    secret: string;
  };
  googleTrackingId?: string;
  facebookTrackingId?: string;
}

const EcommerceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: String,
    status: { type: String, required: true },
    gateway: String,
    planEnd: String,
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logotipo: String,
    font: {
      name: String,
      file: String,
    },
    socialNetwork: {
      facebook: String,
      youtube: String,
      instagram: String,
    },
    colors: {
      primary: String,
      secondary: String,
      terciary: String,
      quaternary: String,
    },
    metas: {
      description: String,
      fav: String,
      favApple: String,
      keywords: String,
    },
    infos: {
      email: String,
      phone: String,
    },
    menuLinks: [
      {
        url: String,
        name: String,
      },
    ],
    payment: {
      apiKey: String,
      encryptionkey: String,
      creditCard: {
        interestRate: Number,
        freeInstallments: Number,
        maxInstallments: Number,
        discount: Number,
        enabled: Boolean,
      },
      boleto: {
        discount: Number,
        enabled: Boolean,
      },
      pix: {
        discount: Number,
        enabled: Boolean,
      },
    },
    delivery: {
      apiKey: String,
      zipCode: String,
    },
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      user: String,
      secret: String,
    },
    googleTrackingId: String,
    facebookTrackingId: String,
  },
  { timestamps: true }
);

EcommerceSchema.plugin(timeZone);
EcommerceSchema.plugin(mongoosePaginate);

EcommerceSchema.index({ name: 'text' }, { default_language: 'none' });

const Ecommerce = mongoose.model<
  IEcommerce,
  mongoose.PaginateModel<IEcommerce>
>('Ecommerce', EcommerceSchema);

export default Ecommerce;
