import mongoose, { Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

const CommentSchema = new mongoose.Schema(
  {
    bookId: {
      type: ObjectId,
      index: { background: true },
      ref: 'Book',
    },
    parentId: { type: ObjectId, default: null, index: { background: true } },
    createdBy: { type: ObjectId, index: { background: true }, ref: 'User' },
    termStatus: { type: String, index: { background: true } },
    deletedAt: { type: Date, default: null },
    content: { type: String, required: true },
    hidden: { type: Boolean, default: false },
  },
  { strict: false, timestamps: true },
);
export const CommentModel = mongoose.model('Comment', CommentSchema, 'Comment');
