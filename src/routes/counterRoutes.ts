import { Router } from 'express';
import {
  handleHit,
  getHitStats,
  trackAction,
  getActionStats,
  getActions,
} from '../controllers/counterController';

const router = Router();

// Visit tracking routes
router.get('/hit', handleHit);
router.get('/stats', getHitStats);

// Action tracking routes
router.post('/action', trackAction);
router.get('/action/stats', getActionStats);
router.get('/actions', getActions);

export default router;
