import { NotificationModel } from '@/models/notification';
import { Notifications, NotificationType, QueryResolvers, SystemNotificationTo, Notification } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';

export const getMyNotifications = requiredAuth<QueryResolvers['getMyNotifications']>(async (_, { pageSize, pageIndex, excludeIds }, { auth }) => {
  const limit = pageSize;
  const page = (pageIndex - 1) * pageSize;

  const conditions: any = {
    deletedAt: null,
    sent: true,
    excludedUserIds: { $nin: [auth.userId] },
    $or: [{ toUserId: auth.userId }, { systemNotificationTo: SystemNotificationTo.User }],
  };
  if (excludeIds && excludeIds.length > 0) {
    conditions._id = { $nin: excludeIds };
  }
  if (auth.user.unsubscribeNotificationTypes && auth.user.unsubscribeNotificationTypes.includes(NotificationType.System)) {
    conditions.type = { $ne: NotificationType.System };
  }

  const myNotifications = await NotificationModel.find(conditions).limit(limit).skip(page).sort({ sentAt: -1 }).exec();
  console.log('noti', myNotifications);

  const totalItem = await NotificationModel.countDocuments(conditions);
  const response: Notifications = {
    items: myNotifications as unknown as Notification[],
    paginate: {
      pageSize,
      pageIndex,
      totalItems: totalItem,
      totalPage: Math.ceil(totalItem / pageSize),
    },
  };
  return response;
});
