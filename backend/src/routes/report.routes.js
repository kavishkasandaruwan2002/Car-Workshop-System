import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { carsReport, jobsReport, inventoryReport, mechanicsReport, paymentsReport } from '../controllers/report.controller.js';

const router = Router();

router.use(authenticate);

// Allow owners and receptionists to generate reports
const roles = ['owner', 'receptionist'];

router.get('/cars', authorize(roles), carsReport);
router.get('/jobs', authorize(roles), jobsReport);
router.get('/inventory', authorize(roles), inventoryReport);
router.get('/mechanics', authorize(roles), mechanicsReport);
router.get('/payments', authorize(roles), paymentsReport);

export default router;
