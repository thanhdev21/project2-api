import { Job } from 'bull';
import omit from 'lodash/omit';
import Queues from '@workers/bull/queues';
import { Book, Comment } from '@graphql/types/generated-graphql-types';
import { CommentModel } from '@/models/comment';
import BookModel from '@/models/book';
import { CommentCreatedPubsub } from '@pubsubs/comment';

export const createComment = async (job: Job) => {
  const now = new Date();
  const data: Comment = job.data;
  if (!data.parentId) delete data.parentId;
  await CommentModel.create({
    ...omit(data, ['parentId']),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  });
  console.log('commnent add job');

  await BookModel.updateOne(
    {
      _id: data.bookId,
    },
    {
      $inc: {
        totalComments: 1,
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
          totalReplies: 1,
        },
      },
    );
    await CommentCreatedPubsub.publish(data);
  } else {
    await CommentCreatedPubsub.publish(data);
  }
  Queues.commentCreatedNotificationQueue.add(data);
  return data;
};
