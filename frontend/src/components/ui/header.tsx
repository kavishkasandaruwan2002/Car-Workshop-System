import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, MoveRight, X, Bell } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeSwitch } from "@/components/ui/theme-switch-button";
import { NotificationInboxPopover } from "@/components/ui/notification-inbox-popover";
import { motion, AnimatePresence } from "framer-motion";

function Header1() {
    const navigationItems = [
        { title: "Home", href: "/" },
        { title: "About", href: "/about" },
        { title: "Contact", href: "/contact" },
    ];

    const [isOpen, setOpen] = useState(false);
    return (
        <header className="w-full z-50 fixed top-0 left-0 p-4 sm:p-6 pointer-events-none">
            <div className="max-w-7xl mx-auto glass-panel !bg-white/70 dark:!bg-slate-900/70 backdrop-blur-2xl border border-white/40 dark:border-slate-800/40 rounded-[2rem] h-20 px-8 flex items-center justify-between shadow-2xl shadow-slate-900/5 pointer-events-auto">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                            <Menu className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">PUEFIX</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-1">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.title}
                                to={item.href}
                                className="px-5 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-3 mr-3 border-r border-slate-200 dark:border-slate-800 pr-6">
                        <ThemeSwitch />
                        <NotificationInboxPopover />
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                        <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors px-4">
                            Log In
                        </Link>
                        <Link to="/register" className="btn-primary !h-11 !px-8 shadow-blue-500/20 !text-xs">
                            Get Started
                        </Link>
                    </div>

                    <button
                        onClick={() => setOpen(!isOpen)}
                        className="lg:hidden p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-blue-600 hover:text-white transition-all"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="lg:hidden absolute top-28 left-6 right-6 glass-panel !p-8 rounded-[2.5rem] shadow-2xl border-white/60 pointer-events-auto"
                    >
                        <div className="flex flex-col gap-6">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.title}
                                    to={item.href}
                                    onClick={() => setOpen(false)}
                                    className="flex justify-between items-center group"
                                >
                                    <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase group-hover:text-blue-600 transition-colors">{item.title}</span>
                                    <MoveRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                                </Link>
                            ))}
                            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2" />
                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm"
                                    onClick={() => setOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center p-4 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-500/20"
                                    onClick={() => setOpen(false)}
                                >
                                    Join Grid
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

export { Header1 };