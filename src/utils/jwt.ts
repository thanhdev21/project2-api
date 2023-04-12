import { genUserToken } from '@business/auth';
import { RoleCodes, UserTokenType } from '@constants/enum';
import { Jwt, User } from '@graphql/types/generated-graphql-types';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import ms from 'ms';

const jwtSecretKey = process.env.JWT_SECRET;

export enum JWTAuthTokenType {
  ID_TOKEN = 'ID_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export interface JWTAuthTokenPayload {
  tokenId: mongoose.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  email?: string;
  username?: string;
  iat?: number;
  exp?: number;
  type: JWTAuthTokenType;
  isVerified?: boolean;
  metaId: mongoose.Types.ObjectId;
}

export interface JWTClientAuthPayload {
  tokenId: mongoose.Types.ObjectId;
  clientId?: string;
  uid: mongoose.Schema.Types.ObjectId;
  iat?: number;
  exp?: number;
  type: JWTAuthTokenType;

  nameOfUser?: string;
}

export interface JWTRefreshTokenPayload {
  tokenId: string;
  userId: number;
  type: JWTAuthTokenType;
  iat?: number;
  exp?: number;
}

export const verifyToken = async (token: string): Promise<JWTClientAuthPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecretKey, { algorithms: ['HS256'] }, (err: any, payload: any) => {
      if (err) return reject(err);
      if (payload.type !== JWTAuthTokenType.ID_TOKEN) return reject(new Error('Token is invalid!'));
      resolve(payload);
    });
  });
};

export const verifyRefreshToken = async (refreshToken: string): Promise<JWTRefreshTokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, jwtSecretKey, { algorithms: ['HS256'] }, (err: any, payload: any) => {
      if (err) return reject(err);
      if (payload.type !== JWTAuthTokenType.REFRESH_TOKEN) return reject(new Error('Refresh token is invalid!'));
      resolve(payload);
    });
  });
};

export const verifyResetPasswordToken = async (token: string): Promise<Omit<JWTRefreshTokenPayload, 'tokenId'>> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecretKey, { algorithms: ['HS256'] }, (err: any, payload: any) => {
      if (err) return reject(err);
      if (payload.type !== JWTAuthTokenType.RESET_PASSWORD) return reject(new Error('Refresh token is invalid!'));
      resolve(payload);
    });
  });
};

export const signAuthToken = async (tokenData: { userId: mongoose.Schema.Types.ObjectId }) => {
  const userToken = await genUserToken(tokenData.userId, UserTokenType.REFRESH_TOKEN);

  const data: JWTAuthTokenPayload = {
    ...tokenData,
    metaId: userToken._id,
    tokenId: userToken._id,
    type: JWTAuthTokenType.ID_TOKEN,
  };

  const token = jwt.sign(data, jwtSecretKey, {
    expiresIn: process.env.JWT_ID_TOKEN_EXPIRES,
    algorithm: 'HS256',
  });

  const refreshToken = jwt.sign(
    {
      userId: data.userId,
      type: JWTAuthTokenType.REFRESH_TOKEN,
      tokenId: userToken._id,
    },
    jwtSecretKey,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
      algorithm: 'HS256',
    },
  );

  return {
    token,
    refreshToken,
    expiresAt: Math.floor((new Date().getTime() + ms(process.env.JWT_ID_TOKEN_EXPIRES)) / 1000),
    refreshTokenExpiresAt: Math.floor((new Date().getTime() + ms(process.env.JWT_REFRESH_TOKEN_EXPIRES)) / 1000),
  };
};

export const signClientAuthToken = async (tokenData: { uid: mongoose.Schema.Types.ObjectId; clientId: string; nameOfUser: string; role: RoleCodes }) => {
  const userToken = await genUserToken(tokenData.uid, UserTokenType.REFRESH_TOKEN);

  const data: JWTClientAuthPayload = {
    ...tokenData,
    tokenId: userToken._id,
    type: JWTAuthTokenType.ID_TOKEN,
  };

  const token = jwt.sign(data, jwtSecretKey, {
    expiresIn: process.env.JWT_ID_TOKEN_EXPIRES,
    algorithm: 'HS256',
  });

  const refreshToken = jwt.sign(
    {
      userId: data.uid,
      type: JWTAuthTokenType.REFRESH_TOKEN,
      tokenId: userToken.tokenId,
    },
    jwtSecretKey,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
      algorithm: 'HS256',
    },
  );

  return {
    token,
    refreshToken,
    expiresAt: Math.floor((new Date().getTime() + ms(process.env.JWT_ID_TOKEN_EXPIRES)) / 1000),
    refreshTokenExpiresAt: Math.floor((new Date().getTime() + ms(process.env.JWT_REFRESH_TOKEN_EXPIRES)) / 1000),
  };
};

export const signNormalToken = (data: { uid: number }, type: JWTAuthTokenType, expiresIn: string): { token: string; expiresAt: number } => {
  const idToken = jwt.sign({}, process.env.JWT_NORMAL_SECRET, {
    expiresIn,
    algorithm: 'none',
  });

  return {
    token: idToken,
    expiresAt: new Date().getTime() + ms(expiresIn),
  };
};

export const buildJWTResponse = async (user: User): Promise<Jwt> => {
  const token = await signAuthToken({
    userId: user._id,
  });
  return {
    uid: user._id,
    expiresAt: token.expiresAt,
    refreshToken: token.refreshToken,
    token: token.token,
    payload: user,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
  };
};

export const verifyBearerToken = (token: string): Promise<JWTAuthTokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecretKey, { algorithms: ['HS256'] }, (err: any, payload: any) => {
      if (err) return reject(err);
      return resolve(payload);
    });
  });
};

export const verifyBaseBearerToken = (token: string): Promise<JWTAuthTokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecretKey, { algorithms: ['HS256'] }, (err: any, payload: any) => {
      if (err) return reject(err);
      return resolve(payload);
    });
  });
};
