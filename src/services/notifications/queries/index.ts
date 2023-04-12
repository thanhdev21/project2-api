import { getNotificationTypes } from './types';
import { getMyNotifications } from './mine';
import { getMyTotalUnreadNotifications } from './unread';
import { getSystemNotifications } from './system';
import { QueryResolvers } from '@graphql/types/generated-graphql-types';

export const notificationQueries: QueryResolvers = {
  getNotificationTypes,
  getSystemNotifications,
  getMyNotifications,
  getMyTotalUnreadNotifications,
};
