import express from 'express';
import {
    listServices,
    getService,
    createService,
    updateService,
    deleteService
} from '../controllers/service.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Publicly accessible for listing (customers can see services)
router.get('/', listServices);
router.get('/:id', getService);

// Only workshop staff can manage the service catalog
router.use(protect);
router.use(restrictTo('owner', 'receptionist'));

router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
