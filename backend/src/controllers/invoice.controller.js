import { Invoice } from '../models/Invoice.js';
import { Job } from '../models/Job.js';
import { StatusCodes } from 'http-status-codes';
import { mapArrayId, mapId } from '../middleware/transformResponse.js';
import PDFDocument from 'pdfkit';

export async function listInvoices(req, res, next) {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query = {};

        if (req.user.role === 'customer') {
            query['customer.email'] = req.user.email;
        }

        const results = await Invoice.find(query)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Invoice.countDocuments(query);
        res.json({ success: true, data: mapArrayId(results), page: Number(page), limit: Number(limit), total });
    } catch (err) { next(err); }
}

export async function getInvoice(req, res, next) {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Invoice not found' });

        if (req.user.role === 'customer' && invoice.customer.email !== req.user.email) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Forbidden' });
        }

        res.json({ success: true, data: mapId(invoice) });
    } catch (err) { next(err); }
}

export async function createInvoiceFromJob(jobId) {
    const job = await Job.findById(jobId).populate('car').populate('partsUsed.part');
    if (!job) throw new Error('Job not found');

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const items = [];
    // Labor
    if (job.laborCost > 0) {
        items.push({
            description: 'Labor Charges',
            quantity: 1,
            unitPrice: job.laborCost,
            total: job.laborCost,
            type: 'labor'
        });
    }

    // Parts
    job.partsUsed.forEach(pu => {
        items.push({
            description: pu.part.name,
            quantity: pu.quantity,
            unitPrice: pu.priceAtTime,
            total: pu.quantity * pu.priceAtTime,
            type: 'part'
        });
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% VAT
    const totalAmount = subtotal + tax;

    const invoice = await Invoice.create({
        invoiceNumber,
        job: job._id,
        customer: {
            name: job.car?.customerName || 'Walk-in Customer',
            email: job.car?.customerEmail,
            phone: job.car?.customerPhone
        },
        vehicle: {
            licensePlate: job.car?.licensePlate,
            make: job.car?.make,
            model: job.car?.model
        },
        items,
        subtotal,
        tax,
        totalAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days due
    });

    return invoice;
}

export async function downloadInvoicePDF(req, res, next) {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Invoice not found' });

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
        doc.pipe(res);

        // Header
        doc.fontSize(25).text('PUEFIX WORKSHOP', { align: 'center' });
        doc.fontSize(10).text('Official Service Invoice', { align: 'center' });
        doc.moveDown(2);

        // Invoice Info
        doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
        doc.moveDown();

        // Customer Info
        doc.fontSize(14).text('Bill To:', { underline: true });
        doc.fontSize(12).text(invoice.customer.name);
        if (invoice.customer.email) doc.text(invoice.customer.email);
        if (invoice.customer.phone) doc.text(invoice.customer.phone);
        doc.moveDown();

        // Vehicle Info
        doc.fontSize(14).text('Vehicle Details:', { underline: true });
        doc.fontSize(12).text(`Plate: ${invoice.vehicle.licensePlate}`);
        doc.text(`Make/Model: ${invoice.vehicle.make} ${invoice.vehicle.model}`);
        doc.moveDown();

        // Table Header
        const tableTop = 350;
        doc.fontSize(12).text('Description', 50, tableTop, { bold: true });
        doc.text('Qty', 250, tableTop, { bold: true });
        doc.text('Unit Price', 350, tableTop, { bold: true });
        doc.text('Total', 450, tableTop, { bold: true });
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Items
        let y = tableTop + 25;
        invoice.items.forEach(item => {
            doc.fontSize(10).text(item.description, 50, y);
            doc.text(String(item.quantity), 250, y);
            doc.text(`$${item.unitPrice.toFixed(2)}`, 350, y);
            doc.text(`$${item.total.toFixed(2)}`, 450, y);
            y += 20;
        });

        doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
        y += 15;

        // Totals
        doc.fontSize(12).text('Subtotal:', 350, y);
        doc.text(`$${invoice.subtotal.toFixed(2)}`, 450, y);
        y += 20;
        doc.fontSize(12).text('Tax (10%):', 350, y);
        doc.text(`$${invoice.tax.toFixed(2)}`, 450, y);
        y += 20;
        doc.fontSize(14).text('Total Amount:', 350, y, { bold: true });
        doc.text(`$${invoice.totalAmount.toFixed(2)}`, 450, y, { bold: true });

        // Footer
        doc.fontSize(10).text('Thank you for choosing PUEFIX Workshop!', 50, 700, { align: 'center' });

        doc.end();
    } catch (err) { next(err); }
}
