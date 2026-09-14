import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import { useToast } from '../components/Toast';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', subject: 'General Inquiry' });
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    show('Professional inquiry received. Our team will contact you shortly.', 'success');
    setForm({ name: '', email: '', message: '', subject: 'General Inquiry' });
    setLoading(false);
  };

  const contactMethods = [
    { icon: Mail, label: 'Direct Protocol', value: 'ops@puefixgarage.com', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Phone, label: 'Emergency Line', value: '+1 (555) 902-OPEX', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Clock, label: 'Operational Sync', value: 'Mon-Sat: 08:00 - 19:00', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Globe, label: 'HQ Coordinates', value: 'Tech District, Sector 7', color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden pt-32 pb-20 px-6">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* Left Column: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
                Global Communications Hub
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
                CONNECT WITH <br />
                <span className="gradient-text">OPERATIONS</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                Our elite technical team is standing by to assist with service specialized inquiries, fleet management consultations, or general workshop protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactMethods.map((method, idx) => (
                <div key={idx} className="p-6 glass-panel rounded-3xl border border-white/20 dark:border-slate-800/50 hover:shadow-premium transition-all group">
                  <div className={`w-12 h-12 ${method.bg} ${method.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{method.label}</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{method.value}</div>
                </div>
              ))}
            </div>

            <div className="p-8 glass-panel rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  <span className="text-blue-600">8+ Specialists</span> currently online
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 italic">"Average response time for priority inquiries is currently 14 minutes."</p>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card !p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <MessageSquare className="w-32 h-32" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-10 uppercase">Initialize Inquiry</h2>

            <form onSubmit={onSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="input-field !h-14 font-bold"
                    placeholder="Enter identification"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Interface</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    className="input-field !h-14 font-bold"
                    placeholder="address@domain.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry Vector</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={onChange}
                  className="input-field !h-14 font-bold appearance-none bg-no-repeat bg-[right_1.25rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.5em' }}
                >
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing & Invoicing</option>
                  <option>Fleet Partnerships</option>
                  <option>Media & PR</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={6}
                  className="input-field !py-5 font-bold resize-none"
                  placeholder="Describe your requirement in detail..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !h-16 group relative overflow-hidden"
              >
                <span className={`flex items-center justify-center gap-3 transition-all ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  Dispatch Transmission <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

