import { SubscriptionResolvers } from '@graphql/types/generated-graphql-types';
import { CommentCreatedPubsub } from '@pubsubs/comment';

export const onCommentCreated: SubscriptionResolvers['onCommentCreated'] = {
  subscribe: async (parent, args, context, info) => ({
    [Symbol.asyncIterator]: () => {
      return CommentCreatedPubsub.filteredSubscription(parent, args, context, info);
    },
  }),
  resolve: CommentCreatedPubsub.resolve,
};
