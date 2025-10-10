import { Mechanic } from '../models/Mechanic.js';
import { StatusCodes } from 'http-status-codes';
import { mapArrayId } from '../middleware/transformResponse.js';

export async function listMechanics(req, res, next) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const data = await Mechanic.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Mechanic.countDocuments(query);
    res.json({ success: true, data: mapArrayId(data), page: Number(page), limit: Number(limit), total });
  } catch (err) { next(err); }
}

export async function createMechanic(req, res, next) {
  try {
    const mechanic = await Mechanic.create(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: { id: mechanic.id, name: mechanic.name, email: mechanic.email, phone: mechanic.phone, skills: mechanic.skills, availability: mechanic.availability, experience: mechanic.experience } });
  } catch (err) { next(err); }
}

export async function updateMechanic(req, res, next) {
  try {
    const mechanic = await Mechanic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mechanic) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { id: mechanic.id, name: mechanic.name, email: mechanic.email, phone: mechanic.phone, skills: mechanic.skills, availability: mechanic.availability, experience: mechanic.experience } });
  } catch (err) { next(err); }
}

export async function deleteMechanic(req, res, next) {
  try {
    const mechanic = await Mechanic.findByIdAndDelete(req.params.id);
    if (!mechanic) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}


