import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getAllPublishers } from './getAllPublishers';
import { getPublisher } from './getPublisher';

export const publisherQuery: QueryResolvers = {
  getAllPublishers,
  getPublisher,
};
