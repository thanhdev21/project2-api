import { Job } from 'bull';
import { cleanNotifications, updateMergedNotification } from '@utils/notification';
import { asyncForEach } from '@utils/helpers';
import { Book, Comment, NotificationType } from '@graphql/types/generated-graphql-types';
import { CommentModel } from '@/models/comment';
import BookModel from '@/models/book';
import { CommentDeletedPubsub } from '@pubsubs/comment';

export const deleteComment = async (job: Job) => {
  const data: Comment = job.data;
  const now = new Date();
  await CommentModel.updateOne(
    { _id: data._id },
    {
      $set: {
        deletedAt: now,
      },
    },
  );

  await BookModel.updateOne(
    {
      _id: data.bookId,
    },
    {
      $inc: {
        totalComments: -1,
      },
    },
  );
  if (data.parentId) {
    await CommentModel.updateOne(
      {
        _id: data.parentId,
      },
      {
        $inc: {
          totalReplies: -1,
        },
      },
    );
    await CommentDeletedPubsub.publish(data);
  } else {
    const totalReplies = await CommentModel.countDocuments({ fatherId: data._id, deletedAt: null });
    if (totalReplies > 0) {
      const childComments = await CommentModel.find({ fatherId: data._id, deletedAt: null }).lean().exec();
      await asyncForEach(childComments, (comment) => cleanNotifications({ forCommentId: comment._id.toString() }));
    }
    await BookModel.updateOne(
      {
        _id: data.bookId,
      },
      {
        $inc: {
          totalComments: -totalReplies,
        },
      },
    );
    await CommentDeletedPubsub.publish(data);
  }
  if (data.parentId) {
    await updateMergedNotification({
      type: NotificationType.RepliedComment,
      conditions: {
        forCommentId: data.parentId,
      },
      pullReactorCreatorKey: 'creators',
      pullReactorCreatorId: data.createdBy._id,
      $inc: {
        totalRepliedCommentUsers: -1,
      },
    });
  }
  await cleanNotifications({ forCommentId: data._id });
  return data;
};
