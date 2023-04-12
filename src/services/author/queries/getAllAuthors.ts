import AuthorModel from '@/models/author';
import { Author, Authors, QueryResolvers } from '@graphql/types/generated-graphql-types';

export const getAllAuthors: QueryResolvers['getAllAuthors'] = async (_, { pageSize, pageIndex, search }, context) => {
  // const auth = await checkAuth(context);

  // const isVerified = await checkVerified(auth.userId);

  // if (!isVerified) {
  //   throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  // }
  const limit = pageSize;
  const page = (pageIndex - 1) * pageSize;

  const conditions: any = {};
  conditions.deletedAt = null;

  const response = await AuthorModel.find({ $or: [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }], ...conditions })
    .populate([{ path: 'avatar', match: { deleteAt: null }, model: 'Media' }])
    .limit(limit)
    .skip(page)
    .sort({ createdAt: 'desc' })
    .exec();

  const totalItem = await AuthorModel.count({ $or: [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }], ...conditions });

  const authors: Authors = {
    items: response as unknown as Author[],
    paginate: {
      pageSize,
      pageIndex,
      totalItems: totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
    },
  };

  return authors;
};
