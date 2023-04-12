import { NotificationModel } from '@/models/notification';
import UserModel from '@/models/user';
import { MutationResolvers, NotificationType, RoleCodes, SystemNotificationTo, Notification } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';
import { validateObjectIds } from '@utils/database';
import { ForbiddenError } from 'apollo-server-express';
import { ObjectId } from 'mongodb';

export const createSystemNotification = requiredAuth<MutationResolvers['createSystemNotification']>(async (_, { data }, { auth }) => {
  if (auth.user.role !== RoleCodes.ADMIN) throw new ForbiddenError('Permission denied!');
  if (data.excludedUserIds) {
    await validateObjectIds(UserModel, data.excludedUserIds);
    data.excludedUserIds = data.excludedUserIds.map((id) => new ObjectId(id)) as any;
  }
  const notification = new NotificationModel({
    ...data,
    sendToAllUsers: data.systemNotificationTo === SystemNotificationTo.User && (!data.excludedUserIds || data.excludedUserIds.length === 0),
    read: false,
    sent: false,
    type: NotificationType.System,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await notification.save();
  return NotificationModel.create(notification) as unknown as Notification;
});
