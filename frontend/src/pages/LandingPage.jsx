import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ImagesSlider } from '@/components/ui/images-slider';
import { Header1 } from '@/components/ui/header';
import UserFeedbackBlock from '@/components/ui/user-feedback-block';
import { ScrollReveal, StaggerContainer, StaggerItem, AnimatedCounter } from '@/components/ui/ScrollReveal';
import PageTransition from '@/components/ui/PageTransition';
import { 
  Wrench, 
  Users, 
  ShieldCheck, 
  Clock, 
  Star, 
  ArrowRight,
  Car,
  CheckCircle2,
  Sparkles,
  Zap,
  Award,
  ChevronRight,
  PhoneCall,
  Activity
} from 'lucide-react';

const testimonials = [
  {
    name: "John Smith",
    role: "Car Owner (BMW M3)",
    content: "PUEFix Garage resolved a complex engine diagnostic issue that two other shops couldn't fix. Fast, transparent, and ultra-professional!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop"
  },
  {
    name: "Sarah Johnson",
    role: "Fleet Manager (Logistics Inc.)",
    content: "Managing 15 commercial vehicles used to be a headache until we partnered with PUEFix. Real-time updates and top-tier maintenance!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=250&auto=format&fit=crop"
  },
  {
    name: "Michael Davis",
    role: "Business Owner",
    content: "Honest pricing, digital job sheet tracking, and spotless work. I won't trust my vehicle anywhere else in town.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop"
  }
];

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Wrench className="w-7 h-7" />,
      title: "Master Mechanics",
      description: "ASE-certified technicians trained in modern vehicle diagnostics and precision engineering."
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: "Express Turnaround",
      description: "Optimized workflow schedules ensuring quick turnarounds without sacrificing work quality."
    },
    {
      icon: <ShieldCheck className="w-7 h-7" />,
      title: "100% Work Guarantee",
      description: "All repairs backed by a 12-month / 12,000-mile comprehensive warranty."
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Real-time Tracking",
      description: "Instant SMS/email updates on job sheet status, spare parts allocation, and billing."
    }
  ];

  const services = [
    {
      title: "Computer Diagnostics",
      desc: "Full OBD-II scan, engine code troubleshooting, and electrical system diagnostics.",
      icon: <Activity className="w-6 h-6 text-blue-500" />,
      badge: "Popular"
    },
    {
      title: "Brake & Suspension",
      desc: "Rotors, ceramic pads, ABS sensors, shocks, struts, and hydraulic flush.",
      icon: <Zap className="w-6 h-6 text-indigo-500" />,
      badge: "Essential"
    },
    {
      title: "Engine & Transmission",
      desc: "Timing belt replacements, clutch rebuilds, fluid service, and overhaul.",
      icon: <Wrench className="w-6 h-6 text-violet-500" />,
      badge: "Expert"
    },
    {
      title: "Scheduled Maintenance",
      desc: "Synthetic oil changes, filter renewals, spark plugs, and 50-point safety check.",
      icon: <Award className="w-6 h-6 text-emerald-500" />,
      badge: "Standard"
    }
  ];

  const stats = [
    { number: "2500+", label: "Cars Serviced" },
    { number: "99%", label: "Satisfaction Rate" },
    { number: "15+", label: "Expert Mechanics" },
    { number: "24/7", label: "Emergency Assist" }
  ];

  return (
    <PageTransition className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      <ParticleBackground />

      {/* Ambient background glows */}
      <div className="ambient-glow-blue w-96 h-96 -top-20 -left-20" />
      <div className="ambient-glow-purple w-[30rem] h-[30rem] top-[40%] -right-20" />

      {/* Header */}
      <Header1 />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-7xl mx-auto"
        >
          <ImagesSlider
            className="h-[82vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative"
            images={[
              'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2400&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=2400&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2400&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1504215680853-026ed2a45def?q=80&w=2400&auto=format&fit=crop'
            ]}
          >
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30 z-10" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="z-20 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto h-full"
            >
              {/* Badge Pill */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Next-Gen Workshop Management & Repairs</span>
              </motion.div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
                Next-Level Auto Service
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Precision & Power
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
                Streamline repairs, track live job status, and manage vehicle health with certified expertise and transparent digital workflow.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <span>Book Service Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <span>Client Login</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-slate-300 text-xs font-medium">
                <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant Digital Estimates</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>OEM Parts Guaranteed</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Transparent Pricing</span>
                </div>
              </div>
            </motion.div>
          </ImagesSlider>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal variant="fade-up" className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2 block">Why Choose Us</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Engineered for Workshop Excellence
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
              Combining state-of-the-art diagnostic technology with transparent, customer-first service.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <div className="glass-card glass-card-hover p-8 h-full flex flex-col justify-between group">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/60 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal variant="fade-up" className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 block">Full-Spectrum Care</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Our Core Automotive Services
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
              From routine oil checks to full powertrain overhauls, our garage handles every car with precision.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, idx) => (
              <ScrollReveal key={idx} variant="scale-up" delay={idx * 0.1}>
                <div className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                      {svc.icon}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {svc.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    {svc.desc}
                  </p>
                  <div className="flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                    <span>Learn details</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <StaggerItem key={index} variant="scale-up">
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-blue-400/40 transition-all duration-300">
                  <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-2">
                    <AnimatedCounter target={stat.number} />
                  </div>
                  <div className="text-sm font-medium text-slate-300 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal variant="fade-up" className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 block">Client Reviews</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Trusted by Drivers & Fleets
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              See how PUEFix Garage delivers peace of mind to vehicle owners daily.
            </p>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            <ScrollReveal variant="flip">
              <div className="glass-card p-8 md:p-10 relative overflow-hidden text-center shadow-2xl">
                <div className="flex justify-center items-center space-x-1 mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <blockquote className="text-lg md:text-xl text-slate-200 mb-8 font-light italic leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-400/50 shadow-md"
                  />
                  <div className="text-left">
                    <div className="text-base font-bold text-white">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-xs text-blue-400 font-medium">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'w-8 bg-blue-500' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Feedback Block */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/40 relative z-10">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fade-up">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white text-center mb-8">
              Share Your Workshop Experience
            </h2>
            <div className="glass-card p-6 md:p-8 rounded-2xl">
              <UserFeedbackBlock />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="glass-card p-10 md:p-16 rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-slate-900 border border-blue-500/30 relative">
            <ScrollReveal variant="scale-up">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Ready for Trouble-Free Driving?
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto font-light">
                Join thousands of drivers who rely on PUEFix Garage for fast, reliable, and guaranteed auto repair.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <PhoneCall className="w-5 h-5 text-cyan-400" />
                  <span>Contact Workshop</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-14 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">PUEFix Garage</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Modern workshop management & automotive maintenance engineered for excellence.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Popular Services</h3>
            <ul className="space-y-2.5 text-sm font-light">
              <li className="hover:text-blue-400 transition-colors">Engine Diagnostics</li>
              <li className="hover:text-blue-400 transition-colors">Brake & ABS Service</li>
              <li className="hover:text-blue-400 transition-colors">Transmission Maintenance</li>
              <li className="hover:text-blue-400 transition-colors">Air Conditioning & Climate</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-sm font-light">
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Workshop</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Client Login</Link></li>
              <li><Link to="/register" className="hover:text-blue-400 transition-colors">Register Account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Workshop Info</h3>
            <ul className="space-y-2 text-sm font-light text-slate-400">
              <li>123 Auto Care Boulevard</li>
              <li>Monday - Saturday: 8am - 7pm</li>
              <li className="text-blue-400 font-medium">+1 (555) 123-4567</li>
              <li>support@puefixgarage.com</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-12 pt-8 text-center text-xs font-light text-slate-500">
          &copy; {new Date().getFullYear()} PUEFix Garage System. All rights reserved.
        </div>
      </footer>
    </PageTransition>
  );
};

export default LandingPage;
