import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listAppointments, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointment.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(['owner', 'receptionist', 'customer']), listAppointments);
router.post('/', authorize(['customer', 'owner', 'receptionist']), [
  body('customerName').isString().isLength({ min: 1 }),
  body('vehicle').isString().isLength({ min: 1 }),
  body('serviceType').isString().isLength({ min: 1 }),
  body('preferredDate').isISO8601()
], validate, createAppointment);
router.put('/:id', authorize(['owner', 'receptionist']), updateAppointment);
router.delete('/:id', authorize(['owner', 'receptionist']), deleteAppointment);

export default router;


