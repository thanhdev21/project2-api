import { checkAuth, checkIsAdmin, checkVerified, requiredAuth } from '@/middleware/auth';
import BookModel from '@/models/book';
import UserModel from '@/models/user';
import { ErrorCodes, QueryResolvers, User } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getUser = requiredAuth<QueryResolvers['getUser']>(async (_, { id }, { auth }) => {
  const isAdmin = await checkIsAdmin(auth.userId);

  if (!isAdmin) {
    throw makeGraphqlError('Only admin can read database!', ErrorCodes.Forbidden);
  }

  const user = await UserModel.findById(id).exec();

  if (!user) {
    throw makeGraphqlError('Book not found', ErrorCodes.BadUserInput);
  }

  return user as User;
});
