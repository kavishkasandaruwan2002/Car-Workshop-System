import React, { useState } from 'react';
import { NotificationInboxPopover } from '@/components/ui/notification-inbox-popover';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import {
  Home,
  Car,
  Wrench,
  Package,
  FileText,
  Users,
  BarChart3,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { show } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['owner', 'receptionist'] },
    { name: 'Cars', href: '/dashboard/cars', icon: Car, roles: ['owner', 'receptionist'] },
    { name: 'Job Sheets', href: '/dashboard/jobs', icon: Wrench, roles: ['owner', 'receptionist'] },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package, roles: ['owner'] },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText, roles: ['owner', 'receptionist'] },
    { name: 'Mechanics', href: '/dashboard/mechanics', icon: Users, roles: ['owner'] },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['owner', 'receptionist'] },
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex w-72 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shadow-2xl z-10"
            >
              <div className="flex h-14 items-center justify-between px-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">PUEFix Garage</h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isCurrentPath(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group relative flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-30">
        <div className="flex flex-col flex-grow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Brand Logo Header */}
          <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800/80">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">
                  PUEFix Garage
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-widest block">
                  Management
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto custom-scrollbar">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isCurrentPath(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`mr-3.5 h-4.5 w-4.5 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400'}`} />
                  <span className="flex-1">{item.name}</span>
                  {active && (
                    <motion.div 
                      layoutId="activePill"
                      className="w-1.5 h-1.5 rounded-full bg-white ml-auto" 
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center w-full p-2.5 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate font-medium">
                    {user?.role || 'Guest'}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-slate-400" />
                      Account Settings
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize hidden sm:block">
              {location.pathname.split('/')[2] || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationInboxPopover />
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default Layout;
