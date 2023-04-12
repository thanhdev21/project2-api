import Redis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { config } from '@database/redis';

export const pubsub = new RedisPubSub({
  publisher: new Redis({ ...config }),
  subscriber: new Redis({ ...config }),
});

export function withCancel<T>(asyncIterator: AsyncIterator<T | undefined>, onCancel: Function): AsyncIterator<T | undefined> {
  return {
    ...asyncIterator,
    return() {
      onCancel();
      return asyncIterator.return ? asyncIterator.return() : Promise.resolve({ value: undefined, done: true });
    },
  };
}
