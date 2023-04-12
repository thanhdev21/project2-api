import { subscribeFirebaseMessaging, unsubscribeFirebaseMessaging } from './subscribe';
import { createSystemNotification } from './create';
import { updateSystemNotification } from './update';
import { deleteSystemNotification, deleteMyNotification } from './delete';
import { markNotificationAsRead, resetMyTotalNotificationUnread } from './read';
import { sendSystemNotification } from './send';
import { MutationResolvers } from '@graphql/types/generated-graphql-types';

export const notificationMutations: MutationResolvers = {
  subscribeFirebaseMessaging,
  unsubscribeFirebaseMessaging,
  createSystemNotification,
  updateSystemNotification,
  deleteSystemNotification,
  deleteMyNotification,
  resetMyTotalNotificationUnread,
  markNotificationAsRead,
  sendSystemNotification,
};
