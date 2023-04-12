import UserTokenModel from '@/models/userToken';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { verifyRefreshToken } from '@utils/jwt';

export const logout: MutationResolvers['logout'] = async (_, { refreshToken }) => {
  const refreshTokenDecoded = await verifyRefreshToken(refreshToken);
  if (!refreshTokenDecoded) throw makeGraphqlError('refresh token is invalid', ErrorCodes.GraphqlValidationFailed);
  const exists = await UserTokenModel.exists({ _id: refreshTokenDecoded.tokenId });
  if (!exists) throw makeGraphqlError('Refresh token is invalid!', ErrorCodes.Forbidden);
  await UserTokenModel.findByIdAndDelete(refreshTokenDecoded.tokenId);
  return true;
};
