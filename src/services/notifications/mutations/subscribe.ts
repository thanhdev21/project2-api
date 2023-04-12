import UserModel from '@/models/user';
import { MutationResolvers, User } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';
import CloudMessage from '@utils/fcm';
import { asyncForEach } from '@utils/helpers';

export const subscribeFirebaseMessaging = requiredAuth<MutationResolvers['subscribeFirebaseMessaging']>(async (_, { token }, { auth }) => {
  const tokenUsedByUsers = await UserModel.find({ subscribedFirebaseTokens: { $in: [token] } })
    .lean()
    .exec();
  if (tokenUsedByUsers) {
    await asyncForEach(tokenUsedByUsers, async (user: User) => {
      await CloudMessage.unsubscribeTopic(user, [token]);
      await UserModel.updateOne(
        {
          _id: user._id,
        },
        {
          $pull: { subscribedFirebaseTokens: token },
        },
      );
    });
  }
  await CloudMessage.subscribeTopic(auth.user, [token]);
  await UserModel.updateOne(
    {
      _id: auth.userId,
    },
    {
      $addToSet: { subscribedFirebaseTokens: token },
    },
  );
  return true;
});

export const unsubscribeFirebaseMessaging = requiredAuth<MutationResolvers['unsubscribeFirebaseMessaging']>(async (_, { token }, { auth }) => {
  await CloudMessage.unsubscribeTopic(auth.user, [token]);
  await UserModel.updateOne(
    {
      _id: auth.userId,
    },
    {
      $pull: { subscribedFirebaseTokens: token },
    },
  );
  return true;
});
