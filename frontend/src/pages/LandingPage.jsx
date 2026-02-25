import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Wrench,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Activity,
  Award,
  Zap,
  Cpu,
  MousePointer2,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { Header1 } from '../components/ui/header';

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Dynamic Background Elements */}
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full bg-slate-900 text-white border border-slate-800 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          The Standard of Excellence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-7xl md:text-[10rem] font-black text-slate-950 dark:text-white mb-10 tracking-[ -0.05em] leading-[0.85]"
        >
          PRECISION <br />
          <span className="gradient-text">GARAGE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto mb-16 leading-relaxed"
        >
          PUEFix systems integrate master-level artisan engineering with next-generation diagnostic protocols. Experience the pinnacle of automotive optimization.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-8 justify-center items-center"
        >
          <Link to="/register" className="btn-primary !h-20 !px-12 !text-[12px] !tracking-[0.3em] shadow-[0_20px_60px_-15px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all group">
            INITIALIZE PROTOCOL <ArrowUpRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
          <Link to="/login" className="px-10 py-5 text-[12px] font-black tracking-[0.3em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            SECURE ACCESS
          </Link>
        </motion.div>
      </div>

      {/* Floating Indicators */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-300 dark:text-slate-700 font-black text-[9px] uppercase tracking-[0.5em] flex flex-col items-center gap-4"
      >
        <span>SCROLL TO DISCOVER</span>
        <div className="w-px h-12 bg-gradient-to-b from-blue-500 to-transparent" />
      </motion.div>
    </section>
  );
};

const ProtocolSection = () => {
  const steps = [
    { n: "01", t: "Ingestion", d: "Digital twin generation and comprehensive diagnostic sweep using proprietary sensor arrays.", i: Cpu },
    { n: "02", t: "Optimization", d: "Surgical execution by master technicians following the PUEFix precision directive.", i: Wrench },
    { n: "03", t: "Verification", d: "Multi-point safety validation and performance benchmarking against global standards.", i: Shield },
    { n: "04", t: "Delivery", d: "Bespoke hand-over with full digital operational history and lifetime integrity certificate.", i: CheckCircle2 }
  ];

  return (
    <section className="py-40 bg-slate-50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
              The Methodology
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-tight">
              A MASTERPIECE <br />
              <span className="text-blue-600 italic font-serif">In Every Bolt</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
              We've digitized the traditional garage experience to provide absolute transparency and clinical precision for high-performance automotive platforms.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((s, idx) => (
              <div key={idx} className="premium-card !p-8 !rounded-[2.5rem] hover:bg-slate-900 hover:text-white group transition-all duration-500">
                <div className="flex justify-between items-start mb-10">
                  <div className="p-4 bg-blue-600/10 text-blue-600 rounded-2xl group-hover:bg-white group-hover:text-slate-900 transition-colors">
                    <s.i className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-black text-slate-200 group-hover:text-white/20">{s.n}</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">{s.t}</h3>
                <p className="text-xs font-medium text-slate-500 group-hover:text-slate-400 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-blue-600 selection:text-white">
      {/* Header handled by App.jsx or injected if needed */}
      <Header1 />

      <Hero />

      {/* Trust Bar */}
      <section className="border-y border-slate-100 dark:border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all">
            {['VOLKSWAGEN', 'PORSCHE', 'MERCEDES', 'AUDI', 'BMW', 'TESLA'].map(brand => (
              <span key={brand} className="text-xs font-black tracking-[0.5em]">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      <ProtocolSection />

      {/* Dynamic CTA */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto premium-card !p-0 !rounded-[4rem] bg-slate-950 text-white border-none overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-16 md:p-24 flex flex-col justify-center">
              <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-none">
                REDEFINE <br />
                <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-[12px]">THE ENGINE</span>
              </h2>
              <p className="text-xl text-slate-400 mb-16 font-medium leading-relaxed max-w-sm">
                Join our elite diagnostic network today. For vehicles that deserve more than just a repair.
              </p>
              <div className="flex gap-6">
                <Link to="/register" className="btn-primary !h-16 !px-12 !bg-white !text-slate-900">Get Started</Link>
                <Link to="/about" className="flex items-center gap-4 text-xs font-black tracking-widest uppercase hover:text-blue-500 transition-colors">Our Protocol <ChevronRight className="w-5 h-5" /></Link>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-auto bg-blue-600 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-multiply opacity-40 scale-110 hover:scale-100 transition-transform duration-[20s]" />
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center cursor-pointer relative z-10"
              >
                <Zap className="w-10 h-10 text-white fill-white" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <footer className="pt-32 pb-20 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 bg-slate-950 text-white rounded-xl flex items-center justify-center"><Wrench className="w-5 h-5" /></div>
                <span className="text-2xl font-black tracking-tighter uppercase">PUEFIX <span className="text-blue-600">.</span></span>
              </div>
              <p className="text-slate-500 font-medium max-w-sm mb-10">Pioneering the intersection of mechanical integrity and digital intelligence. The ultimate workshop for the modern era.</p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-blue-600 transition-colors cursor-pointer" />)}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-400">Navigation</h4>
              <ul className="space-y-4">
                {['Protocol', 'Intelligence', 'Network', 'Support'].map(item => (
                  <li key={item}><Link to="#" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-400">Security</h4>
              <ul className="space-y-4">
                {['Privacy', 'Legal', 'Governance', 'Cookies'].map(item => (
                  <li key={item}><Link to="#" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest">{item}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-slate-100 dark:border-slate-900 gap-8">
            <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase italic">All Systems Operational // PUEFIX GLOBAL OPS</span>
            <span className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">© 2024 AUTO WORKSHOP MATRIX SYSTEM.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

