import { NotificationResolvers } from '@graphql/types/generated-graphql-types';

export const Notification: NotificationResolvers = {
  toUser: (notification, _, { loaders }) => {
    return notification.toUserId ? loaders.users.load(notification.toUserId) : null;
  },
  forComment: (notification, _, { loaders }) => {
    return notification.forCommentId ? loaders.comments.load(notification.forCommentId) : null;
  },
};
