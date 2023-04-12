import { CommentModel } from '@/models/comment';
import { Comment, Comments, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';

export const getComments = requiredAuth<QueryResolvers['getComments']>(async (_, { bookId, after, limit }) => {
  const conditions: any = {
    bookId,
    deletedAt: null,
    parentId: null,
  };
  if (after) {
    conditions._id = { $lt: after };
  }
  const response = await CommentModel.find(conditions).limit(limit).sort({ createdAt: -1 }).exec();

  const totalItems = await CommentModel.count(conditions);

  const commnets: Comments = {
    items: response as unknown as Comment[],
    paginate: {
      pageSize: limit,
      totalItems,
    },
  };

  return commnets;
});

export const getChildComments = requiredAuth<QueryResolvers['getChildComments']>(async (_, { parentId, after, limit }) => {
  const conditions: any = {
    parentId,
    deletedAt: null,
  };
  if (after) {
    conditions._id = { $lt: after };
  }
  const response = await CommentModel.find(conditions).limit(limit).sort({ createdAt: -1 }).exec();

  const totalItems = await CommentModel.count(conditions);

  const commnets: Comments = {
    items: response as unknown as Comment[],
    paginate: {
      pageSize: limit,
      totalItems,
    },
  };

  return commnets;
});
