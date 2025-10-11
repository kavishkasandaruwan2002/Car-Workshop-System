 import mongoose from 'mongoose';

 const mechanicSchema = new mongoose.Schema({
   name: { type: String, required: true },
   email: { type: String, required: true, lowercase: true, unique: true },
   phone: { type: String },
   skills: { type: [String], default: [] },
   availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
   experience: { type: String }
 }, { timestamps: true });
 
 export const Mechanic = mongoose.model('Mechanic', mechanicSchema);


