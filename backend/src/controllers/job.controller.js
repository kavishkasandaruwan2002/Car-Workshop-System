import { Job } from '../models/Job.js';
import { Car } from '../models/Car.js';
import { StatusCodes } from 'http-status-codes';
import { mapArrayId, mapId } from '../middleware/transformResponse.js';

export async function listJobs(req, res, next) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    let queryBuilder = Job.find(query)
      .populate('car')
      .populate({ path: 'appointment', select: 'customerName vehicle serviceType preferredDate' })
      .sort({ createdAt: -1 });

  
    const isCustomer = req.user?.role === 'customer' && req.user?.email;
    if (isCustomer) {
      // We will filter after population since car is embedded via populate
    }

    const allResults = await queryBuilder.exec();
    const scopedResults = isCustomer ? allResults.filter(j => j.car && j.car.customerEmail === req.user.email) : allResults;
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paged = scopedResults.slice(start, end);
    const total = scopedResults.length;
    res.json({ success: true, data: mapArrayId(paged), page: Number(page), limit: Number(limit), total });
  } catch (err) { next(err); }
}

export async function getJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id).populate('car');
    if (!job) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: mapId(job) });
  } catch (err) { next(err); }
}

export async function createJob(req, res, next) {
  try {
    const body = { ...req.body };
    
    // Ensure car is stored as ObjectId string
    if (body.car && typeof body.car !== 'string') {
      body.car = String(body.car);
    }
    
    // Validate car exists if provided
    if (body.car) {
      const carExists = await Car.findById(body.car).select('_id');
      if (!carExists) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          success: false, 
          message: 'Car not found',
          errors: [{ field: 'car', message: 'The specified car does not exist' }]
        });
      }
    }
    
    // Validate appointment exists if provided
    if (body.appointment) {
      const { Appointment } = await import('../models/Appointment.js');
      const appointmentExists = await Appointment.findById(body.appointment).select('_id');
      if (!appointmentExists) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          success: false, 
          message: 'Appointment not found',
          errors: [{ field: 'appointment', message: 'The specified appointment does not exist' }]
        });
      }
    }
    
    // Validate that at least one of car or appointment is provided
    if (!body.car && !body.appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: 'Either car or appointment must be specified',
        errors: [{ field: 'car', message: 'Either car or appointment must be provided' }]
      });
    }
    
    // Validate tasks array if provided
    if (body.tasks && Array.isArray(body.tasks)) {
      const invalidTasks = body.tasks.filter(task => 
        !task.description || 
        typeof task.description !== 'string' || 
        task.description.trim().length === 0
      );
      
      if (invalidTasks.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          success: false, 
          message: 'All tasks must have valid descriptions',
          errors: [{ field: 'tasks', message: 'Each task must have a non-empty description' }]
        });
      }
    }
    
    // If this job is linked to an appointment, upsert to avoid duplicates
    let job;
    if (body.appointment) {
      job = await Job.findOneAndUpdate(
        { appointment: body.appointment },
        { $set: body },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      job = await Job.create(body);
    }
    
    // Populate to keep response shape consistent with list/get endpoints
    job = await job.populate('car').then(j => j.populate({ path: 'appointment', select: 'customerName vehicle serviceType preferredDate' }));
    res.status(StatusCodes.CREATED).json({ success: true, data: mapId(job) });
  } catch (err) { 
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      }));
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: 'Validation failed',
        errors 
      });
    }
    next(err); 
  }
}

export async function updateJob(req, res, next) {
  try {
    const body = { ...req.body };
    
    // Ensure car is stored as ObjectId string
    if (body.car && typeof body.car !== 'string') {
      body.car = String(body.car);
    }
    
    // Validate car exists if provided
    if (body.car) {
      const carExists = await Car.findById(body.car).select('_id');
      if (!carExists) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          success: false, 
          message: 'Car not found',
          errors: [{ field: 'car', message: 'The specified car does not exist' }]
        });
      }
    }
    
    // Validate tasks array if provided
    if (body.tasks && Array.isArray(body.tasks)) {
      const invalidTasks = body.tasks.filter(task => 
        !task.description || 
        typeof task.description !== 'string' || 
        task.description.trim().length === 0
      );
      
      if (invalidTasks.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          success: false, 
          message: 'All tasks must have valid descriptions',
          errors: [{ field: 'tasks', message: 'Each task must have a non-empty description' }]
        });
      }
    }
    
    // Check if job exists before updating
    const existingJob = await Job.findById(req.params.id);
    if (!existingJob) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    let job = await Job.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!job) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    
    job = await job.populate('car').then(j => j.populate({ path: 'appointment', select: 'customerName vehicle serviceType preferredDate' }));
    res.json({ success: true, data: mapId(job) });
  } catch (err) { 
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      }));
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: 'Validation failed',
        errors 
      });
    }
    next(err); 
  }
}

export async function deleteJob(req, res, next) {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}


