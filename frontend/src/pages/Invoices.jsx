import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../api/client';
import { useToast } from '../components/Toast';
import {
    FileText,
    Download,
    Search,
    Filter,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Invoices = () => {
    const { state, dispatch } = useApp();
    const { show } = useToast();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const resp = await apiRequest('/invoices');
                dispatch({ type: 'SET_INVOICES', payload: resp.data });
            } catch (e) {
                show('Failed to load invoices', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, [dispatch]);

    const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            show('Failed to download invoice', 'error');
        }
    };

    const filteredInvoices = state.invoices.filter(inv => {
        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'unpaid': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 pb-20"
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-black gradient-text tracking-tighter">Billing Ledger</h1>
                    <p className="mt-2 text-slate-500 font-medium text-lg">
                        Manage financial transactions and professional invoices accurately
                    </p>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Billed', value: state.invoices.reduce((s, i) => s + i.totalAmount, 0), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Pending Payments', value: state.invoices.filter(i => i.status === 'unpaid').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Revenue Collected', value: state.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0), icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((stat, idx) => (
                    <motion.div key={idx} variants={itemVariants} className="premium-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                                    {typeof stat.value === 'number' && stat.label.includes('Total') || stat.label.includes('Revenue')
                                        ? `$${stat.value.toLocaleString()}`
                                        : stat.value}
                                </p>
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-[2.5rem] flex flex-wrap items-center gap-6">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by invoice #, customer, or plate..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field !pl-14 !h-14 font-bold !rounded-2xl"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field !h-14 !w-48 font-bold !rounded-2xl"
                >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </motion.div>

            {/* Invoice List */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredInvoices.map((invoice) => (
                        <motion.div
                            key={invoice.id || invoice._id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="premium-card group hover:scale-[1.01] transition-all !p-6"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <FileText className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">#{invoice.invoiceNumber}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500">
                                            {invoice.customer.name} • {invoice.vehicle.make} {invoice.vehicle.model} ({invoice.vehicle.licensePlate})
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                                        <p className="text-2xl font-black text-slate-800 dark:text-white">${invoice.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</p>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleDownloadPDF(invoice.id || invoice._id, invoice.invoiceNumber)}
                                            className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all"
                                            title="Download PDF"
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                            title="View Details"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredInvoices.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Invoices Found</h3>
                    <p className="text-slate-400 font-medium mt-2">Try adjusting your filters or search terms</p>
                </div>
            )}
        </motion.div>
    );
};

export default Invoices;
