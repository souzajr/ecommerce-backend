import { NextFunction, Request, Response } from 'express';
import ECOMMERCE_STATUS from '../config/utils/ecommerceStatus';
import Ecommerce from '../models/ecommerce.model';

export default async function urlMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { 'x-session-site': url } = req.headers;

  if (!url) {
    return res.status(401).end();
  }

  try {
    const cleanUrl = typeof url === 'string' && url.split(':')[0];

    if (!cleanUrl) {
      return res.status(401).end();
    }

    const checkEcommerce = await Ecommerce.exists({
      url: cleanUrl,
      $or: [
        { status: ECOMMERCE_STATUS.ACTIVE },
        { status: ECOMMERCE_STATUS.PAUSED },
      ],
    }).lean();

    if (!checkEcommerce) {
      return res.status(401).end();
    }

    req.url = cleanUrl || '';
    req.ecommerce = checkEcommerce._id;

    return next();
  } catch {
    return res.status(401).end();
  }
}
