import { env } from './env.js';

export const SECRET = env.JWT_SECRET;
export const EXPIRES_IN = env.JWT_EXPIRES_IN;

export default { SECRET, EXPIRES_IN };

