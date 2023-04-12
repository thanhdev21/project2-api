import BookModel from '@/models/book';
import { Book, Books, QueryResolvers } from '@graphql/types/generated-graphql-types';
import dayjs from 'dayjs';

export const getNewBookList: QueryResolvers['getNewBookList'] = async (_, { pageIndex, pageSize, search, filter }, context) => {
  const limit = pageSize;
  const page = (pageIndex - 1) * pageSize;

  const conditions: any = {};
  conditions.deletedAt = null;
  if (filter) {
    if (filter.categories) conditions.categories = { $in: filter.categories };
  }

  const response = await BookModel.find({
    $or: [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }],
    releasedDate: {
      $gte: dayjs().subtract(30, 'day').toDate(),
    },
    ...conditions,
  })
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
    .limit(limit)
    .skip(page)
    .sort({ releasedDate: 'desc' })
    .exec();

  const totalItem = await BookModel.count({
    $or: [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }],
    releasedDate: {
      $gte: dayjs().subtract(30, 'day').toDate(),
    },
    ...conditions,
  }).populate([
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
  ]);

  const books: Books = {
    items: response as unknown as Book[],
    paginate: {
      pageSize,
      pageIndex,
      totalItems: totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
    },
  };
  return books;
};
