import React from 'react';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import { Wrench, Package, TrendingUp, AlertTriangle, Car, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const OverviewTab = ({ state, appointments, navigate }) => {
    const activeJobs = state.jobSheets.filter(j => j.status !== 'completed').length;
    const lowStock = state.inventory.filter(i => i.quantity <= i.minThreshold).length;
    const revenue = state.payments.reduce((sum, p) => sum + p.amount, 0);

    const stats = [
        { label: 'Active Jobs', value: activeJobs, icon: Wrench, bg: 'bg-blue-500/10', color: 'text-blue-500', sub: 'In progress', trend: 12 },
        { label: 'Low Stock', value: lowStock, icon: AlertTriangle, bg: 'bg-rose-500/10', color: 'text-rose-500', sub: 'Action required', trend: -5 },
        { label: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: TrendingUp, bg: 'bg-emerald-500/10', color: 'text-emerald-500', sub: 'Total earnings', trend: 8 },
        { label: 'Total Cars', value: state.cars.length, icon: Car, bg: 'bg-indigo-500/10', color: 'text-indigo-500', sub: 'In database', trend: 3 }
    ];

    // Mock/Aggregated chart data
    const chartData = [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 2000 },
        { name: 'Apr', value: 2780 },
        { name: 'May', value: 1890 },
        { name: 'Jun', value: 2390 },
        { name: 'Jul', value: revenue > 0 ? revenue : 3490 },
    ];

    const inventoryData = state.inventory.slice(0, 5).map(item => ({
        name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
        qty: item.quantity
    }));

    const COLORS = ['#2563eb', '#4f46e5', '#10b981', '#f59e0b', '#f43f5e'];

    const appointmentCols = [
        { header: 'Customer', accessor: 'customerName' },
        { header: 'Vehicle', accessor: 'vehicle' },
        { header: 'Service', accessor: 'serviceType' },
        {
            header: 'Date',
            render: (row) => new Date(row.preferredDate).toLocaleDateString()
        }
    ];

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="premium-card !p-8 h-[400px]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Revenue Trajectory</h3>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
                            <TrendingUp className="h-3 w-3" /> +14.2%
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)', padding: '12px' }}
                                itemStyle={{ fontWeight: 800, color: '#1e293b' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Inventory Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="premium-card !p-8 h-[400px]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Asset Distribution</h3>
                        <Package className="h-5 w-5 text-slate-400" />
                    </div>
                    {inventoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={inventoryData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="qty" radius={[10, 10, 0, 0]} barSize={40}>
                                    {inventoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[80%] flex flex-col items-center justify-center text-slate-400">
                            <Package className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">No assets registered</p>
                        </div>
                    )}
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Priority Protocol</h2>
                        <button onClick={() => navigate('/dashboard/jobs')} className="group flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors">
                            Full Terminal <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <DataTable
                        columns={appointmentCols}
                        data={appointments.slice(0, 5)}
                        actions={(row) => (
                            <button
                                onClick={() => navigate('/dashboard/jobs', { state: { prefillFromAppointment: row } })}
                                className="btn-primary !py-2.5 !px-5 !text-[10px] !tracking-widest"
                            >
                                EXPEDITE
                            </button>
                        )}
                    />
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Network Status</h2>
                    </div>
                    <div className="space-y-4">
                        {lowStock > 0 && (
                            <motion.div
                                whileHover={{ x: 5 }}
                                className="premium-card !p-6 border-l-4 border-l-rose-500 flex items-center justify-between bg-rose-500/5 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-rose-500/10 rounded-2xl">
                                        <AlertTriangle className="h-6 w-6 text-rose-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Critical Depletion</h4>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{lowStock} units below safety threshold</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/dashboard/inventory')} className="p-3 bg-white dark:bg-slate-800 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </motion.div>
                        )}
                        <motion.div
                            whileHover={{ x: 5 }}
                            className="premium-card !p-6 border-l-4 border-l-emerald-500 flex items-center justify-between bg-emerald-500/5 transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">System Operational</h4>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">All protocols verified and sync successful</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OverviewTab;

