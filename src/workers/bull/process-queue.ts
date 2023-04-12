import createQueue from './creates/queue';

// A small wrapper around bull to have consistent logging
function processQueue(name: string, cb: any) {
  console.log(`📥 Processing ${name} queue...`);
  return createQueue(name).process(cb);
}

export default processQueue;
