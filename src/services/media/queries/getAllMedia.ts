import { checkAuth, checkVerified, requiredAuth } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import { MediaModel } from '@/models/media';
import { Categories, ErrorCodes, Media, Medias, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getAllMedia = requiredAuth<QueryResolvers['getAllMedia']>(async (_, { pageSize, pageIndex }, { auth }) => {
  const isVerified = await checkVerified(auth.userId);

  if (!isVerified) {
    throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  }
  const limit = pageSize;
  const page = (pageIndex - 1) * pageSize;

  const conditions: any = {};
  conditions.deletedAt = null;

  const response = await MediaModel.find({ ...conditions })
    .limit(limit)
    .skip(page)
    .sort({ createdAt: 'desc' })
    .exec();

  const totalItem = await MediaModel.count({ ...conditions });

  const categories: Medias = {
    items: response as unknown as Media[],
    paginate: {
      pageSize,
      pageIndex,
      totalItems: totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
    },
  };

  return categories;
});
