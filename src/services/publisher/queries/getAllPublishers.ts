import PublisherModel from '@/models/publisher';
import { Publishers, QueryResolvers } from '@graphql/types/generated-graphql-types';

export const getAllPublishers: QueryResolvers['getAllPublishers'] = async (_, { pageSize, pageIndex, search }, context) => {
  // const auth = await checkAuth(context);

  // const isVerified = await checkVerified(auth.userId);

  // if (!isVerified) {
  //   throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  // }
  const limit = pageSize;
  const page = (pageIndex - 1) * pageSize;

  const conditions: any = {};
  conditions.deletedAt = null;

  const response = await PublisherModel.find({ $or: [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }, { address: new RegExp(search, 'i') }], ...conditions })
    .populate([{ path: 'logo', match: { deleteAt: null }, model: 'Media' }])
    .limit(limit)
    .skip(page)
    .sort({ createdAt: 'desc' })
    .exec();

  const totalItem = await PublisherModel.count({ $or: [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }, { address: new RegExp(search, 'i') }], ...conditions });

  const publishers: Publishers = {
    items: response,
    paginate: {
      pageSize,
      pageIndex,
      totalItems: totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
    },
  };

  return publishers;
};
