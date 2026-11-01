'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { HipgLogo } from '@/components/common/PortGraphics';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('Chathuranga');
  const [password, setPassword] = useState('HipgPort@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      // Check role from authenticated response
      if (data.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setErrorMessage('Unable to reach server. Please check your network connection.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none bg-gradient-to-br from-[#082B4C] via-[#0E3D68] to-[#1266D5]">
      {/* Background Seaport Graphic Layer */}
      <div className="absolute inset-0 z-0 opacity-45 mix-blend-luminosity overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="1200" height="800" fill="url(#loginPortGrad)" />
          <rect y="540" width="1200" height="260" fill="#0A2D4E" />
          <path d="M120 540 L160 410 L680 410 L760 540 Z" fill="#153658" />
          <path d="M160 410 L170 360 L280 360 L280 410 Z" fill="#29C5E8" opacity="0.8" />
          <g opacity="0.9">
            <rect x="290" y="320" width="55" height="90" fill="#E05252" rx="2" />
            <rect x="350" y="300" width="60" height="110" fill="#2498F2" rx="2" />
            <rect x="415" y="330" width="55" height="80" fill="#16A6A0" rx="2" />
            <rect x="475" y="290" width="60" height="120" fill="#F59E0B" rx="2" />
            <rect x="540" y="340" width="50" height="70" fill="#2563EB" rx="2" />
          </g>
          <g stroke="#38BDF8" strokeWidth="4" fill="none">
            <line x1="300" y1="540" x2="340" y2="150" />
            <line x1="410" y1="540" x2="370" y2="150" />
            <line x1="180" y1="140" x2="600" y2="140" strokeWidth="5" />
            <line x1="355" y1="70" x2="180" y2="140" strokeWidth="2.5" />
            <line x1="355" y1="70" x2="600" y2="140" strokeWidth="2.5" />
            <line x1="355" y1="70" x2="355" y2="140" strokeWidth="2.5" />
          </g>
          <defs>
            <linearGradient id="loginPortGrad" x1="0" y1="0" x2="1200" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E3A8A" />
              <stop offset="0.6" stopColor="#0369A1" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Container Layout */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Branding Side */}
        <div className="lg:col-span-6 flex flex-col justify-center text-white space-y-4 px-2 sm:px-6">
          <div className="mb-2">
            <HipgLogo inverted={true} className="scale-110 origin-left" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight drop-shadow-md">
            Learning Portal
          </h1>
          <p className="text-base sm:text-lg text-[#CBD5E1] font-normal leading-relaxed">
            System Training &amp; User Manual
          </p>
          <div className="pt-4 border-t border-white/20 text-xs text-[#E2E8F0] space-y-1">
            <p><strong>Admin Demo:</strong> admin / HipgAdmin@2026!</p>
            <p><strong>Employee Demo:</strong> Chathuranga / HipgPort@2026</p>
          </div>
        </div>

        {/* Right Sign In Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/40 p-7 sm:p-9 text-[#142B45]">
            <h2 className="text-2xl font-black text-[#082B4C] tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-[#64748B] mt-1 mb-5">
              Access the HIPG Learning Portal
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#142B45]">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DCE6F1] rounded-xl text-xs sm:text-sm text-[#142B45] focus:outline-none focus:ring-2 focus:ring-[#1266D5]/30 focus:border-[#1266D5] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#142B45]">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#DCE6F1] rounded-xl text-xs sm:text-sm text-[#142B45] focus:outline-none focus:ring-2 focus:ring-[#1266D5]/30 focus:border-[#1266D5] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#142B45] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1266D5] border-[#CBD5E1] focus:ring-[#1266D5]"
                  />
                  <span className="text-[#64748B] font-medium">Remember me</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact HIPG IT Service Desk at ext 4401 or ithelpdesk@hipg.lk');
                  }}
                  className="font-semibold text-[#1266D5] hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1266D5] hover:bg-[#0D55B8] active:bg-[#084293] text-white font-bold text-sm shadow-md shadow-[#1266D5]/30 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
