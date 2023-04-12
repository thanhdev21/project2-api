import FeatureModel from '@/models/feature';
import { Feature, QueryResolvers } from '@graphql/types/generated-graphql-types';

export const getAllFeatures: QueryResolvers['getAllFeatures'] = async (_, __, context) => {
  const conditions: any = {};
  conditions.deletedAt = null;

  const response = await FeatureModel.find({ ...conditions })
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
      {
        path: 'coverPhoto',

        match: { deleteAt: null },
      },
    ])
    .sort({ createdAt: 'desc' })
    .exec();

  return response as unknown as Feature[];
};
