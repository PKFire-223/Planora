import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, setAuthModalTab, login, register, loading } = useAuth();
  const { isDark } = useTheme();

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleFillAdmin = () => {
    setAuthModalTab('login');
    setLoginEmail('systemadmin@gmail.com');
    setLoginPassword('@Systemadmin');
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Email hoặc mật khẩu không chính xác');
    } else {
      setSuccessMessage('Đăng nhập thành công!');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await register(regName, regEmail, regPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Đăng ký thất bại. Vui lòng kiểm tra thông tin.');
    } else {
      setSuccessMessage('Đăng ký tài khoản Planora thành công!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
          isDark 
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400">Planora</span>
              <span>-</span>
              <span>{authModalTab === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Nền tảng quản lý kế hoạch & học tập thông minh
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className={`grid grid-cols-2 p-1 rounded-xl my-4 text-xs font-medium ${
          isDark ? 'bg-neutral-950 border border-neutral-800' : 'bg-slate-100'
        }`}>
          <button
            type="button"
            onClick={() => { setAuthModalTab('login'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all ${
              authModalTab === 'login'
                ? isDark 
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm' 
                  : 'bg-white text-indigo-600 font-semibold shadow-sm'
                : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalTab('register'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all ${
              authModalTab === 'register'
                ? isDark 
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm' 
                  : 'bg-white text-indigo-600 font-semibold shadow-sm'
                : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tạo Tài Khoản Mới
          </button>
        </div>

        {/* 1-Click Quick Fill Admin */}
        <div className={`mb-4 p-3 rounded-xl border flex items-center justify-between gap-3 ${
          isDark 
            ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200' 
            : 'bg-indigo-50 border-indigo-200 text-indigo-900'
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="font-medium">Tài khoản Admin hệ thống (.env)</p>
              <p className={`text-[11px] ${isDark ? 'text-indigo-300/80' : 'text-indigo-700'}`}>
                systemadmin@gmail.com
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillAdmin}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-colors shrink-0"
          >
            Điền nhanh
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {authModalTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Vào Planora'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Register Form */}
        {authModalTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Họ và tên của bạn
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Email học tập
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="hocvien@planora.edu.vn"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Mật khẩu (tối thiểu 6 ký tự)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản Mới'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
