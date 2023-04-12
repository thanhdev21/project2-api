import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import PublisherModel from '@/models/publisher';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { JwtPayload } from 'jsonwebtoken';

export const deletePublisher = requiredAuth<MutationResolvers['deletePublisher']>(async (_, { id }, { auth }) => {
  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can update publisher', ErrorCodes.Forbidden);
  }

  const publisher = await PublisherModel.findById(id);

  if (!publisher) {
    throw makeGraphqlError('Category does not exist!', ErrorCodes.BadUserInput);
  }
  publisher.deletedAt = new Date();

  await publisher.save();

  return true;
});
