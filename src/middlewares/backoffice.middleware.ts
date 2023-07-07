import { NextFunction, Request, Response } from 'express';
import ROLES from '../config/utils/roles';
import User from '../models/user.model';
import { verifyToken } from '../config/utils/authJwtToken';

export default async function backofficeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization) {
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
      role: ROLES.BACKOFFICE,
      deletedAt: { $exists: false },
    }).lean();

    if (!check) {
      return res.status(401).end();
    }

    req.userId = checkToken.data.id;

    return next();
  } catch {
    return res.status(401).end();
  }
}
