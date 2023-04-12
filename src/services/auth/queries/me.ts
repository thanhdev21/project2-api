import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import UserModel from '@/models/user';
import { ErrorCodes, QueryResolvers, User } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getMe = requiredAuth<QueryResolvers['me']>(async (_, __, { auth }) => {
  const me = await UserModel.findById(auth.userId).exec();

  if (!me) {
    throw makeGraphqlError('User not found', ErrorCodes.BadUserInput);
  }

  return me as User;
});
