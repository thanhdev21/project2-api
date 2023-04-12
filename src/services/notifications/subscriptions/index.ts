import { SubscriptionResolvers } from '@graphql/types/generated-graphql-types';
import { onReceivedUserNotification } from './created';

export const notificationSubscriptions: SubscriptionResolvers = {
  onReceivedUserNotification,
};
