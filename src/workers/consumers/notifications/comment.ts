import uniq from 'lodash/uniq';
import mongoose from 'mongoose';
import omit from 'lodash/omit';
import { User, Comment, NotificationType, Notification } from '@graphql/types/generated-graphql-types';
import { CommentModel } from '@/models/comment';
import { canUserReceiveNotification, CommentNotificationVariables } from '@utils/notification';
import { NotificationModel } from '@/models/notification';
import { NotificationCreatedPubsub } from '@pubsubs/notification';
import UserModel from '@/models/user';

export const commentCreatedNotification = async (job: any) => {
  const data: Comment = job.data;
  // Replied comment
  if (data.parentId) {
    const fatherComment: Comment = (await CommentModel.findOne({ _id: data.parentId, deletedAt: null }).lean().exec()) as unknown as Comment;
    if (!fatherComment) return data;
    if (fatherComment.createdBy._id.toString() !== data.createdBy._id.toString()) {
      const canReceive = await canUserReceiveNotification(NotificationType.RepliedComment, fatherComment.createdBy.toString());
      if (canReceive) {
        await addedCommentNotification(data, fatherComment.createdBy._id.toString(), null, true, fatherComment._id.toString());
      }
    }
    return data;
  }

  // Added comment

  await addedCommentNotification(data, data.createdBy._id);

  return data;
};

async function saveNotification(notification: Notification) {
  notification.read = false;
  notification.sent = true;
  notification.sentAt = new Date();
  notification.updatedAt = new Date();
  if (!notification._id) {
    notification._id = new mongoose.Types.ObjectId().toString();
    return NotificationModel.create(notification);
  }
  return NotificationModel.updateOne({ _id: notification._id }, { $set: omit(notification, ['_id', 'createdAt']) });
}

async function addedCommentNotification(data: Comment, toUserId?: string, toPageId?: string, replied?: boolean, repliedCommentId?: string) {
  const type = replied ? NotificationType.RepliedComment : NotificationType.AddedComment;
  const conditions: any = {
    type,
  };
  console.log('comment added');

  if (toUserId) {
    conditions.toUserId = toUserId;
  }
  if (replied && repliedCommentId) {
    conditions.forCommentId = repliedCommentId;
  }
  const notification = await buildNotification(data, conditions, type);
  await saveNotification(notification);
  return NotificationCreatedPubsub.publish(notification);
}

async function buildNotification(data: Comment, conditions: any, type: NotificationType) {
  const creator = (await UserModel.findById(data.createdBy._id)) as User;

  let notification = (await NotificationModel.findOne(conditions).lean().exec()) as Notification;
  if (!notification) {
    notification = {
      _id: null,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const variables: CommentNotificationVariables = {
      creators: [{ _id: creator._id.toString(), name: `${creator.firstName} ${creator.lastName}` }],
      commentId: data._id,
      parentCommentId: data.parentId,
      commentContent: data.content,
      bookId: data.bookId,
      createdById: data.createdBy._id,
      totalCommentedUsers: type === NotificationType.RepliedComment ? 0 : 1,
      totalRepliedCommentUsers: type === NotificationType.RepliedComment ? 1 : 0,
    };
    notification.variables = JSON.stringify(variables);
  } else {
    const notificationVariables: CommentNotificationVariables = JSON.parse(notification.variables);

    const creatorIndex = notificationVariables.creators.findIndex((c) => c._id.toString() === creator._id.toString());
    if (creatorIndex > -1) {
      notificationVariables.creators.splice(creatorIndex, 1);
      notificationVariables.creators.unshift({ _id: creator._id.toString(), name: `${creator.firstName} ${creator.lastName}` });
      notification.sentAt = new Date();
    } else {
      notificationVariables.creators.unshift({ _id: creator._id.toString(), name: `${creator.firstName} ${creator.lastName}` });
      const alreadyCommentedConditions = {
        bookId: data.bookId,
        parentId: null,
        deletedAt: null,
        createdBy: data.createdBy,
      };
      if (type === NotificationType.RepliedComment) {
        alreadyCommentedConditions.parentId = data.parentId;
      }
      const commentedCounts = await CommentModel.countDocuments(alreadyCommentedConditions);
      if (commentedCounts < 2) {
        if (type === NotificationType.RepliedComment) {
          notificationVariables.totalRepliedCommentUsers += 1;
        } else {
          notificationVariables.totalCommentedUsers += 1;
        }
      } else {
        notification.sentAt = new Date();
        notificationVariables.creators.unshift({ _id: creator._id.toString(), name: `${creator.firstName} ${creator.lastName}` });
      }
    }
    notificationVariables.creators = notificationVariables.creators.slice(0, 3);
    notificationVariables.commentId = data._id;
    notificationVariables.commentContent = data.content;
    notification.variables = JSON.stringify(notificationVariables);
  }
  notification = {
    ...notification,
    ...{ ...conditions, fromUserId: data.createdBy },
  };
  return notification;
}
