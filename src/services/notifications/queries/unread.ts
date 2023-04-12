import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';
import { getTotalNotificationUnread } from '@utils/notification';

export const getMyTotalUnreadNotifications = requiredAuth<QueryResolvers['getMyTotalUnreadNotifications']>(async (_, __, { auth }) => {
  const totalUnreadNotifications = await getTotalNotificationUnread(auth.userId);
  if (totalUnreadNotifications === 0) return 0;
  const unread = totalUnreadNotifications - (auth.user.totalReadNotifications || 0);
  if (unread <= 0) return 0;
  return unread;
});
