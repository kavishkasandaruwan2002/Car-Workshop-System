import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: 0
    },
    estimatedDuration: {
        type: Number, // in minutes
        default: 60
    },
    category: {
        type: String,
        enum: ['Maintenance', 'Repair', 'Body Work', 'Detailing', 'Diagnostics', 'Other'],
        default: 'Maintenance'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Service = mongoose.model('Service', serviceSchema);
