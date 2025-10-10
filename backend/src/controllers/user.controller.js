import { User } from '../models/User.js';
import { StatusCodes } from 'http-status-codes';

export async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    const query = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } }
            ]
          }
        : {})
    };
    const users = await User.find(query)
      .select('-passwordHash')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ success: true, data: users, page: Number(page), limit: Number(limit), total });
  } catch (err) { next(err); }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updateUser(req, res, next) {
  try {
    const { name, role, email, phone, address, nic } = req.body;
    const update = {};
    if (typeof name === 'string') update.name = name;
    if (typeof role === 'string') update.role = role;
    if (typeof email === 'string') update.email = email;
    if (typeof phone === 'string') update.phone = phone;
    if (typeof address === 'string') update.address = address;
    if (typeof nic === 'string') update.nic = nic;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, role, phone, address, nic, password } = req.body;
    if (!name || !email || !role) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(StatusCodes.CONFLICT).json({ success: false, message: 'User already exists' });
    }
    let initialPassword = password || nic;
    if (!initialPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Password or NIC is required to set initial password' });
    }
    const passwordHash = await User.hashPassword(initialPassword);
    const user = await User.create({ name, email, role, phone, address, nic, passwordHash });
    return res.status(StatusCodes.CREATED).json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, nic: user.nic } });
  } catch (err) { next(err); }
}

export async function resetMechanicPasswordByNIC(req, res, next) {
  try {
    const { nic } = req.body;
    if (!nic) return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'NIC is required' });
    const user = await User.findOne({ role: 'mechanic', nic });
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Mechanic not found' });
    user.passwordHash = await User.hashPassword(nic);
    await user.save();
    return res.json({ success: true, message: 'Password reset to NIC' });
  } catch (err) { next(err); }
}


