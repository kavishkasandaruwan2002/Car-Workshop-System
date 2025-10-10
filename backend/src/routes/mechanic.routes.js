import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { listMechanics, createMechanic, updateMechanic, deleteMechanic } from '../controllers/mechanic.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(['owner', 'receptionist', 'mechanic']), listMechanics);
router.post('/', authorize(['owner']), [
  body('name').isString().isLength({ min: 1 }),
  body('email').isEmail(),
], validate, createMechanic);
router.put('/:id', authorize(['owner']), [
  param('id').isString().isLength({ min: 1 }),
  body('name').optional().isString().isLength({ min: 1 }),
  body('email').optional().isEmail(),
], validate, updateMechanic);
router.delete('/:id', authorize(['owner']), [param('id').isString().isLength({ min: 1 })], validate, deleteMechanic);

export default router;


