import { SubscriptionOnCommentCreatedArgs, Comment, SubscriptionOnCommentUpdatedArgs } from '@graphql/types/generated-graphql-types';
import { withFilter } from 'graphql-subscriptions';
import { Events } from './events';
import { pubsub } from './index';

export const CommentCreatedPubsub = {
  publish: (comment: Comment) => pubsub.publish(Events.COMMENT_CREATED, comment),
  filteredSubscription: withFilter(
    () => pubsub.asyncIterator([Events.COMMENT_CREATED]),
    ({ bookId }: Comment, variables: SubscriptionOnCommentCreatedArgs) => {
      return bookId.toString() === variables.bookId.toString();
    },
  ),
  resolve: (comment: Comment) => comment,
};

export const CommentUpdatedPubsub = {
  publish: (comment: Comment) => pubsub.publish(Events.COMMENT_UPDATED, comment),
  filteredSubscription: withFilter(
    () => pubsub.asyncIterator([Events.COMMENT_UPDATED]),
    ({ bookId }: Comment, variables: SubscriptionOnCommentUpdatedArgs) => {
      return bookId.toString() === variables.bookId.toString();
    },
  ),
  resolve: (comment: Comment) => comment,
};

export const CommentDeletedPubsub = {
  publish: (comment: Comment) => pubsub.publish(Events.COMMENT_DELETED, comment),
  filteredSubscription: withFilter(
    () => pubsub.asyncIterator([Events.COMMENT_DELETED]),
    ({ bookId }: Comment, variables: SubscriptionOnCommentCreatedArgs) => {
      return bookId.toString() === variables.bookId.toString();
    },
  ),
  resolve: (comment: Comment) => comment,
};
