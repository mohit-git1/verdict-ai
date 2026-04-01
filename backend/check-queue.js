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
  const wait = await assignmentQueue.getWaitingCount();
  const active = await assignmentQueue.getActiveCount();
  const failed = await assignmentQueue.getFailedCount();
  console.log(`WAIT: ${wait}`);
  console.log(`ACTIVE: ${active}`);
  console.log(`FAILED: ${failed}`);
  
  if (failed > 0) {
    const failedJobs = await assignmentQueue.getFailed();
    console.log('Error:', failedJobs[0].failedReason);
  }
  process.exit(0);
}
check();
