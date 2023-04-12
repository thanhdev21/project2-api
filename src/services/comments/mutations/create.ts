import { CommentModel } from '@/models/comment';
import { MutationResolvers, Comment, ErrorCodes } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';
import { CommentCreatedPubsub } from '@pubsubs/comment';
import { makeGraphqlError } from '@utils/error';

export const createComment = requiredAuth<MutationResolvers['createComment']>(async (_, { data: { bookId, content, parentId } }, { auth }) => {
  if (content.length === 0) {
    throw makeGraphqlError('Content is required', ErrorCodes.BadUserInput);
  }

  const newComment = new CommentModel({
    bookId,
    content,
    parentId,
    createdBy: auth.userId,
  });

  const book = await newComment.save().then((res) => CommentModel.findById(res._id).populate(['createdBy']).exec());
  CommentCreatedPubsub.publish(book as unknown as Comment);
  return book as unknown as Comment;
});
