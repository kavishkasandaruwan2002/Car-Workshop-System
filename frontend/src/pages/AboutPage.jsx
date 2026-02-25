import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Users, Award, Zap, Heart } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { label: 'Vehicles Optimized', value: '12,500+', icon: Zap },
    { label: 'Master Technicians', value: '45+', icon: Users },
    { label: 'Safety Rating', value: '100%', icon: Shield },
    { label: 'Years of Excellence', value: '15+', icon: Award }
  ];

  const values = [
    {
      title: "Precision Engineering",
      description: "We don't just repair; we optimize. Every bolt and circuit is treated with microscopic attention to detail.",
      icon: Target
    },
    {
      title: "Absolute Integrity",
      description: "Transparency is our foundation. Full digital history and verified parts for every single operation.",
      icon: Shield
    },
    {
      title: "Customer Centricity",
      description: "Your journey matters. We provide a seamless, premium experience from booking to delivery.",
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 mb-32">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 mb-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            The PUEFIX Protocol
          </motion.div>
          <h1 className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
            ENGINEERING <br />
            <span className="gradient-text">LEGACIES</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
            Since 2009, PUEFix Garage has been the sanctuary for high-performance vehicles and discerning owners. We bridge the gap between traditional craftsmanship and digital innovation.
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="px-6 mb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="premium-card text-center group"
              >
                <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="px-6 relative py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {values.map((v, i) => (
              <div key={i} className="space-y-6">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                  <v.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">{v.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline / Story */}
      <section className="px-6 py-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Our Journey</h2>
          </div>
          <div className="space-y-20 relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />

            {[
              { year: '2009', event: 'Founding of the first PUEFix precision workshop.' },
              { year: '2015', event: 'Integration of digital diagnostics and fleet management protocols.' },
              { year: '2021', event: 'Launch of the proprietary Workshop Matrix system.' },
              { year: '2024', event: 'PUEFix reaches global excellence standards in 12 regions.' }
            ].map((item, idx) => (
              <div key={idx} className="relative pl-12">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-slate-950 border-4 border-blue-600" />
                <div className="text-2xl font-black text-blue-600 mb-2 uppercase">{item.year}</div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{item.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto glass-panel rounded-[3rem] p-16 text-center shadow-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-8 relative z-10">Be Part of the Excellence</h2>
          <p className="text-xl text-blue-50 mb-12 max-w-2xl mx-auto font-medium relative z-10">Whether you are a vehicle owner or a master technician, there is a place for you in our ecosystem.</p>
          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            <button className="px-10 py-5 bg-white text-blue-700 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl">Join the Team</button>
            <button className="px-10 py-5 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest border border-white/30 hover:bg-blue-400 transition-all">Book Consultation</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

