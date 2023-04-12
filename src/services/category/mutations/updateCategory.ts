import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { validatorUpdateCategory } from '@utils/validators';
import { JwtPayload } from 'jsonwebtoken';

export const updateCategory = requiredAuth<MutationResolvers['updateCategory']>(async (_, { id, input }, { auth }) => {
  const { name, description } = input;
  const { isValid, error } = validatorUpdateCategory(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can update category', ErrorCodes.Forbidden);
  }

  const category = await CategoryModel.findById(id);

  if (!category) {
    throw makeGraphqlError('Category does not exist!', ErrorCodes.BadUserInput);
  }

  if (category.name === name && category.id !== id) {
    throw makeGraphqlError('Category already exist!', ErrorCodes.BadUserInput);
  }

  category.name = name;
  category.description = description;
  await category.save();

  return category;
});
