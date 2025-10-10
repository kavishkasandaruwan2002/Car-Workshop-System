import { Router } from 'express';
import carRoutes from './car.routes.js';
import userRoutes from './user.routes.js';
import authRoutes from './auth.routes.js';
import jobRoutes from './job.routes.js';
import inventoryRoutes from './inventory.routes.js';
import paymentRoutes from './payment.routes.js';
import mechanicRoutes from './mechanic.routes.js';
import appointmentRoutes from './appointment.routes.js';
import reportRoutes from './report.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cars', carRoutes);
router.use('/jobs', jobRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/payments', paymentRoutes);
router.use('/mechanics', mechanicRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/reports', reportRoutes);

export default router;


