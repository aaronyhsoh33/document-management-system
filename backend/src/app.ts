import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { itemsRouter } from './routes/items';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/api/items', itemsRouter);
app.use(errorHandler);

export default app;
