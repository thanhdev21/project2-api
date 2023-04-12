import UserModel from '@/models/user';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { dateNow } from '@utils/date';
import { makeGraphqlError } from '@utils/error';
import { JWTRefreshTokenPayload, verifyResetPasswordToken } from '@utils/jwt';
import bcrypt from 'bcrypt';

export const resetPassword: MutationResolvers['resetPassword'] = async (_, { token, password }) => {
  const resetPasswordTokenVerified: Omit<JWTRefreshTokenPayload, 'tokenId'> = await verifyResetPasswordToken(token);

  if (!resetPasswordTokenVerified) throw makeGraphqlError('Resetpassword token is invalid', ErrorCodes.GraphqlValidationFailed);

  if (!password) throw makeGraphqlError('Password is required', ErrorCodes.BadUserInput);

  if (password.length < 6) throw makeGraphqlError('Password must be at least 6 characters', ErrorCodes.BadUserInput);

  const user = await UserModel.findById(resetPasswordTokenVerified.userId);

  if (!user) throw makeGraphqlError('User not found', ErrorCodes.Forbidden);

  if (user.resetPasswordToken !== token) throw makeGraphqlError('Resetpassword token is invalid', ErrorCodes.GraphqlValidationFailed);

  if (user.resetPasswordTokenExpiredAt < dateNow()) throw makeGraphqlError('Resetpassword expired', ErrorCodes.TokenExpire);

  const newPassword = await bcrypt.hash(password, 12);

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiredAt = null;
  await user.save();
  return true;
};
