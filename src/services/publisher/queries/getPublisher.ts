import { checkAuth, checkPermissionAdminAndContentCreator, checkVerified, requiredAuth } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import PublisherModel from '@/models/publisher';
import { ErrorCodes, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getPublisher = requiredAuth<QueryResolvers['getPublisher']>(async (_, { id }, { auth }) => {
  const isVerified = await checkVerified(auth.userId);

  if (!isVerified) {
    throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  }

  const publisher = await PublisherModel.findById(id)
    .populate([{ path: 'logo', match: { deleteAt: null }, model: 'Media' }])
    .exec();

  if (!publisher) {
    throw makeGraphqlError('Publisher not found', ErrorCodes.BadUserInput);
  }

  return publisher;
});
