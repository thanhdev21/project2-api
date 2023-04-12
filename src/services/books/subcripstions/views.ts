import { SubscriptionResolvers } from '@graphql/types/generated-graphql-types';
import { ViewCreatedPubsub } from '@/pubsubs/view';

export const onViewed: SubscriptionResolvers['onViewed'] = {
  subscribe: async (parent, args, context, info) => ({
    [Symbol.asyncIterator]: () => {
      return ViewCreatedPubsub.filteredSubscription(parent, args, context, info);
    },
  }),
  resolve: ViewCreatedPubsub.resolve,
};
