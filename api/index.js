// Vercel serverless entry — the whole Express app runs as one function.
// vercel.json rewrites /api/* here; Express sees the original URL.
import { app } from '../server/src/app.js';

export default app;
