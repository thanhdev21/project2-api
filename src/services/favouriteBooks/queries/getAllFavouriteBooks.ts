import { checkAuth, requiredAuth } from '@/middleware/auth';
import FavouriteBookModel from '@/models/favouriteBook';
import { QueryResolvers, FavouriteBooks, FavouriteBook } from '@graphql/types/generated-graphql-types';

export const getAllFavouriteBooks = requiredAuth<QueryResolvers['getAllFavouriteBooks']>(async (_, { pageIndex, pageSize }, { auth }) => {
  const limit = pageSize;
  const page = (pageIndex - 1) * pageSize;
  const response = await FavouriteBookModel.find({ favouriteBy: auth.userId })
    .limit(limit)
    .skip(page)
    .sort({ createdAt: 'desc' })
    .populate([
      {
        path: 'book',
        match: { deletedAt: null },
        populate: [
          { path: 'categories', match: { deletedAt: null }, model: 'Category' },
          { path: 'coverPhoto', match: { deleteAt: null }, model: 'Media' },
          { path: 'content', match: { deleteAt: null }, model: 'Media' },
          { path: 'uploadedBy', model: 'User' },
        ],
      },
    ])
    .exec();
  const totalItem = await FavouriteBookModel.find({ favouriteBy: auth.userId }).count();
  const FavouriteBook: FavouriteBooks = {
    items: response as unknown as FavouriteBook[],
    paginate: {
      pageSize,
      pageIndex,
      totalItems: totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
    },
  };

  return FavouriteBook;
});
