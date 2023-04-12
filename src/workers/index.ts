require('module-alias/register');
import debug from '@utils/debug';
import createWorker from '@workers/bull/creates/worker';
import { connect as MongoDbConnect } from '@database/mongodb';
import * as QueueNames from '@workers/bull/names';
import Comment from '@workers/consumers/comment';

MongoDbConnect().then(() => true);

const PORT = process.env.WORKERS_PORT || 32002;

const server: any = createWorker({
  [QueueNames.CREATE_COMMENT]: Comment.createComment,
  [QueueNames.UPDATE_COMMENT]: Comment.updateComment,
  [QueueNames.DELETE_COMMENT]: Comment.deleteComment,
});

server.listen(PORT, '0.0.0.0', () => {
  debug.workers(`Health check server running at 0.0.0.0:${server.address().port}`);
});
