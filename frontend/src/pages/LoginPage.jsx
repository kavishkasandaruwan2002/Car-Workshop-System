import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Monitor, CheckCircle, AlertCircle, Laptop, Cpu, Settings, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import * as Yup from 'yup';
import { motion } from 'framer-motion';

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
    'Access your workshop dashboard',
    'Track vehicle repair jobs',
    'Manage appointments and service history',
    'View invoices and payments'
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

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl xl:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                COMMAND <br />
                <span className="text-blue-500">YOUR FLEET</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed">
                Enter the next generation of workshop administration. Securely manage your operations from anywhere.
              </p>
            </motion.div>

            <div className="pt-8 space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center text-slate-300 group font-bold"
                >
                  <div className="p-1.5 bg-blue-500/20 rounded-lg mr-4 group-hover:bg-blue-500 transition-colors duration-300">
                    <CheckCircle className="w-4 h-4 text-blue-500 group-hover:text-white" />
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-12 lg:hidden">
            <h1 className="text-4xl font-black gradient-text tracking-tighter">PUEFIX</h1>
          </div>

          <div className="premium-card !p-10 border-white/60 shadow-2xl">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Security Access</h2>
            <p className="text-slate-500 font-medium mb-10">Verification required to access the grid.</p>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-500">{errors.general}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Terminal ID (Email)</label>
                  {errors.email && touched.email && <span className="text-[10px] font-bold text-red-500 uppercase">{errors.email}</span>}
                </div>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${focusedInput === 'email' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={handleBlur}
                    className={`input-field !pl-12 !h-14 font-bold ${errors.email && touched.email ? '!border-red-500 !bg-red-500/5' : ''}`}
                    placeholder="name@workshop.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Access Token (Password)</label>
                  {errors.password && touched.password && <span className="text-[10px] font-bold text-red-500 uppercase">{errors.password}</span>}
                </div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${focusedInput === 'password' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={handleBlur}
                    className={`input-field !pl-12 !h-14 font-bold ${errors.password && touched.password ? '!border-red-500 !bg-red-500/5' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer">
                    Remember Terminal
                  </label>
                </div>
                <Link to="/forgot-password" name="forgot-password-link" className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                  Rescue Access?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !h-14 font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 active:scale-95 transition-transform"
              >
                {loading ? 'Decrypting Access...' : 'Verify Identity'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                New to the grid? {' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 ml-1">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
