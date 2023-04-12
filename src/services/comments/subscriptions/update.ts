import { SubscriptionResolvers } from '@graphql/types/generated-graphql-types';
import { CommentUpdatedPubsub } from '@pubsubs/comment';

export const onCommentUpdated: SubscriptionResolvers['onCommentUpdated'] = {
  subscribe: async (parent, args, context, info) => ({
    [Symbol.asyncIterator]: () => {
      return CommentUpdatedPubsub.filteredSubscription(parent, args, context, info);
    },
  }),
  resolve: CommentUpdatedPubsub.resolve,
};
