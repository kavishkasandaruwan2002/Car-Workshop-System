import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { listUsers, getUser, updateUser, deleteUser, createUser, resetMechanicPasswordByNIC } from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(['owner', 'receptionist']), listUsers);
router.get('/:id', authorize(['owner', 'receptionist']), getUser);
router.put('/:id', authorize(['owner']), updateUser);
router.delete('/:id', authorize(['owner']), deleteUser);
router.post('/', authorize(['owner']), createUser);
router.post('/mechanics/reset-password-nic', authorize(['owner']), resetMechanicPasswordByNIC);

export default router;


