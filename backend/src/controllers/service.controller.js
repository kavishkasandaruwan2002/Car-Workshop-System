import { Service } from '../models/Service.js';
import { StatusCodes } from 'http-status-codes';
import { mapArrayId, mapId } from '../middleware/transformResponse.js';

export async function listServices(req, res, next) {
    try {
        const { category, search } = req.query;
        const query = { isActive: true };

        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };

        const services = await Service.find(query).sort({ name: 1 });
        res.json({ success: true, data: mapArrayId(services) });
    } catch (err) { next(err); }
}

export async function getService(req, res, next) {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Service not found' });
        res.json({ success: true, data: mapId(service) });
    } catch (err) { next(err); }
}

export async function createService(req, res, next) {
    try {
        const service = await Service.create(req.body);
        res.status(StatusCodes.CREATED).json({ success: true, data: mapId(service) });
    } catch (err) { next(err); }
}

export async function updateService(req, res, next) {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!service) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Service not found' });
        res.json({ success: true, data: mapId(service) });
    } catch (err) { next(err); }
}

export async function deleteService(req, res, next) {
    try {
        // Soft delete
        const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!service) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Service not found' });
        res.json({ success: true, message: 'Service deactivated successfully' });
    } catch (err) { next(err); }
}
