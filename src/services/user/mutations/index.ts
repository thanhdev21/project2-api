import { MutationResolvers, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { updateUserStatus } from './updateUserStatus';

export const userMutations: MutationResolvers = {
  updateUserStatus,
};
