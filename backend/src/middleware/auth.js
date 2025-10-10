import { StatusCodes } from 'http-status-codes';
import { verifyJwt } from '../utils/jwt.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Missing token' });
  }

  // Allow development token for testing
  if (token === 'development-token' && process.env.NODE_ENV !== 'production') {
    req.user = {
      id: '1',
      email: 'owner@test.com',
      role: 'owner'
    };
    return next();
  }

  try {
    const decoded = verifyJwt(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid token' });
  }
}

export function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || (allowedRoles.length && !allowedRoles.includes(req.user.role))) {
      return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
}


