import Razorpay from 'razorpay';
import { env } from './env.js';

export const razorpay = env.razorpay.enabled
  ? new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret })
  : null;
