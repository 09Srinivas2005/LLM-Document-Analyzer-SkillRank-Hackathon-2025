import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env';             // ← NO .js
import documentsRouter from './routes/documents'; // ← NO .js
import { errorHandler } from './middleware/errorHandler'; // ← NO .js


const app = express();
app.use(cors({ origin: env.ALLOWED_ORIGIN }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static('uploads'));


app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/documents', documentsRouter);
app.use(errorHandler);


mongoose
.connect(env.MONGO_URI)
.then(() => {
console.log('[DB] Connected');
app.listen(env.PORT, () => console.log(`[HTTP] Listening on :${env.PORT}`));
})
.catch((err) => {
console.error('[DB] Connection error', err);
process.exit(1);
});