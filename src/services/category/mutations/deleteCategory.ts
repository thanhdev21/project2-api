import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { JwtPayload } from 'jsonwebtoken';

export const deleteCategory = requiredAuth<MutationResolvers['deleteCategory']>(async (_, { id }, { auth }) => {
  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can update category', ErrorCodes.Forbidden);
  }

  const category = await CategoryModel.findById(id);

  if (!category) {
    throw makeGraphqlError('Category does not exist!', ErrorCodes.BadUserInput);
  }
  category.deletedAt = new Date();

  await category.save();

  return true;
});
