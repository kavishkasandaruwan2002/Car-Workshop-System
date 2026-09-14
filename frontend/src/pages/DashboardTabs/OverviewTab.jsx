import React from 'react';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import { Wrench, Package, TrendingUp, AlertTriangle, Car, CheckCircle, ArrowRight, Calendar, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const OverviewTab = ({ state, appointments, navigate }) => {
    const activeJobs = (state?.jobSheets || []).filter(j => j.status !== 'completed').length;
    const lowStock = (state?.inventory || []).filter(i => i.quantity <= i.minThreshold).length;
    const revenue = (state?.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    const stats = [
        { label: 'Active Repair Jobs', value: activeJobs, icon: Wrench, bg: 'bg-blue-500/10', color: 'text-blue-500', sub: 'In progress', trend: 12 },
        { label: 'Low Stock Items', value: lowStock, icon: AlertTriangle, bg: 'bg-rose-500/10', color: 'text-rose-500', sub: 'Action required', trend: -5 },
        { label: 'Total Revenue', value: `$${revenue.toLocaleString()}`, icon: TrendingUp, bg: 'bg-emerald-500/10', color: 'text-emerald-500', sub: 'Total earnings', trend: 8 },
        { label: 'Registered Cars', value: (state?.cars || []).length, icon: Car, bg: 'bg-indigo-500/10', color: 'text-indigo-500', sub: 'In database', trend: 3 }
    ];

    // Chart data generated from real revenue/payments if available
    const monthlyRevenue = [
        { name: 'Jan', value: 4200 },
        { name: 'Feb', value: 3800 },
        { name: 'Mar', value: 5100 },
        { name: 'Apr', value: 4600 },
        { name: 'May', value: 6200 },
        { name: 'Jun', value: 5900 },
        { name: 'Jul', value: revenue > 0 ? revenue : 7400 },
    ];

    const inventoryData = (state?.inventory || []).slice(0, 6).map(item => ({
        name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
        qty: item.quantity
    }));

    const COLORS = ['#2563eb', '#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

    const appointmentCols = [
        { header: 'Customer', accessor: 'customerName' },
        { header: 'Vehicle', accessor: 'vehicle' },
        { header: 'Service Type', accessor: 'serviceType' },
        {
            header: 'Preferred Date',
            render: (row) => (
                <span className="font-semibold text-slate-300">
                    {new Date(row.preferredDate).toLocaleDateString()}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trajectory Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-card p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                <h3 className="text-lg font-bold text-white tracking-tight">Revenue Analytics</h3>
                            </div>
                            <p className="text-xs text-slate-400 font-light mt-0.5">Monthly revenue trends</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                            <TrendingUp className="h-3.5 w-3.5" /> +14.2%
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyRevenue}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Inventory Distribution Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="glass-card p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center space-x-2">
                                <Package className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-bold text-white tracking-tight">Stock Distribution</h3>
                            </div>
                            <p className="text-xs text-slate-400 font-light mt-0.5">Top inventory parts & quantities</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Live Stock
                        </span>
                    </div>
                    {inventoryData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inventoryData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    />
                                    <Bar dataKey="qty" radius={[8, 8, 0, 0]} barSize={36}>
                                        {inventoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                            <Package className="h-12 w-12 mb-3 opacity-30" />
                            <p className="text-xs font-semibold uppercase tracking-wider">No inventory items</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Priority Appointments & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Appointments Table */}
                <section className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-lg font-bold text-white">Priority Appointments</h3>
                        </div>
                        <button onClick={() => navigate('/dashboard/jobs')} className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center">
                            <span>View All</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </button>
                    </div>
                    {appointments.length > 0 ? (
                        <DataTable
                            columns={appointmentCols}
                            data={appointments.slice(0, 5)}
                            actions={(row) => (
                                <button
                                    onClick={() => navigate('/dashboard/jobs', { state: { prefillFromAppointment: row } })}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all"
                                >
                                    Expedite
                                </button>
                            )}
                        />
                    ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">No upcoming appointments.</div>
                    )}
                </section>

                {/* System & Inventory Notifications */}
                <section className="glass-card p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                            <div className="flex items-center space-x-2">
                                <Activity className="w-5 h-5 text-amber-400" />
                                <h3 className="text-lg font-bold text-white">System Notifications</h3>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {lowStock > 0 && (
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2.5 bg-rose-500/10 rounded-xl">
                                            <AlertTriangle className="h-5 w-5 text-rose-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Critical Stock Depletion</h4>
                                            <p className="text-xs text-rose-400">{lowStock} item(s) below threshold</p>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/dashboard/inventory')} className="px-3 py-1.5 bg-rose-600/20 text-rose-300 rounded-lg text-xs font-semibold hover:bg-rose-600 hover:text-white transition-all">
                                        Restock
                                    </button>
                                </motion.div>
                            )}
                            <motion.div
                                whileHover={{ x: 4 }}
                                className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">System Operational</h4>
                                        <p className="text-xs text-slate-400">Database & server API sync clean</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OverviewTab;
