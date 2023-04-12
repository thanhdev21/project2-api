import BookModel from '@/models/book';
import { NotificationModel } from '@/models/notification';
import UserModel from '@/models/user';
import { Book, Notification, NotificationType, User } from '@graphql/types/generated-graphql-types';
import { asyncForEach } from '@utils/helpers';

export interface CommentNotificationVariables {
  creators?: Array<{ _id: string; name: string }>;
  commentId: string;
  parentCommentId?: string;
  bookId: string;
  createdById: string;
  commentContent: string;
  repliedToCommentId?: string;
  totalRepliedCommentUsers?: number;
  totalCommentedUsers?: number;
}

export async function canUserReceiveNotification(type: NotificationType, uid: string) {
  const user: User = (await UserModel.findById(uid).lean().exec()) as User;
  if (!user) return false;
  if (!user.unsubscribeNotificationTypes) return true;
  if (user.unsubscribeNotificationTypes && user.unsubscribeNotificationTypes.length === 0) return true;
  return user.unsubscribeNotificationTypes && user.unsubscribeNotificationTypes.length > 0 && !user.unsubscribeNotificationTypes.includes(type);
}

export async function decreaseUserTotalReadNotifications(uid: string) {
  await UserModel.updateOne({ _id: uid, totalReadNotifications: { $gt: 0 } }, { $inc: { totalReadNotifications: -1 } });
}

export async function getTotalNotificationUnread(uid: string) {
  const conditions: any = {
    deletedAt: null,
    read: false,
    systemNotificationTo: { $exists: false },
    $or: [{ toUserId: uid }],
  };
  const user = (await UserModel.findById(uid)) as User;
  const unreadSystemNotification = user.unsubscribeNotificationTypes && !user.unsubscribeNotificationTypes.includes(NotificationType.System) && user.unreadSystemNoticeIds ? user.unreadSystemNoticeIds.length : 0;
  const count = await NotificationModel.countDocuments(conditions);
  return count + unreadSystemNotification;
}

export async function getRealTotalNotificationUnread(user: User) {
  const totalUnreadNotifications = await getTotalNotificationUnread(user._id);
  if (totalUnreadNotifications === 0) return 0;
  const unread = totalUnreadNotifications - (user.totalReadNotifications || 0);
  if (unread <= 0) return 0;
  return unread;
}

export async function cleanNotifications(conditions: any) {
  const notifications = await NotificationModel.find(conditions).lean().exec();
  return asyncForEach(notifications, async (notification: Notification) => {
    await NotificationModel.deleteOne({ _id: notification._id, toUserId: notification.toUserId });
    return true;
  });
}

export async function formatNotificationBody(type: NotificationType, notification: Notification): Promise<string> {
  const formatCreators = (variables: CommentNotificationVariables) => {
    let totalComments = variables.totalCommentedUsers;
    if (variables.parentCommentId) {
      totalComments = variables.totalRepliedCommentUsers;
    }
    if (variables.creators.length === 2 && totalComments === 2) {
      return `${variables.creators[0].name} và ${variables.creators[1].name}`;
    }
    if (variables.creators.length >= 2 && totalComments > 2) {
      return `${variables.creators[0].name}, ${variables.creators[1].name} và ${totalComments - 2} người khác}`;
    }
    return variables.creators[0].name;
  };

  let formattedCreators = '';
  let commentVariables: CommentNotificationVariables;
  let body = '';
  switch (type) {
    case NotificationType.AddedComment:
      commentVariables = JSON.parse(notification.variables);
      formattedCreators = formatCreators(commentVariables);
      const addedToPost = (await BookModel.findById(commentVariables.bookId)) as Book;
      body = `${formattedCreators} đã thêm 1 bình luận về cuốn sách ${addedToPost.title}`;
      break;
    case NotificationType.RepliedComment: {
      commentVariables = JSON.parse(notification.variables);
      formattedCreators = formatCreators(commentVariables);
      const repliedInBook = (await BookModel.findById(commentVariables.bookId)) as Book;

      body = `${formatCreators} đã trả lời bình luận của bạn trong cuốn sách ${repliedInBook.title}`;
      break;
    }
  }
  if (!body) return null;
  return body.trim().replace('&#39;s', `'s`);
}

interface UpdateMergedNotification {
  type: NotificationType;
  conditions: {
    fromUserId?: string;
    fromPageId?: string;
    toUserId?: string;
    toPageId?: string;
    forPostId?: string;
    forCommentId?: string;
    forConversationId?: string;
    forMessageId?: string;
    forMediaId?: string;
  };
  pullReactorCreatorId: string;
  pullReactorCreatorKey: 'creators' | 'reactors';
  $inc: {
    totalRepliedCommentUsers?: number;
    totalCommentedUsers?: number;
    totalLikedUsers?: number;
    totalFollowedUsers?: number;
    totalSharedUsers?: number;
    totalInvites?: number;
  };
}

export async function updateMergedNotification(payload: UpdateMergedNotification) {
  const notification = (await NotificationModel.findOne({ ...payload.conditions, type: payload.type })
    .lean()
    .exec()) as Notification;
  if (!notification) return null;
  let ableToDelete = false;
  const variables: any = JSON.parse(notification.variables);
  if (payload.$inc.totalRepliedCommentUsers && payload.$inc.totalRepliedCommentUsers === -1) {
    if (variables['totalRepliedCommentUsers'] === 1) ableToDelete = true;
  }
  if (payload.$inc.totalCommentedUsers && payload.$inc.totalCommentedUsers === -1) {
    if (variables['totalCommentedUsers'] === 1) ableToDelete = true;
  }
  if (payload.$inc.totalLikedUsers && payload.$inc.totalLikedUsers === -1) {
    if (variables['totalLikedUsers'] === 1) ableToDelete = true;
  }
  if (payload.$inc.totalFollowedUsers && payload.$inc.totalFollowedUsers === -1) {
    if (variables['totalFollowedUsers'] === 1) ableToDelete = true;
  }
  if (payload.$inc.totalSharedUsers && payload.$inc.totalSharedUsers === -1) {
    if (variables['totalSharedUsers'] === 1) ableToDelete = true;
  }
  if (payload.$inc.totalInvites && payload.$inc.totalInvites === -1) {
    if (variables['totalInvites'] === 1) ableToDelete = true;
  }
  if (ableToDelete) {
    await NotificationModel.deleteOne({ _id: notification._id, toUserId: notification.toUserId });

    return true;
  }
  if (variables[payload.pullReactorCreatorKey]) {
    const reactorCreatorIndex = variables[payload.pullReactorCreatorKey].findIndex((item) => item._id.toString() === payload.pullReactorCreatorId.toString());
    if (reactorCreatorIndex > -1) {
      variables[payload.pullReactorCreatorKey].splice(reactorCreatorIndex, 1);
    }
    Object.keys(payload.$inc).forEach(($incKey) => {
      variables[$incKey] += payload.$inc[$incKey];
    });
    await NotificationModel.updateOne({ _id: notification._id }, { $set: { variables: JSON.stringify(variables) } });
  }
  return true;
}
