import { Request, Response } from 'express';
import axios from 'axios';
import {
  presignedUrlUpload,
  remove,
  removeWithKey,
} from '../config/utils/spaces';
import Ecommerce from '../models/ecommerce.model';
import PLAN_TYPES from '../config/utils/planTypes';
import File from '../models/file.model';
import ECOMMERCE_STATUS from '../config/utils/ecommerceStatus';
import Product from '../models/product.model';
import Video from '../models/video.model';
import Banner from '../models/banner.model';
import DOServices from '../config/utils/DOServices';
import EmailHandler from '../config/email';

class SystemController {
  getPresignedUrl = async (req: Request, res: Response) => {
    const { ecommerce } = req;
    const { file, size, permission, type, productId } = req.body;

    if (type !== 'image' && productId) {
      const checkEcommerce = await Ecommerce.findOne({ _id: ecommerce })
        .populate('plan')
        .lean();

      if (
        !checkEcommerce ||
        (checkEcommerce.plan?.type !== PLAN_TYPES.DIGITAL &&
          checkEcommerce.plan?.type !== PLAN_TYPES.COURSE)
      ) {
        return res.status(400).json({ mensagem: 'Algo deu errado' });
      }

      const checkQuantityFile = await File.countDocuments({
        ecommerce,
        product: productId,
      }).lean();

      if (
        (checkEcommerce.plan.type === PLAN_TYPES.DIGITAL &&
          checkQuantityFile >= 5) ||
        (checkEcommerce.plan.type === PLAN_TYPES.COURSE &&
          checkQuantityFile >= 7)
      ) {
        return res
          .status(400)
          .json({ mensagem: 'Limite máximo de arquivos atingidos' });
      }
    }

    const response = await presignedUrlUpload(type, file, size, permission);

    if (!response) {
      return res.status(500).json({ mensagem: 'Algo deu errado' });
    }

    return res.status(200).json(response);
  };

  checkSignature = async (req: Request, res: Response) => {
    const ecommerces = await Ecommerce.find({
      status: ECOMMERCE_STATUS.PAUSED,
      planEnd: { $exists: true },
    })
      .populate('owner')
      .lean();

    if (ecommerces?.length) {
      const today = new Date();

      const listOfEcommercesToDelete: string[] = [];

      ecommerces.forEach(ecommerce => {
        if (ecommerce && ecommerce.planEnd) {
          const ecommercePlanEndOriginal = new Date(ecommerce.planEnd);

          const addDaysPlanEnd = new Date(
            ecommercePlanEndOriginal.setDate(
              ecommercePlanEndOriginal.getDate() + 7
            )
          );

          if (today >= addDaysPlanEnd) {
            listOfEcommercesToDelete.push(ecommerce._id);

            EmailHandler.planPaused(
              ecommerce.owner.email,
              ecommerce.owner.name,
              ecommerce.name.toUpperCase()
            );
          }
        }
      });

      await Ecommerce.updateMany(
        { _id: listOfEcommercesToDelete },
        { status: ECOMMERCE_STATUS.DELETED }
      );
    }

    return res.status(200).end();
  };

  removeOldEcommerce = async (req: Request, res: Response) => {
    const ecommerces = await Ecommerce.find({
      status: ECOMMERCE_STATUS.DELETED,
    })
      .populate('owner')
      .lean();

    if (ecommerces?.length) {
      await Promise.all(
        ecommerces.map(async ecommerce => {
          const [products, banners, files] = await Promise.all([
            Product.find({
              ecommerce: ecommerce._id,
            }).lean(),
            Banner.find({
              ecommerce: ecommerce._id,
            }).lean(),
            File.find({
              ecommerce: ecommerce._id,
            }).lean(),
          ]);

          await Promise.all([
            Promise.all(banners?.map(async banner => remove(banner.url))),
            Promise.all(
              products?.map(async product => remove(product.coverPhoto))
            ),
            Promise.all(
              products?.map(
                async product =>
                  product.gallery &&
                  Promise.all(
                    product.gallery?.map(gallery => remove(gallery.url))
                  )
              )
            ),
            Promise.all(files?.map(async file => removeWithKey(file.key))),
            Banner.deleteMany({ ecommerce: ecommerce._id }),
            File.deleteMany({ ecommerce: ecommerce._id }),
            Video.deleteMany({ ecommerce: ecommerce._id }),
            Product.deleteMany({ ecommerce: ecommerce._id }),
            Ecommerce.deleteOne({
              _id: ecommerce._id,
              status: ECOMMERCE_STATUS.DELETED,
            }),
          ]);

          EmailHandler.planRemoved(
            ecommerce.owner.email,
            ecommerce.owner.name,
            ecommerce.name.toUpperCase()
          );
        })
      );

      const urls = await Ecommerce.find({
        url: { $ne: null },
      }).lean();

      const filteredUrls = urls.filter(item => item.url);

      await axios.put(
        process.env.UPDATE_DOMAIN_LIST_URL,
        {
          spec: {
            ...DOServices,
            domains: [
              ...filteredUrls.map(item => ({
                domain: item.url,
                type: 'PRIMARY',
              })),
              ...filteredUrls.map(item => ({
                domain: `www.${item.url}`,
                type: 'ALIAS',
              })),
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DIGITAL_OCEAN_TOKEN}`,
          },
        }
      );
    }

    return res.status(200).end();
  };
}

export default new SystemController();
