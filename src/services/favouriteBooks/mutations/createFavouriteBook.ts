import { checkAuth, requiredAuth } from '@/middleware/auth';
import BookModel from '@/models/book';
import FavouriteBookModel from '@/models/favouriteBook';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { validatorFavourite } from '@utils/validators';

export const createFavouriteBook = requiredAuth<MutationResolvers['createFavouriteBook']>(async (_, { input }, { auth }) => {
  const { bookId } = input;
  const { isValid, error } = validatorFavourite(input);
  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }
  const book = await BookModel.findById(bookId).exec();
  const favouriteBook = await FavouriteBookModel.find({ book: bookId }).exec();

  if (favouriteBook.length > 0) {
    throw makeGraphqlError('Book has been added to favourites', ErrorCodes.BadUserInput);
  }
  const newFavouriteBook = new FavouriteBookModel({
    favouriteBy: auth.userId,
    book: book,
  });
  await newFavouriteBook.save();
  return true;
});
