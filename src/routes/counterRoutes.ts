import { Router } from 'express';
import { handleVisit } from '../controllers/counterController';

const router = Router();

router.get('/', handleVisit);

export default router;
