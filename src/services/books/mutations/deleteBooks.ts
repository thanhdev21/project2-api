import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import BookModel from '@/models/book';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { JwtPayload } from 'jsonwebtoken';

export const deleteBook = requiredAuth<MutationResolvers['deleteBook']>(async (_, { id }, { auth }) => {
  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can delete book', ErrorCodes.Forbidden);
  }

  const book = await BookModel.findById(id);

  if (!book) {
    throw makeGraphqlError('Book does not exist!', ErrorCodes.BadUserInput);
  }

  book.deletedAt = new Date();

  await book.save();

  return true;
});
