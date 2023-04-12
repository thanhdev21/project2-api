import path from 'path';
import dotenv from 'dotenv';

const cwd = process.cwd();
const environment = process.env.NODE_ENV;
let envFile = '.env';
if (environment == 'test') {
  envFile = '.env.test';
}

if (environment == 'staging') {
  envFile = '.env.staging';
}

const envPath = path.join(cwd, envFile);
dotenv.config({ path: envPath });

export enum Stage {
  Production = 'production',
  Dev = 'development',
  Staging = 'staging',
}

export interface ENV {
  apiPort?: string;
  stage: Stage;
  mongodb_url: string;
  port: string;
  email_smtp_host: string;
  email_smtp_port: string;
  email_smtp_username: string;
  email_smtp_password: string;
  root: string;

  videoDir: string;
  imageDir: string;

  redisPort: string;
  redisHost: string;

  videoScreenshotsDir: string;
  //   cdnImageDomain: string;
  //   cdnVideoDomain: string;
}

const root = __dirname.replace(`${cwd}`, '.');
const env: ENV = {
  stage: process.env.STAGE ? (process.env.STAGE as Stage) : Stage.Dev,
  root,
  mongodb_url: process.env.MONGODB_URL,
  email_smtp_host: process.env.EMAIL_SMTP_HOST,
  port: process.env.PORT,
  email_smtp_password: process.env.EMAIL_SMTP_PASSWORD,
  email_smtp_port: process.env.EMAIL_SMTP_PORT,
  email_smtp_username: process.env.EMAIL_SMTP_USERNAME,
  videoDir: process.env.VIDEO_DIR,
  imageDir: process.env.IMAGE_DIR,
  videoScreenshotsDir: process.env.VIDEO_SCREENSHOTS_DIR,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
};

for (const e in env) {
  if (!env[e]) {
    throw new Error(`Missing ${e} env var`);
  }
}

export default env;
