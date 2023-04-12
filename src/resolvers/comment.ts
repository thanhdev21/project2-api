import { CommentModel } from '@/models/comment';
import UserModel from '@/models/user';
import { CommentResolvers, Comments, Comment as CommentType } from '@graphql/types/generated-graphql-types';

export const Comment: CommentResolvers = {
  childComments: async (comment, { limit, after }) => {
    if (comment.parentId)
      return {
        items: [],
        paginate: {
          pageSize: limit,
          totalItems: 0,
        },
      };
    const conditions: any = {
      parentId: comment._id,
      deletedAt: null,
    };
    if (after) {
      conditions._id = { $lt: after };
    }
    const response = await CommentModel.find(conditions).limit(limit).sort({ createdAt: -1 }).exec();

    const totalItems = await CommentModel.count(conditions);

    const commnets: Comments = {
      items: response as unknown as CommentType[],
      paginate: {
        pageSize: limit,
        totalItems,
      },
    };

    return commnets;
  },
  totalReplies: async (comment) => {
    const conditions: any = { parentId: comment._id, deletedAt: null };
    return CommentModel.count(conditions);
  },
  createdBy: async (comment) => {
    return UserModel.findById(comment.createdBy._id);
  },
};
