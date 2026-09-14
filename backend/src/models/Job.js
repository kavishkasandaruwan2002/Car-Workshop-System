import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    minlength: [1, 'Task description must be at least 1 character'],
    maxlength: [500, 'Task description cannot exceed 500 characters'],
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9\s\-.,!?()&@#$%^+=:;'"<>[\]{}|\\/`~]*$/.test(v);
      },
      message: 'Task description contains invalid characters'
    }
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const serviceItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  priceAtTime: {
    type: Number,
    required: true
  }
}, { _id: false });

const jobSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
    index: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    index: true,
    unique: true,
    sparse: true
  },
  mechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  // Keep string field for legacy or quick display
  assignedMechanic: {
    type: String,
    trim: true
  },
  services: [serviceItemSchema],
  tasks: {
    type: [taskSchema],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'deferred'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  estimatedCompletion: {
    type: Date
  },
  actualCompletion: {
    type: Date
  },
  customerPhone: {
    type: String,
    trim: true
  },
  partsUsed: [{
    part: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    priceAtTime: {
      type: Number,
      required: true
    }
  }],
  laborCost: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  customerFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task completion percentage
jobSchema.virtual('completionPercentage').get(function () {
  if (!this.tasks || this.tasks.length === 0) return 0;
  const completedTasks = this.tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / this.tasks.length) * 100);
});

// Virtual for totalCost
jobSchema.virtual('totalCost').get(function () {
  const partsTotal = this.partsUsed.reduce((sum, item) => sum + (item.quantity * item.priceAtTime), 0);
  const servicesTotal = this.services.reduce((sum, item) => sum + item.priceAtTime, 0);
  return (this.laborCost || 0) + partsTotal + servicesTotal;
});

// Index for better query performance
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ assignedMechanic: 1 });
jobSchema.index({ estimatedCompletion: 1 });

export const Job = mongoose.model('Job', jobSchema);


