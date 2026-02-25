import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, User, Edit, Trash2, CheckCircle, AlertCircle, Settings } from 'lucide-react';

const JobCard = ({ job, car, onView, onEdit, onDelete, canEdit, canDelete }) => {
    const completedTasks = job.tasks.filter(t => t.completed).length;
    const totalTasks = job.tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <motion.div
            layout
            whileHover={{ y: -5 }}
            className="premium-card group border-white/40"
        >
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                        <Wrench className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                            {car ? `${car.make} ${car.model}` : (job.appointmentVehicle || 'System Unit')}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {car ? car.licensePlate : 'Manual Entry'}
                        </p>
                    </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(job.status)}`}>
                    {job.status.replace('_', ' ')}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <User className="h-4 w-4 mr-3 text-blue-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">{job.assignedMechanic}</span>
                </div>
                <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <Clock className="h-4 w-4 mr-3 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {job.estimatedCompletion ? new Date(job.estimatedCompletion).toLocaleDateString() : 'TBD'}
                    </span>
                </div>
            </div>

            <div className="space-y-2 mb-8">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    <span>Module Sync</span>
                    <span className="text-blue-600">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => onView(job)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                    View Grid
                </button>
                <div className="flex gap-2">
                    {canEdit && (
                        <button onClick={() => onEdit(job)} className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                            <Edit className="h-5 w-5" />
                        </button>
                    )}
                    {canDelete && (
                        <button onClick={() => onDelete(job.id)} className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all">
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default JobCard;
