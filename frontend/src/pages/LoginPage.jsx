import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Monitor, CheckCircle, AlertCircle, Laptop, Cpu, Settings, Users, Star, Wrench, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import PageTransition from '@/components/ui/PageTransition';
import * as Yup from 'yup';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .max(100, 'Email must not exceed 100 characters')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must not exceed 50 characters')
      .required('Password is required')
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

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }

    if (touched[name]) {
      await validateField(name, value);
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
    setTouched({ email: true, password: true });
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setLoading(true);
      const result = await login(formData.email, formData.password, rememberMe);
      if (result?.success) {
        show('Login successful! Welcome back.', 'success');
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          if (user.role === 'mechanic') navigate('/mechanic', { replace: true });
          else if (user.role === 'customer') navigate('/customer', { replace: true });
          else navigate('/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        show(result?.error || 'Login failed. Please check your credentials.', 'error');
      }
    } catch (error) {
      if (error.inner) {
        const newErrors = {};
        error.inner.forEach(err => { newErrors[err.path] = err.message; });
        setErrors(newErrors);
      } else {
        const errorMessage = error.response?.data?.message || 'Invalid email or password. Please try again.';
        setErrors({ general: errorMessage });
        show(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Access workshop command dashboard',
    'Track real-time vehicle repair progress',
    'Manage appointments & digital estimates',
    'View instant invoices and service logs'
  ];

  return (
    <PageTransition className="min-h-screen flex bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="ambient-glow-blue w-96 h-96 top-0 left-0" />
      <div className="ambient-glow-purple w-96 h-96 bottom-0 right-0" />

      {/* Left Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-12 flex-col justify-between relative border-r border-white/10">
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-16 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white block tracking-tight">PUEFix Garage</span>
              <span className="text-cyan-400 text-xs font-semibold uppercase tracking-widest">Auto Service System</span>
            </div>
          </Link>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
                Welcome back to
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  workshop management
                </span>
              </h1>
              <p className="text-lg text-slate-300 font-light leading-relaxed">
                Sign in to manage active job sheets, inventory stock, mechanic assignments, and vehicle profiles.
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

      {/* Right Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">PUEFix Garage</span>
            </Link>
          </div>

          <div className="glass-card p-8 sm:p-10 shadow-2xl border border-white/10">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Sign In
              </h2>
              <p className="text-slate-400 text-sm font-light">
                Enter your account credentials to access your dashboard
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 text-rose-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-200">{errors.general}</p>
                  <p className="text-xs text-rose-400 mt-0.5">Please check your email and password.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={handleBlur}
                    className="input-field pl-11 text-sm"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={handleBlur}
                    className="input-field pl-11 pr-11 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1.5 text-xs text-rose-400">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center py-1">
                <label className="flex items-center cursor-pointer space-x-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs text-slate-300">Remember me for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text.sm mt-2"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="spinner mr-2" /> Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span>Access Dashboard</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-800 pt-6">
              <p className="text-slate-400 text-xs">
                Don't have an account yet?{' '}
                <Link to="/register" className="font-bold text-blue-400 hover:text-blue-300">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
