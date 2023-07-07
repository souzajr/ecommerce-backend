import { NextFunction, Request, Response } from 'express';
import ECOMMERCE_STATUS from '../config/utils/ecommerceStatus';
import ROLES from '../config/utils/roles';
import Ecommerce from '../models/ecommerce.model';
import User from '../models/user.model';
import { verifyToken } from '../config/utils/authJwtToken';

export default async function ecommerceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization, 'x-session-ecommerce': ecommerce } = req.headers;

  if (!authorization || !ecommerce) {
    return res.status(401).end();
  }

  const token = authorization.replace('Bearer', '').trim();

  try {
    const checkToken = verifyToken('auth', token);

    if (checkToken.error || !checkToken.data) {
      return res.status(401).end();
    }

    const check = await User.exists({
      _id: checkToken.data.id,
      role: ROLES.ADMIN_OWNER,
      deletedAt: { $exists: false },
    }).lean();

    if (!check) {
      return res.status(401).end();
    }

    const checkEcommerce = await Ecommerce.exists({
      _id: ecommerce,
      owner: checkToken.data.id,
      $or: [
        { status: ECOMMERCE_STATUS.ACTIVE },
        { status: ECOMMERCE_STATUS.PAUSED },
      ],
    }).lean();

    if (!checkEcommerce) {
      return res.status(401).end();
    }

    req.userId = checkToken.data.id;
    req.ecommerce = ecommerce as string;

    return next();
  } catch {
    return res.status(401).end();
  }
}
