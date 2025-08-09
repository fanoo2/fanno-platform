import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

registerRoutes(app);

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`[backend] listening on http://0.0.0.0:${port}`);
});