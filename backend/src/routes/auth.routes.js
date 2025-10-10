import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me, sendResetCode, resetPassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', [
  body('name').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['owner', 'receptionist', 'mechanic', 'customer'])
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 })
], login);

router.get('/me', authenticate, me);

router.post('/forgot-password', [body('email').isEmail()], sendResetCode);
router.post('/reset-password', [
  body('email').isEmail(),
  body('code').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 })
], resetPassword);

export default router;


