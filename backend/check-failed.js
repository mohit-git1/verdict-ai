require('dotenv').config();
const { Queue } = require('bullmq');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const url = new URL(redisUrl);
const connection = {
  host: url.hostname,
  port: Number(url.port),
  password: url.password || undefined,
  tls: url.protocol === 'rediss:' ? {} : undefined,
  maxRetriesPerRequest: null,
};

const assignmentQueue = new Queue('assignment-generation', { connection });

async function check() {
  const failedJobs = await assignmentQueue.getFailed();
  if (failedJobs.length > 0) {
    console.log(failedJobs[0].stacktrace);
  }
  process.exit(0);
}
check();
