import { Payment } from '../models/Payment.js';
import { StatusCodes } from 'http-status-codes';
import { mapArrayId, mapId } from '../middleware/transformResponse.js';
//payment
export async function listPayments(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const results = await Payment.find()
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Payment.countDocuments();
    res.json({ success: true, data: mapArrayId(results), page: Number(page), limit: Number(limit), total });
  } catch (err) { next(err); }
}

export async function getPayment(req, res, next) {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: mapId(payment) });
  } catch (err) { next(err); }
}

export async function createPayment(req, res, next) {
  try {
    const payment = await Payment.create(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: mapId(payment) });
  } catch (err) { next(err); }
}

export async function updatePayment(req, res, next) {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: mapId(payment) });
  } catch (err) { next(err); }
}

export async function deletePayment(req, res, next) {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (err) { next(err); }
}


