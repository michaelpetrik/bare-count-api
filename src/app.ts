import express from 'express';
import counterRoutes from './routes/counterRoutes';

const app = express();

app.use(express.json());
app.use('/', counterRoutes);

export default app;
