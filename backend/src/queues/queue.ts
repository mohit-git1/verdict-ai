import { Queue, QueueOptions } from 'bullmq'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// Parse the URL manually for BullMQ
const getRedisConnection = () => {
  const url = new URL(redisUrl)
  return {
    host: url.hostname,
    port: Number(url.port),
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  }
}

export const assignmentQueue = new Queue('assignment-generation', {
  connection: getRedisConnection(),
  prefix: process.env.QUEUE_PREFIX || 'prod',
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
})

console.log('📦 BullMQ queue initialized')