'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { login } from '@/app/actions/auth';
import { User, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem('soidao_remember');
    if (saved) {
      try {
        const { username, password } = JSON.parse(saved);
        if (usernameRef.current) usernameRef.current.value = username || '';
        if (passwordRef.current) passwordRef.current.value = password || '';
        setRememberMe(true);
      } catch { }
    }
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    // Save or clear credentials
    if (rememberMe) {
      localStorage.setItem('soidao_remember', JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password'),
      }));
    } else {
      localStorage.removeItem('soidao_remember');
    }

    const result = await login(null, formData);

    if (result?.error) {
      setError((result as any).error);
      setIsPending(false);
    } else if (result?.success) {
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4"
          >
            {/* You can replace this with an actual logo image if available */}
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            เข้าสู่ระบบ
          </h2>
          <p className="text-slate-500 mt-2">โรงเรียนสอยดาววิทยา</p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-center justify-center"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 ml-1" htmlFor="username">
              Username (ชื่อผู้ใช้งาน)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                ref={usernameRef}
                id="username"
                name="username"
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all outline-none text-slate-800"
                placeholder="รหัสนักเรียน"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 ml-1" htmlFor="password">
              Password (รหัสผ่าน)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all outline-none text-slate-800"
                placeholder="เหมือน PS SCHOOL ค่าเริ่มต้น"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me + Forgot hint */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
              />
              <span className="text-sm text-slate-600">จดจำรหัสผ่าน</span>
            </label>
            <p className="text-xs text-slate-400">
              ลืมรหัส? ติดต่อ{' '}
              <a
                href="https://line.me/ti/p/~framespidy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 font-semibold hover:underline"
              >
                Line: framespidy
              </a>
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
            >
              {isPending ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  กำลังตรวจสอบ...
                </div>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
              &larr; กลับหน้าหลัก
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
