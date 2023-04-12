import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getAllFavouriteBooks } from './getAllFavouriteBooks';
import { checkIsFavouriteBook } from './checkIsFavouriteBook';

export const favouriteBooksQueries: QueryResolvers = {
  getAllFavouriteBooks,
  checkIsFavouriteBook,
};
