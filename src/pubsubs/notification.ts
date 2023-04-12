import UserModel from '@/models/user';
import { Notification, User } from '@graphql/types/generated-graphql-types';
import { GraphQLContext } from '@graphql/types/graphql';
import debug from '@utils/debug';
import FCM from '@utils/fcm';
import { asyncForEach } from '@utils/helpers';
import { formatNotificationBody, getRealTotalNotificationUnread } from '@utils/notification';
import * as admin from 'firebase-admin';
import { withFilter } from 'graphql-subscriptions';
import uniq from 'lodash/uniq';
import { Events } from './events';
import { pubsub } from './index';
import MessagingPayload = admin.messaging.MessagingPayload;

export const NotificationCreatedPubsub = {
  publish: async (notification: Notification) => {
    if (notification._id) await pubsub.publish(Events.NOTIFICATION_CREATED, notification);
    let title = 'Alobridge';

    if (notification.systemNotificationTo) {
      const pushNotification: MessagingPayload = {
        data: {
          payload: JSON.stringify(notification),
        },
        notification: {
          body: notification.customMessage,
          title,
        },
      };

      if (notification.sendToAllUsers) {
        return FCM.pushToAllUser(pushNotification);
      } else {
        let excludeUserIds = [...notification.excludedUserIds];
        return FCM.pushToUsers(pushNotification, excludeUserIds);
      }
    }

    const toUserIds = [];

    if (notification.toUserId) {
      toUserIds.push(notification.toUserId.toString());
    }

    delete notification.variables;

    asyncForEach(uniq(toUserIds), async (toUserId) => {
      const pushToUser = (await UserModel.findById(toUserId)) as User;
      if (pushToUser) {
        let totalNotificationUnread = await getRealTotalNotificationUnread(pushToUser);
        let body = await formatNotificationBody(notification.type, notification);
        const pushNotification: MessagingPayload = {
          data: {
            payload: JSON.stringify(notification),
          },
          notification: {
            body,
            title,
            badge: totalNotificationUnread ? `${totalNotificationUnread}` : '0',
          },
        };
        return FCM.pushToUser(toUserId, pushNotification);
      } else {
        return null;
      }
    });
    return null;
  },
  filteredForUserSubscription: withFilter(
    () => pubsub.asyncIterator([Events.NOTIFICATION_CREATED]),
    ({ _id, toUserId }: Notification, _, { auth }: GraphQLContext) => {
      console.log('auth', auth);
      debug.subscriptions(`Notification created: ${_id}`);
      return toUserId && toUserId.toString() === auth.userId.toString();
    },
  ),
  resolve: (notification: Notification) => notification,
};
