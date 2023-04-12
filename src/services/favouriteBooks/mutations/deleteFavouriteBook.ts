import { checkAuth, requiredAuth } from '@/middleware/auth';
import FavouriteBookModel from '@/models/favouriteBook';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { validatorFavourite } from '@utils/validators';

export const deleteFavouriteBook = requiredAuth<MutationResolvers['deleteFavouriteBook']>(async (_, { input }) => {
  const { bookId } = input;
  const { isValid, error } = validatorFavourite(input);
  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }
  const result = await FavouriteBookModel.findOneAndRemove({ book: bookId }).exec();
  if (!result) {
    throw makeGraphqlError('Books do not exist in favourites', ErrorCodes.BadUserInput);
  }
  return true;
});
