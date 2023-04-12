import { checkAuth, checkVerified } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import { Categories, ErrorCodes, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getAllCategories: QueryResolvers['getAllCategories'] = async (_, { pageSize, pageIndex, search }, context) => {
  // const auth = await checkAuth(context);

  // const isVerified = await checkVerified(auth.userId);

  // if (!isVerified) {
  //   throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  // }
  const limit = pageSize;
  const page = (pageIndex - 1) * pageSize;

  const conditions: any = {};
  conditions.deletedAt = null;

  const response = await CategoryModel.find({ $or: [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }], ...conditions })
    .limit(limit)
    .skip(page)
    .sort({ createdAt: 'desc' })
    .exec();

  const totalItem = await CategoryModel.count({ $or: [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }], ...conditions });

  const categories: Categories = {
    items: response,
    paginate: {
      pageSize,
      pageIndex,
      totalItems: totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
    },
  };

  return categories;
};
