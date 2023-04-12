import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import AuthorModel from '@/models/author';
import CategoryModel from '@/models/category';

import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { JwtPayload } from 'jsonwebtoken';

export const deleteAuthor = requiredAuth<MutationResolvers['deleteAuthor']>(async (_, { id }, { auth }) => {
  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can update author', ErrorCodes.Forbidden);
  }

  const author = await AuthorModel.findById(id);

  if (!author) {
    throw makeGraphqlError('Category does not exist!', ErrorCodes.BadUserInput);
  }
  author.deletedAt = new Date();

  await author.save();

  return true;
});
