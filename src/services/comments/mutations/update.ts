import { requiredAuth } from '@/middleware/auth';
import { CommentModel } from '@/models/comment';
import { ErrorCodes, MutationResolvers, Comment } from '@graphql/types/generated-graphql-types';
import { CommentUpdatedPubsub } from '@pubsubs/comment';
import { makeGraphqlError } from '@utils/error';

export const updateComment = requiredAuth<MutationResolvers['updateComment']>(async (_, { _id, data: { content } }, { auth }) => {
  if (content.length === 0) {
    throw makeGraphqlError('Content is required!', ErrorCodes.BadUserInput);
  }
  const comment = await CommentModel.findById(_id);

  if (comment.createdBy.toString() !== auth.userId) {
    throw makeGraphqlError('You can only update your own comments', ErrorCodes.BadUserInput);
  }

  comment.content = content;
  await comment.save().then((res) => CommentModel.findById(res._id).populate(['createdBy']).exec());
  CommentUpdatedPubsub.publish(comment as unknown as Comment);
  return comment as unknown as Comment;
});
