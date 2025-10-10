import { StatusCodes } from 'http-status-codes';
import { User } from '../models/User.js';
import { signJwt } from '../utils/jwt.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Missing fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(StatusCodes.CONFLICT).json({ success: false, message: 'User already exists' });
    }
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role });
    const token = signJwt({ id: user.id, role: user.role, name: user.name, email: user.email });
    return res.status(StatusCodes.CREATED).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid credentials' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signJwt({ id: user.id, role: user.role, name: user.name, email: user.email });
    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) { next(err); }
}

export async function me(req, res) {
  return res.json({ success: true, user: req.user });
}

// Simple forgot/reset flow placeholders; integrate email service as needed
const resetCodes = new Map();

export async function sendResetCode(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes.set(email, { code, expires: Date.now() + 5 * 60 * 1000 });
  return res.json({ success: true, message: 'Reset code sent' });
}

export async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;
  const record = resetCodes.get(email);
  if (!record || record.code !== code || Date.now() > record.expires) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid or expired code' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
  }
  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();
  resetCodes.delete(email);
  return res.json({ success: true, message: 'Password reset successful' });
}


