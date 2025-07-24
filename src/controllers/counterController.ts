import { Request, Response } from 'express';
import { CounterService } from '../services/counterService';
import { JsonStore } from '../storage/jsonStore';
import { DefaultTimeProvider } from '../services/implementations/defaultTimeProvider';

// Create shared instances to avoid recreation on each request
const jsonStore = new JsonStore();
const timeProvider = new DefaultTimeProvider();
const counterService = new CounterService(jsonStore, timeProvider);

export const handleVisit = (_req: Request, res: Response) => {
  counterService.recordVisit();
  res.send('done');
};

export const getVisitCounts = (_req: Request, res: Response) => {
  const result = counterService.getVisitCounts();
  res.send(result);
};
