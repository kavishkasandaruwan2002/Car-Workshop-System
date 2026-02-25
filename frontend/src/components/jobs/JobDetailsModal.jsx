import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, Package, Trash2, CheckCircle, Clock, ChevronRight, Settings } from 'lucide-react';

const JobDetailsModal = ({
    isOpen,
    onClose,
    job,
    car,
    inventory,
    onAddPart,
    onRemovePart,
    onUpdateTask,
    canManage,
    navigate
}) => {
    const [selectedPartId, setSelectedPartId] = useState('');
    const [partQuantity, setPartQuantity] = useState(1);

    if (!isOpen || !job) return null;

    const completedTasks = job.tasks.filter(t => t.completed).length;
    const totalTasks = job.tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                            <Wrench className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                                Job #{job.id || job._id?.slice(-6)}
                            </h2>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{car ? `${car.make} ${car.model} • ${car.licensePlate}` : 'System Resource'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-colors shadow-sm">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-10">
                            {/* Task Section */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Logic (Tasks)</h3>
                                    <span className="text-sm font-black text-blue-600">{Math.round(progress)}% Complete</span>
                                </div>
                                <div className="space-y-3">
                                    {job.tasks.map((task, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${task.completed
                                                    ? 'bg-emerald-50 border-emerald-100/50 dark:bg-emerald-500/5 dark:border-emerald-500/20'
                                                    : 'bg-slate-50 border-slate-100/50 dark:bg-slate-900/50 dark:border-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    onClick={() => onUpdateTask(idx, !task.completed)}
                                                    className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'
                                                        }`}
                                                >
                                                    {task.completed && <CheckCircle className="h-4 w-4" />}
                                                </div>
                                                <span className={`text-sm font-bold ${task.completed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {task.description}
                                                </span>
                                            </div>
                                            {task.completed && <Clock className="h-4 w-4 text-emerald-500" />}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Inventory/Parts Section */}
                            <section className="space-y-6">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Resource Allocation (Parts)</h3>
                                <div className="space-y-3">
                                    {job.partsUsed?.length > 0 ? (
                                        job.partsUsed.map((p, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <Package className="h-5 w-5 text-indigo-500" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty: {p.quantity} • ${p.price} ea</p>
                                                    </div>
                                                </div>
                                                {canManage && (
                                                    <button onClick={() => onRemovePart(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No components registered</p>
                                        </div>
                                    )}
                                </div>

                                {canManage && (
                                    <div className="p-6 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-[2rem] space-y-4">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Provision New Component</p>
                                        <div className="flex gap-3">
                                            <select
                                                className="input-field !h-12 !text-xs flex-1"
                                                value={selectedPartId}
                                                onChange={(e) => setSelectedPartId(e.target.value)}
                                            >
                                                <option value="">Select Resource...</option>
                                                {inventory.filter(i => i.quantity > 0).map(i => (
                                                    <option key={i.id} value={i.id}>{i.name} (${i.price})</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                className="input-field !h-12 !w-20 text-center font-bold"
                                                value={partQuantity}
                                                onChange={(e) => setPartQuantity(e.target.value)}
                                                min="1"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (selectedPartId) {
                                                        onAddPart(selectedPartId, partQuantity);
                                                        setSelectedPartId('');
                                                        setPartQuantity(1);
                                                    }
                                                }}
                                                className="btn-primary !py-0 !px-6 !h-12 !text-[10px]"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="space-y-8">
                            <section className="premium-card !p-8 space-y-6">
                                <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-widest uppercase">Overview</h3>
                                <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technician</label>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{job.assignedMechanic}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                                        <p className="text-sm font-black text-blue-600 uppercase tracking-widest">{job.status}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Value</label>
                                        <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">${(job.totalCost || 0).toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    {job.status === 'completed' ? (
                                        <button
                                            onClick={() => navigate('/dashboard/invoices')}
                                            className="w-full btn-primary !h-12 shadow-blue-500/20"
                                        >
                                            View Invoice
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-amber-500" />
                                            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">Operation Ongoing</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default JobDetailsModal;
