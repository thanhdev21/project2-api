import { NotificationModel } from '@/models/notification';
import { NotificationType, QueryResolvers, Notification } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';

export const getSystemNotifications = requiredAuth<QueryResolvers['getSystemNotifications']>(async (_, __, { auth, loaders }) => {
  const conditions: any = {
    type: NotificationType.System,
    deletedAt: null,
  };
  let queryBuilder = NotificationModel.find(conditions);
  queryBuilder = queryBuilder.sort({ sentAt: -1 }).lean();
  return queryBuilder.exec() as unknown as Notification[];
});
