import { checkAuth, checkVerified, requiredAuth } from '@/middleware/auth';
import BookModel from '@/models/book';
import { Book, ErrorCodes, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getBook = <QueryResolvers['getBook']>(async (_, { id }, context) => {
  const book = await BookModel.findById(id)
    .populate([
      { path: 'categories', match: { deletedAt: null } },
      { path: 'coverPhoto', match: { deleteAt: null } },
      { path: 'content', match: { deleteAt: null }, model: 'Media' },
      'uploadedBy',
      {
        path: 'relatedBooks',
        populate: [
          { path: 'categories', match: { deletedAt: null }, model: 'Category' },
          { path: 'coverPhoto', match: { deleteAt: null }, model: 'Media' },
          { path: 'content', match: { deleteAt: null }, model: 'Media' },
          { path: 'uploadedBy', model: 'User' },
        ],
      },
    ])
    .exec();

  if (!book) {
    throw makeGraphqlError('Book not found', ErrorCodes.BadUserInput);
  }

  return book as unknown as Book;
});
