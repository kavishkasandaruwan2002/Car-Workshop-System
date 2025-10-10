import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: [true, 'Task description is required'],
    trim: true,
    minlength: [1, 'Task description must be at least 1 character'],
    maxlength: [500, 'Task description cannot exceed 500 characters'],
    validate: {
      validator: function(v) {
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

const jobSchema = new mongoose.Schema({
  car: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Car',
    validate: {
      validator: function(v) {
        return !v || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid car ID format'
    }
  },
  appointment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    index: true, 
    unique: true, 
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid appointment ID format'
    }
  },
  assignedMechanic: { 
    type: String,
    trim: true,
    minlength: [2, 'Assigned mechanic name must be at least 2 characters'],
    maxlength: [50, 'Assigned mechanic name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return !v || /^[a-zA-Z\s\-'\.]+$/.test(v);
      },
      message: 'Assigned mechanic name can only contain letters, spaces, hyphens, apostrophes, and periods'
    }
  },
  tasks: { 
    type: [taskSchema], 
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length <= 20;
      },
      message: 'Tasks array cannot exceed 20 items'
    }
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'in_progress', 'completed'],
      message: 'Status must be one of: pending, in_progress, completed'
    },
    default: 'pending' 
  },
  estimatedCompletion: { 
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        const now = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(now.getFullYear() + 1);
        return v > now && v <= oneYearFromNow;
      },
      message: 'Estimated completion date must be in the future and not more than 1 year ahead'
    }
  }
  ,
  // Optional customer phone stored directly on the job for quick reference
  customerPhone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        // Basic phone validation: digits, +, spaces, hyphens, parentheses
        return /^[0-9+\s\-()]{6,20}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task completion percentage
jobSchema.virtual('completionPercentage').get(function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  const completedTasks = this.tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / this.tasks.length) * 100);
});

// Virtual for isOverdue
jobSchema.virtual('isOverdue').get(function() {
  if (!this.estimatedCompletion) return false;
  return new Date() > this.estimatedCompletion && this.status !== 'completed';
});

// Index for better query performance
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ assignedMechanic: 1 });
jobSchema.index({ estimatedCompletion: 1 });

export const Job = mongoose.model('Job', jobSchema);


