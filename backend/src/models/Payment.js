import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  jobSheetId: { type: Number },
  carId: { type: Number },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'cash'], required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['completed', 'pending'], default: 'completed' },
  transactionId: { type: String },
  cardLastFour: { type: String }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);


