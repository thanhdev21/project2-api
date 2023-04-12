import { JobOptions } from 'bull';
import { EventEmitter } from 'events';
import createQueue from './creates/queue';
import * as QueueNames from './names';
import { Comment } from '@graphql/types/generated-graphql-types';

interface TypedQueues {
  createCommentQueue: {
    add: (data: Comment, options?: JobOptions) => void;
  };
  updateCommentQueue: {
    add: (data: Comment, options?: JobOptions) => void;
  };
  deleteCommentQueue: {
    add: (data: Comment, options?: JobOptions) => void;
  };
  commentCreatedNotificationQueue: {
    add: (data: Comment, options?: JobOptions) => void;
  };
}

// Normalize our (inconsistent) queue names to a set of JS compatible names
export const QUEUE_NAMES = {
  createComment: QueueNames.CREATE_COMMENT,
  updateComment: QueueNames.UPDATE_COMMENT,
  deleteComment: QueueNames.DELETE_COMMENT,
  commentCreatedNotificationQueue: QueueNames.COMMENT_CREATED_NOTIFICATION,
};

EventEmitter.defaultMaxListeners = (Object.keys(QUEUE_NAMES).length + EventEmitter.defaultMaxListeners) * 3;

const Queues: TypedQueues = {
  createCommentQueue: createQueue(QUEUE_NAMES.createComment),
  updateCommentQueue: createQueue(QUEUE_NAMES.updateComment),
  deleteCommentQueue: createQueue(QUEUE_NAMES.deleteComment),
  commentCreatedNotificationQueue: createQueue(QUEUE_NAMES.commentCreatedNotificationQueue),
};

// Needs to be module.exports so import { sendEmailValidationEmailQueue } from 'queues' works
// it wouldn't work with export default queues and for some reason export { ...queues } doesn't either
export default Queues;
