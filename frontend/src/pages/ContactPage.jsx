import React, { useState } from 'react';
import { Header1 } from '@/components/ui/header';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    // In a real app, call your API here
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      <Header1 />

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Questions, feedback, or booking requests? We’d love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-fit">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in touch</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-600" /> info@puefixgarage.com</li>
              <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-blue-600" /> (555) 123-4567</li>
              <li className="flex items-center gap-3"><MapPin className="w-5 h-5 text-blue-600" /> 123 Auto Street, City, State</li>
            </ul>
            <div className="mt-6">
              <iframe
                title="Map"
                className="w-full h-56 rounded-xl border border-gray-200"
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.5946%2C12.9716%2C77.609%2C12.98&layer=mapnik"
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send a message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How can we help?"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
              {sent && (
                <p className="text-green-600 text-sm">Thanks! Your message has been sent.</p>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
