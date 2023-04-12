import { checkAuth, checkVerified, requiredAuth } from '@/middleware/auth';
import AuthorModel from '@/models/author';
import { Author, ErrorCodes, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getAuthor = requiredAuth<QueryResolvers['getAuthor']>(async (_, { id }, { auth }) => {
  const isVerified = await checkVerified(auth.userId);

  if (!isVerified) {
    throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  }

  const author = await AuthorModel.findById(id)
    .populate([{ path: 'avatar', match: { deleteAt: null }, model: 'Media' }])
    .exec();

  if (!author) {
    throw makeGraphqlError('Author not found', ErrorCodes.BadUserInput);
  }

  return author as unknown as Author;
});
