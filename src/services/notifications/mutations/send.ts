import { NotificationModel } from '@/models/notification';
import UserModel from '@/models/user';
import { MutationResolvers, RoleCodes, Notification, NotificationType, SystemNotificationTo } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';
import { NotificationCreatedPubsub } from '@pubsubs/notification';
import { ForbiddenError, UserInputError } from 'apollo-server-express';

export const sendSystemNotification = requiredAuth<MutationResolvers['sendSystemNotification']>(async (_, { _id }, { auth }) => {
  if (auth.user.role !== RoleCodes.ADMIN) throw new ForbiddenError('Permission denied!');
  console.log('auth', auth);

  const notification: Notification = (await NotificationModel.findById(_id).lean().exec()) as Notification;
  if (!notification || notification.type !== NotificationType.System) throw new UserInputError('Notification not found!');
  if (notification.systemNotificationTo === SystemNotificationTo.User) {
    const userConditions: any = {};
    if (notification.excludedUserIds && notification.excludedUserIds.length > 0) {
      userConditions._id = { $nin: notification.excludedUserIds };
    }
    await UserModel.updateMany(userConditions, { $addToSet: { unreadSystemNoticeIds: _id } }, { multi: true });
  }
  await NotificationModel.updateOne({ _id }, { $set: { sent: true, sentAt: new Date() } });
  NotificationCreatedPubsub.publish(notification);
  return true;
});
