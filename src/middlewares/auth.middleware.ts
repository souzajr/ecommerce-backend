import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../config/utils/authJwtToken';

export interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).end();
  }

  const token = authorization.replace('Bearer', '').trim();

  const checkToken = verifyToken('auth', token);

  if (checkToken.error || !checkToken.data) {
    return res.status(401).end();
  }

  req.userId = checkToken.data.id;

  return next();
}
