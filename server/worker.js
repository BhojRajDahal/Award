import 'dotenv/config';
import { Worker } from 'bullmq';
import { getRedisConnection } from './src/config/redis.js';
import { sendApprovalEmail, sendRejectionEmail } from './src/services/emailService.js';

const redis = getRedisConnection();

if (!redis) {
  console.log('[Worker] REDIS_URL not set, worker disabled.');
  process.exit(0);
}

const worker = new Worker(
  'email-jobs',
  async (job) => {
    if (job.name === 'approval-email') {
      await sendApprovalEmail(job.data.userEmail, job.data.userName);
      return;
    }
    if (job.name === 'rejection-email') {
      await sendRejectionEmail(job.data.userEmail, job.data.userName, job.data.message);
      return;
    }
  },
  { connection: redis.connection }
);

worker.on('failed', (job, err) => {
  console.error('[Worker] Job failed', job?.id, err?.message);
});
