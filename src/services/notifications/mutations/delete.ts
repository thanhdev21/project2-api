import { ForbiddenError } from 'apollo-server-express';

import { getTotalNotificationUnread } from '@utils/notification';
import { asyncForEach } from '@utils/helpers';
import { requiredAuth } from '@middleware/auth';
import { MutationResolvers, NotificationType, RoleCodes, SystemNotificationTo, Notification } from '@graphql/types/generated-graphql-types';
import { NotificationModel } from '@/models/notification';
import UserModel from '@/models/user';

export const deleteSystemNotification = requiredAuth<MutationResolvers['deleteSystemNotification']>(async (_, { _id }, { auth }) => {
  if (auth.user.role !== RoleCodes.ADMIN) throw new ForbiddenError('Permission denied!');
  await NotificationModel.deleteOne({ _id });
  return true;
});

export const deleteMyNotification = requiredAuth<MutationResolvers['deleteMyNotification']>(async (_, { _id, all }, { auth }) => {
  if (all) {
    await NotificationModel.deleteMany({ toUserId: auth.userId });
    await NotificationModel.updateMany({ type: NotificationType.System, systemNotificationTo: SystemNotificationTo.User }, { $addToSet: { excludedUserIds: auth.userId } });
    const totalUnread = await getTotalNotificationUnread(auth.userId);
    await UserModel.updateOne({ _id: auth.userId }, { $set: { totalReadNotifications: totalUnread } });
    return true;
  }
  const notification: Notification = (await NotificationModel.findById(_id).lean().exec()) as Notification;
  if (notification.type === NotificationType.System) {
    await NotificationModel.updateOne({ _id }, { $addToSet: { excludedUserIds: auth.userId } });
    return true;
  }
  if (notification.toUserId.toString() !== auth.userId.toString()) throw new ForbiddenError('Permission denied!');
  await NotificationModel.deleteOne({ _id, toUserId: notification.toUserId });
  return true;
});
