import UserModel from '@/models/user';
import UserTokenModel from '@/models/userToken';
import { ErrorCodes, RoleCodes, User } from '@graphql/types/generated-graphql-types';
import { GraphQLContext } from '@graphql/types/graphql';
import { makeGraphqlError } from '@utils/error';
import { JWTAuthTokenType, verifyBaseBearerToken, verifyBearerToken, verifyToken } from '@utils/jwt';
import { AuthenticationError } from 'apollo-server-express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import express from 'express';

export function requiredAuth<T>(next: T) {
  return (obj: any, args: any, context: GraphQLContext, info: any) => {
    if (!context.auth) throw new AuthenticationError('Unauthenticated!');
    if (args.limit && (args.limit as number) > 100) {
      args.limit = 100;
    }
    if (typeof args.limit !== undefined && (args.limit as number) < 0) {
      args.limit = 10;
    }
    const nextFunc = next as any;
    return nextFunc(obj, args, context, info);
  };
}

export const checkAuth = async (auth) => {
  const authHeader = auth.req.headers?.authorization;

  if (authHeader) {
    // Bearer ....
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const user: JwtPayload = await verifyToken(token);
        const accessToken = await UserTokenModel.findById(user.tokenId);
        if (!accessToken) throw makeGraphqlError('Invalid/Expired token', ErrorCodes.Unauthenticated);
        return user;
      } catch (err) {
        throw makeGraphqlError('Invalid/Expired token', ErrorCodes.Unauthenticated);
      }
    }
    throw makeGraphqlError("Authentication token must be 'Bearer [token]", ErrorCodes.Unauthenticated);
  }
  throw makeGraphqlError('Authorization header must be provided', ErrorCodes.Unauthenticated);
};

export const checkVerified = async (userId) => {
  const user = await UserModel.findById(userId);
  if (user.isConfirmed) return true;
  return false;
};

export const checkIsAdmin = async (userId) => {
  const user = await UserModel.findById(userId);
  if (user.role === RoleCodes.ADMIN) return true;
  return false;
};

export const checkPermissionAdminAndContentCreator = async (userId) => {
  const user = await UserModel.findById(userId);
  if (user.role === RoleCodes.USER) return false;
  return true;
};

export default {
  async process(
    req: express.Request & {
      auth?: { userId: string; user: User };
    },
    res: express.Response,
    next: express.NextFunction,
  ) {
    try {
      const xToken: string = req.headers['x-access-token'] as string;
      if (xToken && xToken.replace('Bearer ', '')) {
        return next();
      } else if (!req.headers.authorization || !req.headers.authorization.replace('Bearer ', '')) {
        return next();
      } else {
        const decodedToken = await verifyBearerToken(req.headers.authorization.replace('Bearer ', ''));
        if (decodedToken.type === JWTAuthTokenType.ID_TOKEN && decodedToken?.userId) {
          const user: User = (await UserModel.findById(decodedToken.userId).lean().exec()) as User;
          if (user) {
            req.auth = {
              userId: user._id.toString(),
              user,
            };
          }
        }
        return next();
      }
    } catch (e) {
      return next();
    }
  },
};

export const validateTokenForSubscription = async (idToken: string) => {
  const decodedToken = await verifyBearerToken(idToken.replace('Bearer ', ''));

  if (decodedToken.type === JWTAuthTokenType.ID_TOKEN && decodedToken && decodedToken.userId) {
    const user = await UserModel.findById(decodedToken.userId).lean().exec();
    if (user) {
      return {
        userId: user._id.toString(),
        user,
      };
    }
    return null;
  }
  throw new AuthenticationError('Decoded token failed!');
};
