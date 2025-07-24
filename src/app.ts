import express from 'express';
import counterRoutes from './routes/counterRoutes';

const app = express();

app.use(express.json());
app.use('/api', counterRoutes);

export default app;
