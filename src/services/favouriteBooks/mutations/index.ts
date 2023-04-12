import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import { createFavouriteBook } from './createFavouriteBook';
import { deleteFavouriteBook } from './deleteFavouriteBook';

export const favouriteListMutation: MutationResolvers = {
  createFavouriteBook,
  deleteFavouriteBook,
};
