import React, { useState, useMemo } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound,
  ExternalLink,
  RotateCcw,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { validatePassword } from '../../utils/passwordValidator';
import { api } from '../../services/api';

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalTab, 
    closeAuthModal, 
    setAuthModalTab, 
    login, 
    register, 
    loading,
    setAuthenticatedUser 
  } = useAuth();
  const { isDark } = useTheme();

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot password form states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'otp_reset'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  // Status message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const regValidation = useMemo(() => validatePassword(regPassword), [regPassword]);
  const resetValidation = useMemo(() => validatePassword(newPassword), [newPassword]);

  if (!isAuthModalOpen) return null;

  const handleFillAdmin = () => {
    setAuthModalTab('login');
    setLoginEmail('systemadmin@gmail.com');
    setLoginPassword('@Systemadmin');
    setErrorMessage(null);
    setSuccessMessage('Đã điền tài khoản Quản trị viên (Admin)');
  };

  const handleFillTester = () => {
    setAuthModalTab('login');
    setLoginEmail('Tester123@gmail.com');
    setLoginPassword('Password123@');
    setErrorMessage(null);
    setSuccessMessage('Đã điền tài khoản Thành viên kiểm thử (Tester)');
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

    if (!regValidation.valid) {
      setErrorMessage(regValidation.message);
      return;
    }

    const res = await register(regName, regEmail, regPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Đăng ký thất bại. Vui lòng kiểm tra thông tin.');
    } else {
      setSuccessMessage('Đăng ký tài khoản Planora thành công!');
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSendingEmail(true);

    try {
      const res = await api.forgotPassword(forgotEmail);
      if (res.success) {
        setEmailPreviewUrl(res.previewUrl || null);
        setSuccessMessage(res.message);
        setForgotStep('otp_reset');
        if (res.devOtp) {
          setOtpCode(res.devOtp);
        }
      } else {
        setErrorMessage(res.message || 'Không thể gửi mã xác nhận.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi gửi email xác nhận.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!resetValidation.valid) {
      setErrorMessage(resetValidation.message);
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await api.resetPassword(forgotEmail, otpCode, newPassword);
      if (res.success && res.user && res.token) {
        setSuccessMessage('Đặt lại mật khẩu thành công! Đang đăng nhập...');
        setAuthenticatedUser(res.user, res.token);
      } else {
        setErrorMessage(res.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi đặt lại mật khẩu.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const renderRulesBox = (validation: typeof regValidation, pwd: string) => {
    if (!pwd) return null;
    return (
      <div className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="font-semibold text-slate-400">Yêu cầu bảo mật:</div>
        <div className="grid grid-cols-2 gap-1">
          <div className={`flex items-center gap-1 ${validation.rules.minLength ? 'text-emerald-500' : 'text-neutral-400'}`}>
            <Check className="w-3 h-3" />
            <span>Tối thiểu 8 ký tự</span>
          </div>
          <div className={`flex items-center gap-1 ${validation.rules.hasUpper ? 'text-emerald-500' : 'text-neutral-400'}`}>
            <Check className="w-3 h-3" />
            <span>Chữ hoa (A-Z)</span>
          </div>
          <div className={`flex items-center gap-1 ${validation.rules.hasNumber ? 'text-emerald-500' : 'text-neutral-400'}`}>
            <Check className="w-3 h-3" />
            <span>Chữ số (0-9)</span>
          </div>
          <div className={`flex items-center gap-1 ${validation.rules.hasSpecial ? 'text-emerald-500' : 'text-neutral-400'}`}>
            <Check className="w-3 h-3" />
            <span>Ký tự đặc biệt (@)</span>
          </div>
        </div>
      </div>
    );
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
              <span className="text-indigo-600 dark:text-indigo-400">Planora v1.5</span>
              <span>-</span>
              <span>
                {authModalTab === 'login' ? 'Đăng Nhập' : authModalTab === 'register' ? 'Đăng Ký' : 'Quên Mật Khẩu'}
              </span>
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Nền tảng quản lý kế hoạch & học tập thông minh
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark 
                ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' 
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className={`grid grid-cols-3 p-1 rounded-xl my-3.5 text-xs font-medium ${
          isDark ? 'bg-neutral-950 border border-neutral-800' : 'bg-slate-100'
        }`}>
          <button
            type="button"
            onClick={() => { setAuthModalTab('login'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              authModalTab === 'login'
                ? isDark ? 'bg-neutral-800 text-white font-semibold shadow-xs' : 'bg-white text-indigo-600 font-semibold shadow-xs'
                : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalTab('register'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              authModalTab === 'register'
                ? isDark ? 'bg-neutral-800 text-white font-semibold shadow-xs' : 'bg-white text-indigo-600 font-semibold shadow-xs'
                : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Ký
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalTab('forgot'); setForgotStep('email'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              authModalTab === 'forgot'
                ? isDark ? 'bg-neutral-800 text-white font-semibold shadow-xs' : 'bg-white text-indigo-600 font-semibold shadow-xs'
                : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quên MK
          </button>
        </div>

        {/* Quick fill buttons */}
        <div className="mb-3 flex items-center justify-between text-xs p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Thử nhanh:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={handleFillTester}
              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-600 text-white hover:bg-cyan-500 cursor-pointer"
            >
              🎓 Tester
            </button>
          </div>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {authModalTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
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
                  placeholder="Tester123@gmail.com hoặc admin"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-medium ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => { setAuthModalTab('forgot'); setForgotStep('email'); }}
                  className="text-xs text-indigo-500 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
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
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
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
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Email đăng ký
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
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Mật khẩu (bảo mật cao)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="VD: Password123@"
                  className={`w-full pl-9 pr-9 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {renderRulesBox(regValidation, regPassword)}

            <button
              type="submit"
              disabled={loading || !regValidation.valid}
              className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản Thành Viên'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Forgot Password Flow */}
        {authModalTab === 'forgot' && (
          <div className="space-y-3">
            {forgotStep === 'email' ? (
              <form onSubmit={handleRequestOtp} className="space-y-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Email nhận mã xác nhận
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="VD: Tester123@gmail.com"
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  Mã xác thực OTP 6 số sẽ được gửi trực tiếp đến hộp thư của bạn.
                </div>

                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Đang gửi email...' : 'Gửi Mã Xác Nhận Về Email'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                {emailPreviewUrl && (
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs flex items-center justify-between">
                    <span className="text-blue-500">Xem hòm thư Ethereal:</span>
                    <a
                      href={emailPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>Mở thư</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-xs font-medium ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                      Mã OTP (6 chữ số)
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotStep('email')}
                      className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Gửi lại</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.trim())}
                    placeholder="123456"
                    className={`w-full py-2 text-center font-mono font-bold tracking-widest text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="VD: Password123@"
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                {renderRulesBox(resetValidation, newPassword)}

                <button
                  type="submit"
                  disabled={isSendingEmail || !resetValidation.valid}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? 'Đang cập nhật...' : 'Xác Nhận Đặt Lại & Đăng Nhập'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
