import BookModel from '@/models/book';
import { Books, Period, QueryResolvers } from '@graphql/types/generated-graphql-types';
import dayjs from 'dayjs';

export const getBookByRank: QueryResolvers['getBookByRank'] = async (_, { pageIndex, pageSize, search, filter }, context) => {
  // const auth = await checkAuth(context);

  const limit = pageSize;
  const page = (pageIndex - 1) * pageSize;

  // const isVerified = await checkVerified(auth.userId);

  // if (!isVerified) {
  //   throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  // }

  const conditions: any = {};
  const viewConditions: any = {};

  conditions.deletedAt = null;
  if (filter) {
    if (filter.bookType) conditions.bookType = filter.bookType;
    console.log('DAY', new Date(dayjs().startOf('day').unix() * 1000), new Date(dayjs().endOf('day').unix() * 1000));

    if (filter.period === Period.Day) viewConditions.viewAt = { $gte: new Date(dayjs().startOf('day').unix() * 1000), $lt: new Date(dayjs().endOf('day').unix() * 1000) };
    if (filter.period === Period.Week) viewConditions.viewAt = { $gte: new Date(dayjs().startOf('week').unix() * 1000), $lt: new Date(dayjs().endOf('week').unix() * 1000) };
    if (filter.period === Period.Month) viewConditions.viewAt = { $gte: new Date(dayjs().startOf('month').unix() * 1000), $lt: new Date(dayjs().endOf('month').unix() * 1000) };
  }

  const response = await BookModel.aggregate([
    {
      $lookup: {
        from: 'View',
        localField: '_id',
        foreignField: 'bookId',
        as: 'views',
        pipeline: [
          {
            $match: {
              ...viewConditions,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'Media',
        localField: 'content',
        foreignField: '_id',
        as: 'content',
        pipeline: [
          {
            $match: {
              deletedAt: null,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'Category',
        localField: 'categories',
        foreignField: '_id',
        as: 'categories',
        pipeline: [
          {
            $match: {
              deletedAt: null,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'Media',
        localField: 'coverPhoto',
        foreignField: '_id',
        as: 'coverPhoto',
        pipeline: [
          {
            $match: {
              deletedAt: null,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'User',
        localField: 'uploadedBy',
        foreignField: '_id',
        as: 'uploadedBy',
      },
    },
    {
      $lookup: {
        from: 'Book',
        localField: 'relatedBooks',
        foreignField: '_id',
        as: 'relatedBooks',
        pipeline: [
          {
            $match: {
              deletedAt: null,
            },
          },
        ],
      },
    },
    { $unwind: '$content' },
    { $unwind: '$uploadedBy' },
    { $unwind: '$coverPhoto' },
    {
      $addFields: { views: { $size: '$views' } },
    },
    {
      $match: {
        $or: [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }],
        ...conditions,
      },
    },
  ])
    .sort({ views: 'desc' })
    .limit(100)
    .skip(page)
    .exec();

  const totalItem = await BookModel.count({ $or: [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }], ...conditions });

  const books: Books = {
    items: response,
    paginate: {
      pageSize,
      pageIndex,
      totalItems: totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
    },
  };

  return books;
};
