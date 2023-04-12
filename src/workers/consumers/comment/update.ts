import { Job } from 'bull';
import omit from 'lodash/omit';
import { Comment } from '@graphql/types/generated-graphql-types';
import { CommentModel } from '@/models/comment';
import { CommentUpdatedPubsub } from '@pubsubs/comment';
export const updateComment = async (job: Job) => {
  const data: Comment = job.data;
  if (!data.parentId) delete data.parentId;

  await CommentModel.updateOne(
    { _id: data._id },
    {
      $set: {
        ...omit(data, ['parentComment', 'createdAt']),
        updatedAt: new Date(data.updatedAt),
      },
    },
  );
  await CommentUpdatedPubsub.publish(data);

  return data;
};
