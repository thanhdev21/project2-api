import { CommentModel } from '@/models/comment';
import { QueryResolvers, Comment } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';

export const getComment = requiredAuth<QueryResolvers['getComment']>(async (_, { _id }, {}) => {
  const comment = await CommentModel.findOne({ _id, deletedAt: null }).populate('createdBy').lean().exec();
  return comment as unknown as Comment;
});
