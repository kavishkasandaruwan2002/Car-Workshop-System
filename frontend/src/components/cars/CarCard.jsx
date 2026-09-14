import React from 'react';
import { motion } from 'framer-motion';
import { Car, User, Phone, Mail, Calendar, Wrench, Eye, Edit, Trash2, ShieldCheck } from 'lucide-react';

const CarCard = ({ car, repairCount, lastService, onViewHistory, onEdit, onDelete, canDelete }) => {
    return (
        <motion.div
            layout
            whileHover={{ y: -5 }}
            className="premium-card group border-white/40"
        >
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center text-slate-500 group-hover:from-workshop-blue group-hover:to-workshop-indigo group-hover:text-white transition-all shadow-inner group-hover:rotate-6">
                        <Car className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">{car.licensePlate}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{car.year} {car.make} {car.model}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onViewHistory(car)} className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-workshop-blue rounded-xl transition-all">
                        <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => onEdit(car)} className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                        <Edit className="h-5 w-5" />
                    </button>
                    {canDelete && (
                        <button onClick={() => onDelete(car.id)} className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-600 rounded-xl transition-all">
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                    <User className="h-4 w-4 text-workshop-blue" />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{car.customerName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                        <Phone className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">{car.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 truncate">{car.vin || 'NO VIN'}</span>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600">
                        <Wrench className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{repairCount} Service Logs</span>
                </div>
                {lastService && (
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Sync</p>
                        <p className="text-[10px] font-bold text-blue-600">{new Date(lastService).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CarCard;
