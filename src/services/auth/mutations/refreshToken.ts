import UserModel from '@/models/user';
import UserTokenModel from '@/models/userToken';
import { ErrorCodes, MutationResolvers, User } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { buildJWTResponse, JWTRefreshTokenPayload, verifyRefreshToken } from '@utils/jwt';

export const refreshToken: MutationResolvers['refreshToken'] = async (_, { refreshToken }) => {
  const f5TokenVerified: JWTRefreshTokenPayload = await verifyRefreshToken(refreshToken);

  if (!f5TokenVerified) throw makeGraphqlError('refresh token is invalid', ErrorCodes.GraphqlValidationFailed);

  const accessToken = await UserTokenModel.findById(f5TokenVerified.tokenId);

  const user = await UserModel.findById(f5TokenVerified.userId);

  if (!user) throw makeGraphqlError('User does not exist, register and try again', ErrorCodes.Forbidden);

  if (!accessToken) throw makeGraphqlError('User is not register', ErrorCodes.GraphqlValidationFailed);

  await accessToken.deleteOne();

  const response = await buildJWTResponse(user as User);

  return response;
};
