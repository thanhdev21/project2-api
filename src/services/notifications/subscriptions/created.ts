import { SubscriptionResolvers } from '@graphql/types/generated-graphql-types';
import { NotificationCreatedPubsub } from '@pubsubs/notification';

export const onReceivedUserNotification: SubscriptionResolvers['onReceivedUserNotification'] = {
  subscribe: async (parent, args, context, info) => ({
    [Symbol.asyncIterator]: () => {
      console.log('context', context);
      return NotificationCreatedPubsub.filteredForUserSubscription(parent, args, context, info);
    },
  }),
  resolve: NotificationCreatedPubsub.resolve,
};
