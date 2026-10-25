import React, { useState } from 'react';
import { Button } from '../Button/Button';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export const RegisterRight = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    age: '',
    address: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(formData);
      if (res.success) {
        api.setAuth(res.token, res.user);
        navigate('/scanner');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Ensure backend is running at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-12 w-full max-w-[560px] mx-auto bg-transparent relative z-10">

      {/* Mobile Logo */}
      <div className="lg:hidden flex flex-col items-center text-center mb-6 mt-2">
        <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <div className="w-6 h-6 border-[2.5px] border-emerald-600 rounded bg-transparent relative flex items-center">
            <div className="w-7 h-[2.5px] bg-emerald-500 absolute -left-[3px]"></div>
          </div>
        </div>
        <h2 className="text-[22px] font-bold text-slate-900 mb-1">Create Account</h2>
      </div>

      <div className="hidden lg:block mb-8">
        <h2 className="text-[26px] font-bold text-slate-900 mb-2">Create Your Account</h2>
        <p className="text-[14px] text-slate-500">Complete your profile to start scanning products</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full h-11 px-4 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-[14px] text-slate-900 placeholder-slate-400 font-medium caret-emerald-600 transition-all duration-300"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full h-11 px-4 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-[14px] text-slate-900 placeholder-slate-400 font-medium caret-emerald-600 transition-all duration-300"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-[2]">
            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Mobile Number *</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter your mobile"
              className="w-full h-11 px-4 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-[14px] text-slate-900 placeholder-slate-400 font-medium caret-emerald-600 transition-all duration-300"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Age *</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="26 Years"
              className="w-full h-11 px-4 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-[14px] text-slate-900 placeholder-slate-400 font-medium caret-emerald-600 transition-all duration-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1">Residential Address *</label>
          <textarea
            rows="2"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full px-4 py-3 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-[14px] text-slate-900 placeholder-slate-400 font-medium caret-emerald-600 transition-all duration-300 resize-none"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-slate-700 mb-1">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••••••"
            className="w-full h-11 px-4 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-[16px] text-slate-900 placeholder-slate-400 font-medium tracking-widest caret-emerald-600 transition-all duration-300"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          size="lg"
          className="w-full mt-2 !h-[48px] !rounded-[12px] text-[15px] flex items-center justify-center cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Create Account & Continue'
          )}
        </Button>
      </form>

      <p className="text-center text-[13px] text-slate-500 mt-6">
        Already have an account? <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">Log In</Link>
      </p>
    </div>
  );
};
