import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DataTable = ({ columns, data, actions, emptyMessage = "No data available" }) => {
    return (
        <div className="glass-panel overflow-hidden rounded-[2rem] border-white/40 dark:border-white/5 shadow-2xl">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
                                >
                                    {col.header}
                                </th>
                            ))}
                            {actions && (
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800 bg-transparent">
                        <AnimatePresence mode="popLayout">
                            {data.map((row, rowIdx) => (
                                <motion.tr
                                    key={row.id || row._id || rowIdx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors"
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-8 py-5 whitespace-nowrap">
                                            {col.render ? col.render(row) : (
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {row[col.accessor]}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {actions(row)}
                                            </div>
                                        </td>
                                    )}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 font-medium">{emptyMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
