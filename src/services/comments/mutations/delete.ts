import { requiredAuth } from '@/middleware/auth';
import { CommentModel } from '@/models/comment';
import { ErrorCodes, MutationResolvers, RoleCodes, Comment } from '@graphql/types/generated-graphql-types';
import { CommentDeletedPubsub } from '@pubsubs/comment';
import { makeGraphqlError } from '@utils/error';

export const deleteComment = requiredAuth<MutationResolvers['deleteComment']>(async (_, { _id }, { auth }) => {
  const comment = await CommentModel.findById(_id);

  console.log('comment', comment.createdBy.toString(), auth);

  if (comment.createdBy.toString() !== auth.userId || auth.user.role !== RoleCodes.ADMIN) {
    throw makeGraphqlError('Only can delete your own comments or you a Admin ', ErrorCodes.Forbidden);
  }

  comment.deletedAt = new Date();

  await comment.save().then((res) => CommentModel.findById(res._id).populate(['createdBy']).exec());
  CommentDeletedPubsub.publish(comment as unknown as Comment);
  return true;
});
