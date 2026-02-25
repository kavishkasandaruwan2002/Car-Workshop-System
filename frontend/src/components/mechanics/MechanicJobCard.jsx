import React from 'react';
import { motion } from 'framer-motion';
import { Car, Clock, CheckCircle, AlertCircle, Eye, Wrench, ChevronRight } from 'lucide-react';

const MechanicJobCard = ({ job, car, onDetails }) => {
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
            className="premium-card group border-white/40 h-full flex flex-col"
        >
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-workshop-blue group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                        <Car className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight uppercase">
                            {car ? `${car.make} ${car.model}` : (job.appointmentVehicle || 'System Unit')}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            {car ? car.licensePlate : 'Manual Entry'}
                        </p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(job.status)}`}>
                    {job.status.replace('_', ' ')}
                </span>
            </div>

            <div className="space-y-4 mb-8 flex-1">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <span>Progress</span>
                        <span className="text-workshop-blue">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-workshop-blue to-workshop-indigo"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {job.tasks.slice(0, 2).map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <div className={`h-1.5 w-1.5 rounded-full ${t.completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span className={t.completed ? 'line-through opacity-50' : ''}>{t.description}</span>
                        </div>
                    ))}
                    {job.tasks.length > 2 && (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3.5">+{job.tasks.length - 2} More objectives</p>
                    )}
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => onDetails(job)}
                    className="w-full py-3 bg-workshop-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Detailed Analysis <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
};

export default MechanicJobCard;
