import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { listInvoices, getInvoice, downloadInvoicePDF } from '../controllers/invoice.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listInvoices);
router.get('/:id', getInvoice);
router.get('/:id/pdf', downloadInvoicePDF);

export default router;
