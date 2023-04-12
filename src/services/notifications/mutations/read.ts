import { ForbiddenError } from 'apollo-server-express';
import { decreaseUserTotalReadNotifications, getTotalNotificationUnread } from '@utils/notification';
import { requiredAuth } from '@middleware/auth';
import { MutationResolvers, NotificationType, Notification } from '@graphql/types/generated-graphql-types';
import UserModel from '@/models/user';
import { NotificationModel } from '@/models/notification';
import { checkTermContent } from '@utils/check-content-term';

export const markNotificationAsRead = requiredAuth<MutationResolvers['markNotificationAsRead']>(async (_, { _id, type }, { auth, loaders }) => {
  if (type === NotificationType.System) {
    await UserModel.updateOne({ _id: auth.userId }, { $pull: { unreadSystemNoticeIds: _id } });
  }
  const notification: Notification = (await NotificationModel.findById(_id).lean().exec()) as Notification;

  const toUser = await loaders.users.load(notification.toUserId);
  checkTermContent(toUser);
  await decreaseUserTotalReadNotifications(notification.toUserId);

  await NotificationModel.updateOne({ _id }, { $set: { read: true } });
  return true;
});

export const resetMyTotalNotificationUnread = requiredAuth<MutationResolvers['resetMyTotalNotificationUnread']>(async (_, __, { auth, loaders }) => {
  const totalUnread = await getTotalNotificationUnread(auth.userId);
  await UserModel.updateOne({ _id: auth.userId }, { $set: { totalReadNotifications: totalUnread } });
  return true;
});
