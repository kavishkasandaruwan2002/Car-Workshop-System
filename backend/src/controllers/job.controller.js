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
      .populate('services.service')
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
    const job = await Job.findById(req.params.id)
      .populate('car')
      .populate('services.service');
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

    // If services are provided, resolve their current prices
    if (body.services && Array.isArray(body.services)) {
      const { Service } = await import('../models/Service.js');
      const resolvedServices = await Promise.all(body.services.map(async (s) => {
        const serviceId = s.serviceId || s.service;
        const serviceDoc = await Service.findById(serviceId);
        return {
          service: serviceId,
          priceAtTime: serviceDoc ? serviceDoc.basePrice : 0
        };
      }));
      body.services = resolvedServices;
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
    job = await job.populate('car').then(j =>
      j.populate({ path: 'appointment', select: 'customerName vehicle serviceType preferredDate' })
        .then(j2 => j2.populate('services.service'))
    );
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

    // If services are provided, resolve their current prices
    if (body.services && Array.isArray(body.services)) {
      const { Service } = await import('../models/Service.js');
      const resolvedServices = await Promise.all(body.services.map(async (s) => {
        const serviceId = s.serviceId || s.service;
        const serviceDoc = await Service.findById(serviceId);
        return {
          service: serviceId,
          priceAtTime: serviceDoc ? serviceDoc.basePrice : 0
        };
      }));
      body.services = resolvedServices;
    }

    // Check if job exists before updating
    const existingJob = await Job.findById(req.params.id);
    if (!existingJob) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = await Job.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!job) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });

    // Auto-generate invoice if completed
    if (body.status === 'completed' && existingJob.status !== 'completed') {
      try {
        const { createInvoiceFromJob } = await import('./invoice.controller.js');
        await createInvoiceFromJob(job._id);
      } catch (invoiceErr) {
        console.error('Invoice generation failed:', invoiceErr);
        // We don't want to fail the job update if invoice fails, but maybe log it
      }
    }

    const populatedJob = await job.populate('car').then(j =>
      j.populate({ path: 'appointment', select: 'customerName vehicle serviceType preferredDate' })
        .then(j2 => j2.populate('services.service'))
    );
    res.json({ success: true, data: mapId(populatedJob) });
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

export async function addPartToJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const { partId, quantity } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Job not found' });

    const { InventoryItem } = await import('../models/InventoryItem.js');
    const inventoryItem = await InventoryItem.findById(partId);
    if (!inventoryItem) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Part not found' });

    if (inventoryItem.quantity < quantity) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Insufficient stock' });
    }

    // Deduct from inventory
    inventoryItem.quantity -= quantity;
    inventoryItem.lastUpdated = new Date();
    await inventoryItem.save();

    // Add to job
    job.partsUsed.push({
      part: partId,
      quantity,
      priceAtTime: inventoryItem.price
    });
    await job.save();

    const updatedJob = await Job.findById(jobId).populate('car').populate('partsUsed.part');
    res.json({ success: true, data: mapId(updatedJob) });
  } catch (err) { next(err); }
}

export async function removePartFromJob(req, res, next) {
  try {
    const { jobId, partIndex } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Job not found' });

    const partUsage = job.partsUsed[partIndex];
    if (!partUsage) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Part usage record not found' });

    const { InventoryItem } = await import('../models/InventoryItem.js');
    const inventoryItem = await InventoryItem.findById(partUsage.part);
    if (inventoryItem) {
      // Return to inventory
      inventoryItem.quantity += partUsage.quantity;
      await inventoryItem.save();
    }

    // Remove from job
    job.partsUsed.splice(partIndex, 1);
    await job.save();

    const updatedJob = await Job.findById(jobId).populate('car').populate('partsUsed.part');
    res.json({ success: true, data: mapId(updatedJob) });
  } catch (err) { next(err); }
}


