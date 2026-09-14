import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Monitor, CheckCircle, Smartphone, Globe, ShieldCheck, AlertCircle, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import PageTransition from '@/components/ui/PageTransition';
import * as Yup from 'yup';

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
      .max(50, 'Password must not exceed 50 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const validateField = async (fieldName, value) => {
    try {
      await validationSchema.validateAt(fieldName, { ...formData, [fieldName]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    setFocusedInput('');
    await validateField(name, value);
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
        show('Account created successfully! Welcome to PUEFix Garage.', 'success');
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          if (formData.carMake || formData.carModel || formData.licensePlate || formData.vin) {
            try {
              const year = formData.carYear ? parseInt(formData.carYear, 10) : new Date().getFullYear();
              await (await import('../api/client')).apiRequest('/cars', { method: 'POST', body: {
                licensePlate: formData.licensePlate || 'UNKNOWN',
                customerName: formData.name,
                customerPhone: 'N/A',
                customerEmail: formData.email,
                make: formData.carMake || 'Unknown',
                model: formData.carModel || 'Unknown',
                year,
                vin: formData.vin || undefined
              }});
              show('Vehicle information added successfully!', 'success');
            } catch (error) {
              show('Account created but failed to add vehicle information.', 'error');
            }
          }
          if (user.role === 'mechanic') navigate('/mechanic', { replace: true });
          else if (user.role === 'customer') navigate('/customer', { replace: true });
          else navigate('/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        show(result?.error || 'Registration failed', 'error');
      }
    } catch (error) {
      if (error.inner) {
        const newErrors = {};
        error.inner.forEach(err => { newErrors[err.path] = err.message; });
        setErrors(newErrors);
      } else {
        show(error.message || 'Registration failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Create and manage your vehicle profile',
    'Track repair status with live digital job sheets',
    'Book online service & maintenance appointments',
    'Access instant billing history and invoices'
  ];

  return (
    <PageTransition className="min-h-screen flex bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="ambient-glow-blue w-96 h-96 top-0 left-0" />
      <div className="ambient-glow-purple w-96 h-96 bottom-0 right-0" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-12 flex-col justify-between relative border-r border-white/10">
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-16 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white block tracking-tight">PUEFix Garage</span>
              <span className="text-cyan-400 text-xs font-semibold uppercase tracking-widest">Auto Care Portal</span>
            </div>
          </Link>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
                Create Your Account
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Instant Access
                </span>
              </h1>
              <p className="text-lg text-slate-300 font-light leading-relaxed">
                Join PUEFix Garage to track vehicle repairs, view digital estimates, and request maintenance.
              </p>
            </div>
            
            <div className="pt-6 space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 text-slate-200">
                  <div className="p-1 rounded-full bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-slate-400 text-xs font-light">
          © {new Date().getFullYear()} PUEFix Garage System. All rights reserved.
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md my-auto">
          <div className="glass-card p-8 sm:p-10 shadow-2xl border border-white/10">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Register Account</h2>
              <p className="text-slate-400 text-sm font-light">Enter your details to create a user profile</p>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-rose-950/40 border border-rose-900/60 text-rose-300 rounded-xl text-xs">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input name="name" type="text" value={formData.name} onChange={handleChange} onBlur={handleBlur} className="input-field pl-11 text-sm py-2.5" placeholder="John Doe" />
                </div>
                {errors.name && touched.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className="input-field pl-11 text-sm py-2.5" placeholder="john@example.com" />
                </div>
                {errors.email && touched.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Make (Optional)</label>
                  <input name="carMake" value={formData.carMake} onChange={handleChange} className="input-field text-sm py-2" placeholder="Toyota" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Model (Optional)</label>
                  <input name="carModel" value={formData.carModel} onChange={handleChange} className="input-field text-sm py-2" placeholder="Camry" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} onBlur={handleBlur} className="input-field pl-11 pr-11 text-sm py-2.5" placeholder="••••••••" />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && touched.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} className="input-field pl-11 pr-11 text-sm py-2.5" placeholder="••••••••" />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                <label htmlFor="terms" className="text-xs text-slate-300">I agree to Terms and Conditions</label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-slate-800 pt-4">
              <p className="text-slate-400 text-xs">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;
