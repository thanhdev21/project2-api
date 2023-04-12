import { checkAuth, checkPermissionAdminAndContentCreator, checkVerified, requiredAuth } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import { ErrorCodes, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getCategory = requiredAuth<QueryResolvers['getCategory']>(async (_, { id }, { auth }) => {
  const isVerified = await checkVerified(auth.userId);

  if (!isVerified) {
    throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  }

  const category = await CategoryModel.findById(id).exec();

  if (!category) {
    throw makeGraphqlError('Category not found', ErrorCodes.BadUserInput);
  }

  return category;
});
