import React from 'react';
import { FileText, Download, Printer, BarChart3, Clock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const ReportsTab = ({
    onGenerateCars,
    onGenerateJobs,
    onGenerateInventory,
    onGenerateMechanics,
    onGeneratePayments
}) => {
    const reports = [
        { title: 'Vehicle Fleet', desc: 'Full list of registered cars and owners.', icon: FileText, action: onGenerateCars, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Workshop Lifecycle', desc: 'Job sheet history and repair performance.', icon: Clock, action: onGenerateJobs, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { title: 'Asset Inventory', desc: 'Current stock levels and valuation.', icon: printer => <Printer />, action: onGenerateInventory, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Staff Directory', desc: 'Mechanic skills and availability summary.', icon: ShieldAlert, action: onGenerateMechanics, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { title: 'Financial Ledger', desc: 'Payment history and revenue collection.', icon: BarChart3, action: onGeneratePayments, color: 'text-purple-500', bg: 'bg-purple-500/10' }
    ];

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Intelligence Hub</h2>
                <p className="text-slate-500 font-medium">Generate high-fidelity PDF reports for audit and analysis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reports.map((report, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="premium-card group cursor-pointer"
                        onClick={report.action}
                    >
                        <div className="flex items-start justify-between">
                            <div className={`p-4 rounded-2xl ${report.bg} ${report.color} group-hover:scale-110 transition-transform`}>
                                {typeof report.icon === 'function' ? report.icon() : <report.icon className="h-7 w-7" />}
                            </div>
                            <Download className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="mt-6">
                            <h3 className="text-lg font-black text-slate-800">{report.title}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">{report.desc}</p>
                        </div>
                        <button className="mt-6 w-full py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            Generate PDF
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ReportsTab;
