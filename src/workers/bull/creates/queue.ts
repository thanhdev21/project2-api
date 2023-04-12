import Queue from 'bull';
import createRedis from '@database/redis';
import debug from '@utils/debug';

const client = createRedis();
const subscriber = createRedis();

function createQueue(name: string, queueOptions?: any): Queue.Queue {
  const queue = new Queue(name, {
    createClient: (type: any) => {
      switch (type) {
        case 'client':
          return client;
        case 'subscriber':
          return subscriber;
        default:
          return createRedis();
      }
    },
    defaultJobOptions: {
      removeOnComplete: true,
      attempts: 1,
    },
    ...queueOptions,
  });

  queue.on('error', function (error) {
    console.error(error);
  });

  queue.on('waiting', (jobId) => {
    queue.getJob(jobId).then((job) => {
      if (!job) return job;
      return job.finished();
    });
  });

  queue.on('active', function (job) {
    debug.workers(`Queue ${job.queue.name}-${job.id} is active...`);
  });

  queue.on('stalled', function (job) {
    debug.workers(`Queue ${job.queue.name}-${job.id} is stalled...`);
  });

  queue.on('progress', (job, progress) => {
    debug.workers(`Queue ${job.queue.name}-${job.id} is ${progress}...`);
  });

  queue.on('completed', (job) => {
    debug.workers(`Queue ${job.queue.name}-${job.id} is complete...`);
  });

  queue.on('failed', (job, err) => {
    console.error(err);
    debug.workers(`Queue ${job.queue.name}-${job.id} is failed...`);
  });

  queue.on('paused', () => {
    debug.workers(`All queues are paused...`);
  });

  queue.on('resumed', () => {
    debug.workers(`All queues has been resume...`);
  });

  queue.on('drained', function () {
    debug.workers(`All queues are drained...`);
  });

  queue.on('removed', (job) => {
    debug.workers(`Queue ${job.queue.name}-${job.id} is removed...`);
  });

  return queue;
}

export default createQueue;
