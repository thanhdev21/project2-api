import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { validatorCreateCategory } from '@utils/validators';
import { JwtPayload } from 'jsonwebtoken';

export const createCategory = requiredAuth<MutationResolvers['createCategory']>(async (_, { input }, { auth }) => {
  const { name, description } = input;
  const { isValid, error } = validatorCreateCategory(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can create category', ErrorCodes.Forbidden);
  }

  const category = await CategoryModel.findOne({ name, deletedAt: null });

  if (category) {
    throw makeGraphqlError('Category is already exist!', ErrorCodes.BadUserInput);
  }

  const newCategory = new CategoryModel({
    name,
    description,
  });
  await newCategory.save();

  return newCategory;
});
