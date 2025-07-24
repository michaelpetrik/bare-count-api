import { Router } from 'express';
import { handleVisit, getVisitCounts } from '../controllers/counterController';

const router = Router();

router.get('/', handleVisit);
router.get('/counts', getVisitCounts);

export default router;
