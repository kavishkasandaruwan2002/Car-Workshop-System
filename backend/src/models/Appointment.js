import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  vehicle: { type: String, required: true },
  serviceType: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'scheduled', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export const Appointment = mongoose.model('Appointment', appointmentSchema);


