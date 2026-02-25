import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    customer: {
        name: String,
        email: String,
        phone: String
    },
    vehicle: {
        licensePlate: String,
        make: String,
        model: String
    },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
        type: { type: String, enum: ['labor', 'part'] }
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['unpaid', 'partially_paid', 'paid', 'cancelled'],
        default: 'unpaid'
    },
    dueDate: Date,
    paidAmount: { type: Number, default: 0 },
    paymentHistory: [{
        payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
        amount: Number,
        date: Date
    }]
}, { timestamps: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
