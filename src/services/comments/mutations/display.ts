import { CommentModel } from '@/models/comment';
import UserModel from '@/models/user';
import { RoleCodes } from '@constants/enum';
import { MutationResolvers, ErrorCodes, Comment } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';
import { CommentUpdatedPubsub } from '@pubsubs/comment';
import { makeGraphqlError } from '@utils/error';

export const hideComment = requiredAuth<MutationResolvers['hideComment']>(async (_, { _id }, { auth }) => {
  const comment = await CommentModel.findById(_id);

  if (auth.user.role !== RoleCodes.ADMIN) {
    throw makeGraphqlError('Only Admin can hide comment', ErrorCodes.Forbidden);
  }

  comment.hidden = true;
  comment.updatedAt = new Date();

  await comment.save().then((res) => CommentModel.findById(res._id).populate(['createdBy']).exec());
  CommentUpdatedPubsub.publish(comment as unknown as Comment);
  return true;
});

export const unhideComment = requiredAuth<MutationResolvers['unhideComment']>(async (_, { _id }, { auth }) => {
  const comment = await CommentModel.findById(_id);

  if (auth.user.role !== RoleCodes.ADMIN) {
    throw makeGraphqlError('Only Admin can unhide comment', ErrorCodes.Forbidden);
  }

  comment.hidden = false;
  comment.updatedAt = new Date();

  await comment.save().then((res) => CommentModel.findById(res._id).populate(['createdBy']).exec());
  CommentUpdatedPubsub.publish(comment as unknown as Comment);
  return true;
});
