import Redis from 'ioredis';

export const config = {
  port: parseInt(process.env.REDIS_PORT, 10),
  host: process.env.REDIS_HOST,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
  password: process.env.REDIS_K8S_PASSWORD || null,
};

export default (extraConfig?: any) =>
  new Redis({
    ...config,
    ...extraConfig,
  });
