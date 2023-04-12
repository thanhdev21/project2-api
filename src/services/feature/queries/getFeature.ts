import { checkAuth, checkVerified, requiredAuth } from '@/middleware/auth';
import BookModel from '@/models/book';
import FeatureModel from '@/models/feature';
import { ErrorCodes, Feature, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

export const getFeature = requiredAuth<QueryResolvers['getFeature']>(async (_, { id }, context) => {
  const feature = await FeatureModel.findById(id)
    .populate([
      {
        path: 'books',
        populate: [
          { path: 'categories', match: { deletedAt: null }, model: 'Category' },
          { path: 'coverPhoto', match: { deleteAt: null }, model: 'Media' },
          { path: 'content', match: { deleteAt: null }, model: 'Media' },
          { path: 'uploadedBy', model: 'User' },
        ],
        match: { deletedAt: null },
      },
      { path: 'coverPhoto', match: { deleteAt: null } },
    ])
    .exec();

  if (!feature) {
    throw makeGraphqlError('Feature not found', ErrorCodes.BadUserInput);
  }

  return feature as unknown as Feature;
});
