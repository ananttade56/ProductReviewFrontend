import React, { useState } from 'react';
import { Button } from '../Button/Button';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export const LoginRight = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!identifier || !password) {
      setError('Please enter your email/mobile and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ identifier, password });
      if (res.success) {
        api.setAuth(res.token, res.user);
        navigate('/scanner');
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Ensure backend is running at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  // Request Mobile OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!mobile || mobile.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(mobile.trim());
      if (res.success) {
        setOtpSent(true);
        setServerOtp(res.otp || '');
        setSuccessMsg(res.message || 'OTP sent successfully!');
      } else {
        setError(res.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Error connecting to backend API.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Mobile OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(mobile.trim(), otp.trim());
      if (res.success) {
        api.setAuth(res.token, res.user);
        navigate('/scanner');
      } else {
        setError(res.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setError('Network error verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-6 lg:px-12 w-full max-w-[460px] mx-auto bg-transparent relative z-10">
      {/* Mobile only logo and text */}
      <div className="lg:hidden flex flex-col items-center text-center mb-6 mt-2">
        <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <div className="w-6 h-6 border-[2.5px] border-emerald-600 rounded bg-transparent relative flex items-center">
            <div className="w-7 h-[2.5px] bg-emerald-500 absolute -left-[3px]"></div>
          </div>
        </div>
        <h2 className="text-[24px] font-bold text-slate-900 mb-1">Welcome Back</h2>
        <p className="text-[13px] text-slate-500">Log in to scan product ingredients</p>
      </div>

      {/* Desktop only text */}
      <div className="hidden lg:block mb-4">
        <h2 className="text-[24px] font-bold text-slate-900 mb-1">Sign In to Your Account</h2>
        <p className="text-[13px] text-slate-500">Choose your preferred login method</p>
      </div>

      {/* Auth Mode Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-4 border border-slate-200">
        <button
          type="button"
          onClick={() => { setAuthMode('password'); setError(''); setSuccessMsg(''); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            authMode === 'password'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Password Login
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('otp'); setError(''); setSuccessMsg(''); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            authMode === 'otp'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Mobile OTP</span>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full">Fast</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          {serverOtp && (
            <button
              type="button"
              onClick={() => setOtp(serverOtp)}
              className="text-[11px] underline font-bold hover:text-emerald-900 cursor-pointer"
            >
              Autofill {serverOtp}
            </button>
          )}
        </div>
      )}

      {authMode === 'password' ? (
        <form onSubmit={handlePasswordSubmit} className="space-y-3 w-full">
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Email or Mobile Number</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or mobile"
              className="w-full h-11 px-4 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-[14px] text-slate-900 placeholder-slate-400 font-medium caret-emerald-600 transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-11 px-4 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-[16px] text-slate-900 placeholder-slate-400 font-medium tracking-wide caret-emerald-600 transition-all duration-300"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            className="w-full mt-3 !h-[46px] !rounded-[12px] md:!rounded-[12px] text-[15px] flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Log In to Scanner'
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-3 w-full">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">10-Digit Mobile Number</label>
                <div className="flex gap-2">
                  <span className="h-11 px-3 rounded-xl bg-slate-100 border border-slate-300 flex items-center text-xs font-bold text-slate-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="flex-1 h-11 px-4 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-[14px] text-slate-900 placeholder-slate-400 font-medium caret-emerald-600"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                className="w-full mt-3 !h-[46px] !rounded-[12px] text-[15px] flex items-center justify-center cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Verification OTP'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[12px] font-semibold text-slate-700">Enter 6-Digit OTP</label>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    Change Number
                  </button>
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim().slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full h-11 px-4 rounded-xl bg-white lg:bg-slate-50 border-[1.5px] border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-[16px] text-slate-900 placeholder-slate-400 font-bold tracking-widest text-center"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                className="w-full mt-3 !h-[46px] !rounded-[12px] text-[15px] flex items-center justify-center cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Verify OTP & Continue'
                )}
              </Button>
            </form>
          )}
        </div>
      )}

      <div className="my-4 flex items-center justify-center">
        <div className="h-[1px] w-full bg-slate-200"></div>
        <span className="px-4 text-[12px] text-slate-400 font-medium">OR</span>
        <div className="h-[1px] w-full bg-slate-200"></div>
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          setAuthMode('password');
          setIdentifier('9876543210');
          setPassword('demo');
        }}
        className="w-full !h-[44px] !rounded-[12px] text-[13px] border-slate-300 hover:bg-slate-50"
      >
        <span>⚡ Quick Fill Demo Account (Anant)</span>
      </Button>

      <p className="text-center text-[13px] text-slate-500 mt-5">
        <span>Don't have an account? </span>
        <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
          Register Free
        </Link>
      </p>
    </div>
  );
};
