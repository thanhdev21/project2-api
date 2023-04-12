import { SubscriptionResolvers } from '@graphql/types/generated-graphql-types';
import { onViewed } from './views';

export const bookSubcriptions: SubscriptionResolvers = {
  onViewed,
};
