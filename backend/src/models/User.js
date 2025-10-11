 import mongoose from 'mongoose';
 import bcrypt from 'bcryptjs';
 
 const userSchema = new mongoose.Schema({
   name: { type: String, required: true, trim: true },
   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
   passwordHash: { type: String, required: true },
   role: { type: String, enum: ['owner', 'receptionist', 'mechanic', 'customer'], required: true },
   avatar: { type: String },
   phone: { type: String, trim: true },
   address: { type: String, trim: true },
   nic: { type: String, trim: true },
 }, { timestamps: true });
 
 userSchema.methods.comparePassword = async function(password) {
   return bcrypt.compare(password, this.passwordHash);
 };
 
 userSchema.statics.hashPassword = async function(password) {
   const salt = await bcrypt.genSalt(10);
   return bcrypt.hash(password, salt);
 };
 
 export const User = mongoose.model('User', userSchema);


