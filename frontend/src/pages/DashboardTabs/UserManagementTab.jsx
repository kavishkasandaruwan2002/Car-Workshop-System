import React, { useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import { UserPlus, Search, Edit, Trash2, Key, Check, X, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagementTab = ({
    customers,
    receptionists,
    onEditCustomer,
    onDeleteCustomer,
    onAddReceptionist,
    onResetMechanicPassword,
    show
}) => {
    const [subTab, setSubTab] = useState('customers');

    const customerCols = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Address', accessor: 'address' },
    ];

    const receptionistCols = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'NIC / ID', accessor: 'nic' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex gap-4 p-1 glass-panel w-fit rounded-2xl">
                <button
                    onClick={() => setSubTab('customers')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${subTab === 'customers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Customers
                </button>
                <button
                    onClick={() => setSubTab('receptionists')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${subTab === 'receptionists' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Receptionists
                </button>
                <button
                    onClick={() => setSubTab('mechanics')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${subTab === 'mechanics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Mechanic Access
                </button>
            </div>

            <AnimatePresence mode="wait">
                {subTab === 'customers' && (
                    <motion.div
                        key="customers"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <Users className="text-blue-500" /> Customer base
                            </h3>
                        </div>
                        <DataTable
                            columns={customerCols}
                            data={customers}
                            actions={(row) => (
                                <>
                                    <button onClick={() => onEditCustomer(row)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => onDeleteCustomer(row._id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        />
                    </motion.div>
                )}

                {subTab === 'receptionists' && (
                    <motion.div
                        key="receptionists"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <Shield className="text-indigo-500" /> Workshop Staff
                            </h3>
                            <button
                                className="btn-primary !py-2 !px-4"
                                onClick={() => onAddReceptionist()}
                            >
                                <UserPlus className="h-4 w-4 mr-2" /> Add Staff
                            </button>
                        </div>
                        <DataTable
                            columns={receptionistCols}
                            data={receptionists}
                        />
                    </motion.div>
                )}

                {subTab === 'mechanics' && (
                    <motion.div
                        key="mechanics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="premium-card space-y-8"
                    >
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Mechanic Access Control</h3>
                            <p className="text-slate-500 font-medium">Reset credentials or provision new technician accounts.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Password Reset</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Mechanic NIC"
                                        className="input-field !py-3"
                                        id="mechNICInput"
                                    />
                                    <button
                                        onClick={() => {
                                            const nic = document.getElementById('mechNICInput').value;
                                            onResetMechanicPassword(nic);
                                        }}
                                        className="btn-secondary whitespace-nowrap"
                                    >
                                        <Key className="h-4 w-4 mr-2" /> Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagementTab;
