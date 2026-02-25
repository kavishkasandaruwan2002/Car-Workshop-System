import React, { useState } from 'react';
import { NotificationInboxPopover } from '@/components/ui/notification-inbox-popover';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
// import { useApp } from '../context/AppContext'; // Not currently used
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  Home,
  Car,
  Wrench,
  Package,
  Users,
  BarChart3,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  FileText,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { show } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['owner', 'receptionist'], color: 'from-blue-600 to-blue-400' },
    { name: 'Cars', href: '/dashboard/cars', icon: Car, roles: ['owner', 'receptionist'], color: 'from-indigo-600 to-indigo-400' },
    { name: 'Job Sheets', href: '/dashboard/jobs', icon: Wrench, roles: ['owner', 'receptionist'], color: 'from-blue-500 to-indigo-500' },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package, roles: ['owner'], color: 'from-emerald-600 to-teal-400' },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText, roles: ['owner', 'receptionist'], color: 'from-amber-600 to-orange-400' },
    { name: 'Mechanics', href: '/dashboard/mechanics', icon: Users, roles: ['owner'], color: 'from-violet-600 to-purple-400' },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['owner', 'receptionist'], color: 'from-rose-600 to-pink-400' },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    show('Logged out successfully. See you next time!', 'success');
    logout();
    navigate('/');
  };

  const isCurrentPath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex w-80 h-full flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800"
            >
              <div className="flex h-20 items-center justify-between px-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black gradient-text tracking-tighter uppercase">PUEFIX</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 space-y-1.5 px-4 py-8">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isCurrentPath(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-4 py-4 text-sm font-black rounded-2xl transition-all ${active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-xl shadow-blue-500/20`
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className={`mr-4 h-5 w-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
                      <span className="uppercase tracking-widest text-[10px]">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Detached & Floating */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col z-50 p-6">
        <div className="flex flex-col flex-grow glass-panel border border-white/40 dark:border-slate-800/60 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 overflow-hidden">
          <div className="px-10 py-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30 ring-4 ring-blue-500/10">
                <Wrench className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none mb-1">PUEFIX</h1>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Garage Grid</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
            <div className="px-6 mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations Center</span>
            </div>
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isCurrentPath(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative group flex items-center px-6 py-4 rounded-[1.5rem] transition-all duration-500 ${active
                    ? `bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-900/10`
                    : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <div className={`mr-4 p-2 rounded-xl transition-all duration-500 ${active ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-600"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-6">
            <div className="relative glass-panel rounded-[2rem] p-4 border-white/20 dark:border-slate-700/30 bg-white/50 dark:bg-slate-800/50 overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center w-full text-left outline-none"
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
                </div>
                <div className="ml-4 flex-1 overflow-hidden">
                  <p className="text-sm font-black text-slate-800 dark:text-white truncate uppercase tracking-tighter">{user?.name}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user?.role}</p>
                </div>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 right-0 mb-4 glass-panel !p-2 rounded-[1.5rem] z-50 shadow-2xl border-white/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95"
                  >
                    <button className="flex items-center w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all">
                      <Settings className="h-4 w-4 mr-3 text-blue-500" />
                      Protocol Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Abort Mission
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:pl-80 min-h-screen">
        {/* Modern Top Header */}
        <header className="sticky top-0 z-40 h-24 flex items-center px-8 lg:px-12 pointer-events-none">
          <div className="w-full flex items-center justify-between glass-panel bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 rounded-3xl h-16 px-6 shadow-xl shadow-slate-900/5 pointer-events-auto">
            <div className="lg:hidden flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg">
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">PUEFIX</span>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Node: <span className="text-slate-900 dark:text-white">{location.pathname.split('/').pop() || 'Core'}</span></span>
            </div>

            <div className="flex items-center gap-4">
              <NotificationInboxPopover />
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">Verified Session</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID: {user?.id?.slice(0, 8)}</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="py-6 lg:py-8">
          <div className="max-w-[1400px] mx-auto px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

