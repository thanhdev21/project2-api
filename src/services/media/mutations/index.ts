import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import { uploadMedia } from './uploadMedia';

export const mediaMutation: MutationResolvers = {
  uploadMedia,
};
