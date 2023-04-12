import { User } from '@graphql/types/generated-graphql-types';
import { GraphQLContext } from '@graphql/types/graphql';
import * as admin from 'firebase-admin';

import MessagingPayload = admin.messaging.MessagingPayload;

class FCMService {
  getTopicAllUser() {
    return 'fcm-all-user';
  }

  getMyTopic(auth: GraphQLContext['auth']) {
    return `fcm-uid-${auth.userId.toString()}`;
  }

  getUserTopic(userId: string) {
    return `fcm-uid-${userId.toString()}`;
  }

  pushToUser(userId: string, message: MessagingPayload) {
    try {
      return admin.messaging().sendToTopic(this.getUserTopic(userId), message);
    } catch (e) {
      console.error(e);
      console.log(message);
      return null;
    }
  }

  pushToUsers(message: MessagingPayload, excludeUserIds: string[]) {
    try {
      if (!excludeUserIds || !excludeUserIds.length) return this.pushToAllUser(message);
      const conditionsBuilder = excludeUserIds.map((t) => `!('${this.getUserTopic(t)}' in topics)`);
      const condition = `'${this.getTopicAllUser()}' in topics && ${conditionsBuilder.join(' && ')}`;
      return admin.messaging().sendToCondition(condition, message);
    } catch (e) {
      console.error(e);
      console.log(message);
      return null;
    }
  }

  pushToAllUser(message: MessagingPayload) {
    const condition = `'${this.getTopicAllUser()}' in topics`;
    return admin.messaging().sendToCondition(condition, message);
  }

  async subscribeTopic(user: User, tokens: Array<string>) {
    await admin.messaging().subscribeToTopic(tokens, this.getTopicAllUser());
    return admin.messaging().subscribeToTopic(tokens, this.getUserTopic(user._id));
  }

  async unsubscribeTopic(user: User, tokens: Array<string>) {
    await admin.messaging().unsubscribeFromTopic(tokens, this.getTopicAllUser());
    return admin.messaging().unsubscribeFromTopic(tokens, this.getUserTopic(user._id));
  }
}

export default new FCMService();
