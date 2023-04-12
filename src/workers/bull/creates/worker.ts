import http from 'http';
import { EventEmitter } from 'events';
import createQueue from './queue';

const sumArr = (input: any, prop: string) => {
  return input.reduce((sum: any, item: any) => sum + item[prop], 0);
};

const createWorker = (queueMap: any, queueOptions?: any, reqHandler?: any) => {
  EventEmitter.defaultMaxListeners = 0;

  // Start processing the queues
  const queues = Object.keys(queueMap).map(name => {
    const queue = createQueue(name, queueOptions);
    queue.process(queueMap[name]);
    return queue;
  });

  // Retry all failed queues
  Promise.all(queues.map(queue => queue.getFailed())).then(allQueueJobs => {
    allQueueJobs.forEach((queueJobs: any) => {
      if (queueJobs.length === 0) return queueJobs;
      console.log(`Started retrying ${queueJobs.length} failed jobs`);
      queueJobs.forEach((job: any) => {
        if (!job) return null;
        return job.retry();
      });
    });
  });

  // Return the job count when requesting anything via HTTP
  return http.createServer((req, res) => {
    const defaultResponse = () => res.setHeader('Content-Type', 'application/json');
    // Summarize the data across all the queues
    // tslint:disable-next-line: no-floating-promises
    Promise.all(queues.map(queue => queue.getJobCounts())).then(jobCounts => {
      const data = {
        waiting: sumArr(jobCounts, 'waiting'),
        active: sumArr(jobCounts, 'active'),
        completed: sumArr(jobCounts, 'completed'),
        failed: sumArr(jobCounts, 'failed'),
        delayed: sumArr(jobCounts, 'delayed'),
      };
      res.end(JSON.stringify(data, null, 2));
    });
    if (reqHandler) return reqHandler(req, res, defaultResponse);
    return defaultResponse();
  });
};

export default createWorker;
