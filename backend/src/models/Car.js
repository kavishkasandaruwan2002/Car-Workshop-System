import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true, trim: true },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerEmail: { type: String, trim: true, lowercase: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  color: { type: String },
  vin: { type: String, unique: true, sparse: true }
}, { timestamps: true });

export const Car = mongoose.model('Car', carSchema);


