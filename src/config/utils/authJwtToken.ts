import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

const authToken = (id: Types.ObjectId | string): string => {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    id,
    iat: now,
    exp: now + 60 * 10, // 10 min
  };

  const token = jwt.sign(payload, process.env.AUTH_SECRET);

  return token;
};

const refreshToken = (id: Types.ObjectId | string): string => {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    id,
    iat: now,
    exp: now + 60 * 60 * 24 * 7, // 1 week
  };

  const token = jwt.sign(payload, process.env.AUTH_REFRESH_SECRET);

  return token;
};

export const generateAuthTokens = (
  id: Types.ObjectId | string
): { token: string; refresh_token: string } => {
  const getAuthToken = authToken(id);
  const getRefreshToken = refreshToken(id);

  return {
    token: getAuthToken,
    refresh_token: getRefreshToken,
  };
};

export const verifyToken = (
  type: 'auth' | 'refresh',
  token: string
): { error: boolean; data?: TokenPayload } => {
  try {
    const data = jwt.verify(
      token,
      type === 'auth'
        ? process.env.AUTH_SECRET
        : process.env.AUTH_REFRESH_SECRET
    );

    return {
      error: false,
      data: data as TokenPayload,
    };
  } catch {
    return {
      error: true,
    };
  }
};
