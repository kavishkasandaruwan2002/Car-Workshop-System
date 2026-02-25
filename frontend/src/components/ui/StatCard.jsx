import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, sub, icon: Icon, color, bg, trend }) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="premium-card group transition-all"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:rotate-6 transition-transform shadow-sm`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tighter">{value}</p>
                </div>
            </div>
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
                {trend && (
                    <span className={`text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'} flex items-center`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default StatCard;
