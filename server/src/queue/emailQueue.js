import { Queue } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';

const redis = getRedisConnection();

export const emailQueue = redis
  ? new Queue('email-jobs', {
      connection: redis.connection,
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 1000,
        removeOnFail: 1000,
        backoff: { type: 'exponential', delay: 1000 },
      },
    })
  : null;

export const enqueueApprovalEmail = async ({ userEmail, userName }) => {
  if (!emailQueue) {
    await sendApprovalEmail(userEmail, userName);
    return;
  }
  await emailQueue.add('approval-email', { userEmail, userName });
};

export const enqueueRejectionEmail = async ({ userEmail, userName, message }) => {
  if (!emailQueue) {
    await sendRejectionEmail(userEmail, userName, message);
    return;
  }
  await emailQueue.add('rejection-email', { userEmail, userName, message });
};
