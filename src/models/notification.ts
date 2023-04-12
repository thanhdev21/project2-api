import { decreaseUserTotalReadNotifications } from '@utils/notification';
import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

const NotificationSchema = new mongoose.Schema(
  {
    fromUserId: { type: ObjectId, index: { background: true } },
    toUserId: { type: ObjectId, index: { background: true } },
    forCommentId: { type: ObjectId, index: { background: true } },
    excludedUserIds: [{ type: ObjectId, index: { background: true } }],
    createdBy: { type: ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    sentAt: { type: Date, index: { background: true } },
    createdAt: Date,
    updatedAt: Date,
    deletedAt: { type: Date, default: null },
  },
  { strict: false },
);

NotificationSchema.post('deleteOne', async function () {
  // @ts-ignore
  const conditions = this._conditions;
  if (conditions && conditions.toUserId) {
    await decreaseUserTotalReadNotifications(conditions.toUserId);
  }
});

NotificationSchema.post('updateOne', async function () {
  // @ts-ignore
  const update = this._update;
  if (update.$set && update.$set.toUserId) {
    await decreaseUserTotalReadNotifications(update.$set.toUserId);
  }
});

export const NotificationModel = mongoose.model('Notification', NotificationSchema, 'Notification');
