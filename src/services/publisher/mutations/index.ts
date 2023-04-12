import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import { createPublisher } from './createPublisher';
import { deletePublisher } from './deletePublisher';
import { updatePublisher } from './updatePublisher';

export const publisherMutation: MutationResolvers = {
  createPublisher,
  updatePublisher,
  deletePublisher,
};
