import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getAllBooks } from './getAllBooks';
import { getBook } from './getBook';
import { getBookByRank } from './getBookByRank';
import { getNewBookList } from './getNewBookList';

export const bookQueries: QueryResolvers = {
  getAllBooks,
  getBook,
  getBookByRank,
  getNewBookList,
};
