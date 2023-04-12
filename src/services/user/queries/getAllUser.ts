import { checkAuth, checkIsAdmin, requiredAuth } from '@/middleware/auth';
import UserModel from '@/models/user';
import { ErrorCodes, QueryResolvers, User, Users } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getAllUsers = requiredAuth<QueryResolvers['getAllUsers']>(async (_, { pageIndex, pageSize, filter, search }, { auth }) => {
  const limit = pageSize;
  const page = (pageIndex - 1) * pageSize;

  const isAdmin = await checkIsAdmin(auth.userId);

  if (!isAdmin) {
    throw makeGraphqlError('Only admin can read database!', ErrorCodes.Forbidden);
  }
  const conditions: any = {};
  conditions.deletedAt = null;
  if (filter) {
    if (filter.status) conditions.status = filter.status;
  }

  const response = await UserModel.find({ role: 2, ...conditions, $or: [{ email: new RegExp(search, 'i') }, { firstName: new RegExp(search, 'i') }, { lastName: new RegExp(search, 'i') }] })
    .limit(limit)
    .skip(page)
    .sort({ createdAt: 'desc' })
    .exec();
  const totalItem = await UserModel.find({ role: 2, ...conditions, $or: [{ email: new RegExp(search, 'i') }, { firstName: new RegExp(search, 'i') }, { lastName: new RegExp(search, 'i') }] }).count();

  const users: Users = {
    items: response as User[],
    paginate: {
      pageSize,
      pageIndex,
      totalItems: totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
    },
  };

  return users;
});
