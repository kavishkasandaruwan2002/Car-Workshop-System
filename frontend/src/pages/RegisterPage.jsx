import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Monitor, CheckCircle, Smartphone, Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    carMake: '',
    carModel: '',
    carYear: '',
    licensePlate: '',
    vin: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .required('Name is required'),
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      show('Please agree to the terms and conditions', 'error');
      return;
    }
    setLoading(true);
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      const result = await register({ name: formData.name, email: formData.email, password: formData.password, role: 'customer' });
      if (result?.success) {
        show('Registration successful!', 'success');
        navigate('/customer', { replace: true });
      } else {
        show(result?.error || 'Registration failed', 'error');
      }
    } catch (error) {
      if (error.inner) {
        const newErrors = {};
        error.inner.forEach(err => { newErrors[err.path] = err.message; });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { title: 'Fleet Monitoring', desc: 'Real-time status of your vehicles', icon: Monitor },
    { title: 'Direct Access', desc: 'Instant communication with mechanics', icon: Smartphone },
    { title: 'Global Sync', desc: 'History available across all centers', icon: Globe },
    { title: 'Secure Vault', desc: 'Encrypted payment and data handling', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 opacity-90" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center text-white mb-20 group">
            <div className="p-3 bg-blue-600 rounded-2xl mr-4 group-hover:rotate-6 transition-all duration-300">
              <Monitor className="w-8 h-8" />
            </div>
            <div>
              <span className="text-3xl font-black block tracking-tighter">PUEFIX</span>
              <span className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em]">Workshop System</span>
            </div>
          </Link>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h1 className="text-6xl xl:text-8xl font-black text-white leading-[0.85] tracking-tighter">
                JOIN THE <br />
                <span className="text-blue-500">RESISTANCE</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed">
                Be part of the most advanced automotive service network in Sri Lanka. Precision, speed, and absolute control.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start group"
                >
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mr-6 group-hover:bg-blue-500 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-blue-500 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">{feature.title}</h3>
                    <p className="text-slate-500 text-sm font-bold">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl py-12"
        >
          <div className="text-center mb-12 lg:hidden">
            <h1 className="text-4xl font-black gradient-text tracking-tighter">PUEFIX</h1>
          </div>

          <div className="premium-card !p-12 border-white/60 shadow-2xl">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Identity Creation</h2>
            <p className="text-slate-500 font-medium mb-10">Establish your credentials on the PUEFIX network.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input-field !pl-12 !h-14 font-bold ${errors.name ? '!border-red-500' : ''}`}
                      placeholder="Cipher Name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal ID (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field !pl-12 !h-14 font-bold ${errors.email ? '!border-red-500' : ''}`}
                      placeholder="mail@network.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Pass (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field !pl-12 !h-14 font-bold ${errors.password ? '!border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Pass</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field !pl-12 !h-14 font-bold ${errors.confirmPassword ? '!border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Initial Asset Registration (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input name="carMake" placeholder="Make" onChange={handleChange} className="input-field !h-12 !text-xs font-bold" />
                  <input name="carModel" placeholder="Model" onChange={handleChange} className="input-field !h-12 !text-xs font-bold" />
                  <input name="licensePlate" placeholder="Plate No" onChange={handleChange} className="input-field !h-12 !text-xs font-bold" />
                  <input name="carYear" placeholder="Year" onChange={handleChange} className="input-field !h-12 !text-xs font-bold" />
                </div>
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-5 w-5 bg-white border-2 border-slate-200 rounded-lg text-blue-600 focus:ring-blue-500 mt-1"
                />
                <label htmlFor="terms" className="ml-3 text-sm font-bold text-slate-500">
                  I consent to the PUEFIX protocols and data encryption policy.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !h-16 font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-500/30 active:scale-[0.98] transition-all"
              >
                {loading ? 'Initializing Protocol...' : 'Create Identity'}
              </button>
            </form>

            <div className="mt-8 text-center pt-8 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Already registered? {' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 ml-1">
                  Access Portal
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
