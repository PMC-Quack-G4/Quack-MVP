import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import feynmanRouter from './controllers/feynman.controller';
import ocrRouter from './controllers/ocr.controller';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
// Incrementar el límite de JSON para las imágenes en Base64
app.use(express.json({ limit: '10mb' }));

app.use('/api/feynman', feynmanRouter);
app.use('/api/ocr-audit', ocrRouter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', engine: 'quack-backend' });
});

app.listen(port, () => {
  console.log(`[Quack Backend] Server is running on port ${port}`);
});
