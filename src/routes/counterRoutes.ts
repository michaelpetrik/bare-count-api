import { Router } from 'express';
import { handleHit, trackAction } from '../controllers/counterController';

const router = Router();

// Visit tracking routes - only data collection
router.get('/hit', handleHit);

// Action tracking routes - only data collection
router.post('/action', trackAction);

export default router;
