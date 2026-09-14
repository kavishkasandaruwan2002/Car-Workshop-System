import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Calendar, Wrench, User, Car as CarIcon, Settings } from 'lucide-react';

const JobFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingJob,
    cars,
    mechanics,
    customers,
    appointmentContext,
    services = [] // New: workshop services
}) => {
    const [formData, setFormData] = useState({
        carId: '',
        assignedMechanic: '',
        tasks: [{ description: '', completed: false }],
        estimatedCompletion: '',
        customerPhone: '',
        selectedServices: [] // New: selected service IDs
    });

    const [selectedOwnerId, setSelectedOwnerId] = useState('');

    useEffect(() => {
        if (editingJob) {
            setFormData({
                ...editingJob,
                carId: editingJob.carId || '',
                tasks: Array.isArray(editingJob.tasks) ? editingJob.tasks : [{ description: '', completed: false }],
                selectedServices: editingJob.services?.map(s => s.serviceId) || []
            });

            const car = cars.find(c => c.id === editingJob.carId);
            if (car) {
                const owner = customers.find(cust => cust.email === car.customerEmail || cust.name === car.customerName);
                if (owner) setSelectedOwnerId(owner.id || owner._id);
            }
        } else {
            setFormData({
                carId: '',
                assignedMechanic: '',
                tasks: [{ description: '', completed: false }],
                estimatedCompletion: '',
                customerPhone: '',
                selectedServices: []
            });
            setSelectedOwnerId('');
        }
    }, [editingJob, cars, customers]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addTask = () => setFormData(prev => ({ ...prev, tasks: [...prev.tasks, { description: '', completed: false }] }));
    const removeTask = (idx) => setFormData(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== idx) }));
    const updateTask = (idx, val) => {
        const nt = [...formData.tasks];
        nt[idx].description = val;
        setFormData(prev => ({ ...prev, tasks: nt }));
    };

    const toggleService = (serviceId) => {
        setFormData(prev => {
            const isSelected = prev.selectedServices.includes(serviceId);
            const newServices = isSelected
                ? prev.selectedServices.filter(id => id !== serviceId)
                : [...prev.selectedServices, serviceId];

            // Auto-add service name to tasks if newly selected
            let newTasks = [...prev.tasks];
            if (!isSelected) {
                const service = services.find(s => s._id === serviceId);
                if (service && !newTasks.some(t => t.description === service.name)) {
                    if (newTasks.length === 1 && !newTasks[0].description) {
                        newTasks[0].description = service.name;
                    } else {
                        newTasks.push({ description: service.name, completed: false });
                    }
                }
            }

            return { ...prev, selectedServices: newServices, tasks: newTasks };
        });
    };

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
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                            {editingJob ? 'Refine Operation' : 'Initiate Repair'}
                        </h2>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Workshop Control Protocol</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-colors shadow-sm">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="overflow-y-auto p-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="space-y-6">
                            <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Identity & Asset</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Authority</label>
                                    <select
                                        className="input-field font-bold !h-14"
                                        value={selectedOwnerId}
                                        onChange={(e) => setSelectedOwnerId(e.target.value)}
                                    >
                                        <option value="">Select Customer...</option>
                                        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Unit</label>
                                    <select
                                        name="carId"
                                        className="input-field font-bold !h-14"
                                        value={formData.carId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Identify Asset...</option>
                                        {cars.filter(c => !selectedOwnerId || c.customerName === customers.find(cust => cust._id === selectedOwnerId)?.name).map(c => (
                                            <option key={c.id} value={c.id}>{c.licensePlate} - {c.make} {c.model}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Personnel & Timeline</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Liaison</label>
                                    <select
                                        name="assignedMechanic"
                                        className="input-field font-bold !h-14"
                                        value={formData.assignedMechanic}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Assign Specialist...</option>
                                        {mechanics.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Completion</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input
                                            type="date"
                                            name="estimatedCompletion"
                                            className="input-field !pl-12 font-bold !h-14"
                                            value={formData.estimatedCompletion?.split('T')[0]}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="space-y-6">
                        <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Service Selection</h3>
                        <div className="flex flex-wrap gap-3">
                            {services.map(s => (
                                <button
                                    key={s._id}
                                    type="button"
                                    onClick={() => toggleService(s._id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${formData.selectedServices.includes(s._id)
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/30'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                                        }`}
                                >
                                    {s.name} • ${s.basePrice}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-orange-600 uppercase tracking-[0.2em]">Execution Modules (Tasks)</h3>
                            <button type="button" onClick={addTask} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                                <Plus className="h-4 w-4" /> Add Step
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.tasks.map((task, idx) => (
                                <div key={idx} className="flex gap-3 group">
                                    <input
                                        className="input-field flex-1 !h-12 font-medium"
                                        value={task.description}
                                        onChange={(e) => updateTask(idx, e.target.value)}
                                        placeholder={`Module ${idx + 1} objective...`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeTask(idx)}
                                        className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="pt-10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1 !h-16 font-black uppercase tracking-widest !rounded-2xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-[2] !h-16 font-black uppercase tracking-widest !rounded-2xl shadow-2xl shadow-blue-500/40 active:scale-95 transition-all"
                        >
                            {editingJob ? 'Apply Modification' : 'Confirm & Sync'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default JobFormModal;
