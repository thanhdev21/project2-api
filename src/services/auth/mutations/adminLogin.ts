import UserModel from '@/models/user';
import { ErrorCodes, MutationResolvers, RoleCodes, User } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { buildJWTResponse } from '@utils/jwt';
import { validatorLogin } from '@utils/validators';
import bcrypt from 'bcrypt';

export const adminLogin: MutationResolvers['adminLogin'] = async (_, { input }) => {
  const { email, password } = input;
  const { isValid, error } = validatorLogin(input);
  const user = await UserModel.findOne({ email: email.toLowerCase() });

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  if (!user) {
    throw makeGraphqlError('User does not already exist!', ErrorCodes.GraphqlValidationFailed);
  }

  if (user.role === RoleCodes.USER) {
    throw makeGraphqlError('User does not already exist!', ErrorCodes.GraphqlValidationFailed);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw makeGraphqlError('Wrong password!', ErrorCodes.BadUserInput);
  }

  const response = await buildJWTResponse(user as User);

  return response;
};
