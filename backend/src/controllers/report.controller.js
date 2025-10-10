import PDFDocument from 'pdfkit';
import { Car } from '../models/Car.js';
import { Job } from '../models/Job.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { Mechanic } from '../models/Mechanic.js';
import { Payment } from '../models/Payment.js';
import { StatusCodes } from 'http-status-codes';

function startDoc(res, filename) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  return doc;
}

function header(doc, title) {
  doc.fontSize(18).text(title, { align: 'left' });
  doc.moveDown(0.25);
  doc.fontSize(10).fillColor('#555').text(`Generated at ${new Date().toLocaleString()}`);
  doc.fillColor('black');
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ccc').stroke();
  doc.moveDown(0.5);
}

function table(doc, columns, rows) {
  const colWidths = columns.map(() => (515 / columns.length));
  const x0 = 40;
  let y = doc.y;

  doc.fontSize(11).fillColor('#111');
  columns.forEach((c, i) => doc.text(String(c), x0 + i * colWidths[i], y, { width: colWidths[i], continued: false }));
  y = doc.y + 6;
  doc.moveTo(40, y).lineTo(555, y).strokeColor('#ddd').stroke();
  y += 6;

  doc.fontSize(10).fillColor('#222');
  rows.forEach((row) => {
    const cellHeights = row.map((cell, i) => doc.heightOfString(String(cell ?? ''), { width: colWidths[i] }));
    const rowHeight = Math.max(14, ...cellHeights) + 4;
    if (y + rowHeight > 780) { doc.addPage(); y = 40; }
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ''), x0 + i * colWidths[i], y, { width: colWidths[i] });
    });
    y += rowHeight;
  });
  doc.moveDown(1);
}

export async function carsReport(req, res, next) {
  try {
    const list = await Car.find({}).sort({ createdAt: -1 });
    const doc = startDoc(res, 'car-profiles-report.pdf');
    header(doc, 'Car Profiles Report');
    const columns = ['License Plate', 'Customer', 'Phone', 'Email', 'Make', 'Model', 'Year', 'Created'];
    const rows = list.map(c => [
      c.licensePlate,
      c.customerName,
      c.customerPhone,
      c.customerEmail || '-',
      c.make,
      c.model,
      c.year || '-',
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'
    ]);
    table(doc, columns, rows);
    doc.end();
  } catch (err) { next(err); }
}

export async function jobsReport(req, res, next) {
  try {
    const list = await Job.find({}).sort({ createdAt: -1 });
    const doc = startDoc(res, 'job-sheet-report.pdf');
    header(doc, 'Job Sheet Report');
    const columns = ['Job ID', 'Car ID', 'Assigned Mechanic', 'Status', 'Est. Completion'];
    const rows = list.map(j => [
      String(j._id),
      String(j.car || '-'),
      j.assignedMechanic || '-',
      j.status,
      j.estimatedCompletion ? new Date(j.estimatedCompletion).toLocaleString() : '-'
    ]);
    table(doc, columns, rows);
    doc.end();
  } catch (err) { next(err); }
}

export async function inventoryReport(req, res, next) {
  try {
    const list = await InventoryItem.find({}).sort({ updatedAt: -1 });
    const doc = startDoc(res, 'inventory-report.pdf');
    header(doc, 'Inventory Report');
    const columns = ['Item', 'SKU', 'Qty', 'Unit Price', 'Category', 'Updated'];
    const rows = list.map(it => [
      it.name || '-',
      it.sku || '-',
      it.quantity ?? '-',
      typeof it.price === 'number' ? it.price.toFixed(2) : '-',
      it.category || '-',
      it.updatedAt ? new Date(it.updatedAt).toLocaleDateString() : '-'
    ]);
    table(doc, columns, rows);
    doc.end();
  } catch (err) { next(err); }
}

export async function mechanicsReport(req, res, next) {
  try {
    const list = await Mechanic.find({}).sort({ createdAt: -1 });
    const doc = startDoc(res, 'mechanics-report.pdf');
    header(doc, 'Mechanics Report');
    const columns = ['Name', 'Email', 'Phone', 'Availability', 'Experience'];
    const rows = list.map(m => [
      m.name,
      m.email,
      m.phone || '-',
      m.availability || '-',
      m.experience || '-'
    ]);
    table(doc, columns, rows);
    doc.end();
  } catch (err) { next(err); }
}

export async function paymentsReport(req, res, next) {
  try {
    const list = await Payment.find({}).sort({ createdAt: -1 });
    const doc = startDoc(res, 'payments-report.pdf');
    header(doc, 'Payments Report');
    const columns = ['Payment ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'];
    const rows = list.map(p => [
      String(p._id),
      p.customerName || p.customer || '-',
      typeof p.amount === 'number' ? p.amount.toFixed(2) : '-',
      p.method || '-',
      p.status || '-',
      p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'
    ]);
    table(doc, columns, rows);
    doc.end();
  } catch (err) { next(err); }
}
