import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import { createFeature } from './createFeature';
import { deleteFeature } from './deleteFeature';
import { updateFeature } from './updateFeature';

export const featureMutation: MutationResolvers = {
  createFeature,
  deleteFeature,
  updateFeature,
};
