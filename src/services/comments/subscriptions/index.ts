import { onCommentUpdated } from './update';
import { onCommentCreated } from './create';
import { onCommentDeleted } from './delete';

export const commentSubscriptions = {
  onCommentCreated,
  onCommentUpdated,
  onCommentDeleted,
};
