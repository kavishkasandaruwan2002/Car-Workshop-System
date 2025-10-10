import { Appointment } from '../models/Appointment.js';
import { Job } from '../models/Job.js';
import { StatusCodes } from 'http-status-codes';
import { mapArrayId, mapId } from '../middleware/transformResponse.js';

export async function listAppointments(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query; 
     
    // If the requester is a customer, only show their appointments
    let query = {};
    if (req.user?.role === 'customer' && req.user?.email) {  
      query.customerEmail = req.user.email;  
    }
    
    const results = await Appointment.find(query) 
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))    
      .sort({ createdAt: -1 });
    const total = await Appointment.countDocuments(query);
    res.json({ success: true, data: mapArrayId(results), page: Number(page), limit: Number(limit), total });
  } catch (err) { next(err); }
}

export async function createAppointment(req, res, next) {
  try {
    const body = { ...req.body };
    
    // If the requester is a customer, automatically set their email
    if (req.user?.role === 'customer' && req.user?.email) {
      body.customerEmail = req.user.email;
    }
    
    const appt = await Appointment.create(body);
    // Do not auto-create a job here. Jobs will be created/updated explicitly by staff.
    res.status(StatusCodes.CREATED).json({ success: true, data: mapId(appt) });
  } catch (err) { next(err); }
}

export async function updateAppointment(req, res, next) {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appt) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: mapId(appt) });
  } catch (err) { next(err); }
}

export async function deleteAppointment(req, res, next) {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); } 
}


