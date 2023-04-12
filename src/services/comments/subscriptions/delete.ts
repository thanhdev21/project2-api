import { SubscriptionResolvers } from '@graphql/types/generated-graphql-types';
import { CommentDeletedPubsub } from '@pubsubs/comment';

export const onCommentDeleted: SubscriptionResolvers['onCommentDeleted'] = {
  subscribe: async (parent, args, context, info) => ({
    [Symbol.asyncIterator]: () => {
      return CommentDeletedPubsub.filteredSubscription(parent, args, context, info);
    },
  }),
  resolve: CommentDeletedPubsub.resolve,
};
