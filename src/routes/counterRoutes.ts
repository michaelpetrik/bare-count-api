import { Router } from 'express';
import { handleHit, getHitStats } from '../controllers/counterController';

const router = Router();

router.get('/hit', handleHit);
router.get('/stats', getHitStats);

export default router;
