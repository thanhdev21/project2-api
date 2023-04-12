import { checkAuth, checkIsAdmin, requiredAuth } from '@/middleware/auth';
import UserModel from '@/models/user';
import { ErrorCodes, MutationResolvers, User } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { JwtPayload } from 'jsonwebtoken';

export const updateUserStatus = requiredAuth<MutationResolvers['updateUserStatus']>(async (_, { id, input }, { auth }) => {
  const isAdmin = checkIsAdmin(auth.userId);

  if (!isAdmin) {
    throw makeGraphqlError('Only admin can update user status', ErrorCodes.Forbidden);
  }

  const user = await UserModel.findById(id);

  user.status = input.status;

  await user.save();

  return user as User;
});
