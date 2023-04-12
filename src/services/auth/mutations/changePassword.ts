import UserModel from '@/models/user';
import { ErrorCodes, MutationResolvers, RoleCodes } from '@graphql/types/generated-graphql-types';
import { checkAuth, requiredAuth } from '@middleware/auth';
import { dateNow } from '@utils/date';
import { makeGraphqlError } from '@utils/error';
import { validatorChangePassword } from '@utils/validators';
import bcrypt from 'bcrypt';

export const changePassword = requiredAuth<MutationResolvers['changePassword']>(async (_, { input }, { auth }) => {
  const { oldPassword, newPassword } = input;
  const { isValid, error } = validatorChangePassword(input);
  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const me = await UserModel.findById(auth.userId).exec();

  const comparePassword = await bcrypt.compare(oldPassword, me.password);
  if (!comparePassword) {
    throw makeGraphqlError('old password is not correct!', ErrorCodes.BadUserInput);
  }
  const newPasswordBcrypt = await bcrypt.hash(newPassword, 12);
  me.password = newPasswordBcrypt;
  await me.save();
  return true;
});
