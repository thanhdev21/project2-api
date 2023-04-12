import { ForbiddenError } from 'apollo-server-express';
import mongoose from 'mongoose';
import { validateObjectIds } from '@utils/database';
import { requiredAuth } from '@middleware/auth';
import { MutationResolvers, RoleCodes, SystemNotificationTo, Notification } from '@graphql/types/generated-graphql-types';
import UserModel from '@/models/user';
import { NotificationModel } from '@/models/notification';

export const updateSystemNotification = requiredAuth<MutationResolvers['updateSystemNotification']>(async (_, { _id, data }, { auth }) => {
  if (auth.user.role !== RoleCodes.ADMIN) throw new ForbiddenError('Permission denied!');
  if (data.excludedUserIds) {
    await validateObjectIds(UserModel, data.excludedUserIds);
    data.excludedUserIds = data.excludedUserIds as any;
  }
  await NotificationModel.updateOne(
    { _id },
    {
      $set: {
        ...data,
        sent: false,
        sendToAllUsers: data.systemNotificationTo === SystemNotificationTo.User && (!data.excludedUserIds || data.excludedUserIds.length === 0),
        updatedAt: new Date(),
      },
    },
  );
  return NotificationModel.findById(_id).lean().exec() as unknown as Notification;
});
