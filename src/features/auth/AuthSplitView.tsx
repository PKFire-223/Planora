import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  AlertCircle,
  KeyRound,
  ExternalLink,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { PlanoraLogo } from '../../components/common/PlanoraLogo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { validatePassword } from '../../utils/passwordValidator';
import { api } from '../../services/api';

interface AuthSplitViewProps {
  initialTab?: 'login' | 'register' | 'forgot';
  onBackToLanding: () => void;
  onEnterApp: () => void;
}

export function AuthSplitView({
  initialTab = 'login',
  onBackToLanding,
  onEnterApp
}: AuthSplitViewProps) {
  const { isDark } = useTheme();
  const { login, register, loading, setAuthenticatedUser } = useAuth();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot password form state
  const [forgotStep, setForgotStep] = useState<'email' | 'otp_reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [emailResultInfo, setEmailResultInfo] = useState<{
    previewUrl?: string;
    isRealSmtp?: boolean;
    devOtp?: string;
  } | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Real-time password validation evaluations
  const regValidation = useMemo(() => validatePassword(regPassword), [regPassword]);
  const resetValidation = useMemo(() => validatePassword(newPassword), [newPassword]);

  // Quick fill handlers
  const handleQuickFillAdmin = () => {
    setMode('login');
    setLoginEmail('systemadmin@gmail.com');
    setLoginPassword('@Systemadmin');
    setErrorMsg('');
    setSuccessMsg('Đã điền thông tin tài khoản Quản trị viên (Admin).');
  };

  const handleQuickFillTester = () => {
    setMode('login');
    setLoginEmail('Tester123@gmail.com');
    setLoginPassword('Password123@');
    setErrorMsg('');
    setSuccessMsg('Đã điền tài khoản Thành Viên kiểm thử (Tester).');
  };

  // Login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    const res = await login(loginEmail, loginPassword);
    if (res.success) {
      setSuccessMsg('Đăng nhập thành công! Đang chuyển tiếp vào ứng dụng...');
      setTimeout(() => {
        onEnterApp();
      }, 400);
    } else {
      setErrorMsg(res.message || 'Email hoặc mật khẩu không chính xác.');
    }
  };

  // Register submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    if (!regValidation.valid) {
      setErrorMsg(regValidation.message);
      return;
    }

    const res = await register(regName, regEmail, regPassword);
    if (res.success) {
      setSuccessMsg('Đăng ký tài khoản Planora thành công! Đang chuyển tiếp...');
      setTimeout(() => {
        onEnterApp();
      }, 500);
    } else {
      setErrorMsg(res.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  // Forgot password - Step 1: Send OTP to real email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ email đã đăng ký.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsSendingEmail(true);

    try {
      const res = await api.forgotPassword(forgotEmail);
      if (res.success) {
        setEmailResultInfo({
          previewUrl: res.previewUrl,
          isRealSmtp: res.isRealSmtp,
          devOtp: res.devOtp
        });
        setSuccessMsg(res.message);
        setForgotStep('otp_reset');
        if (res.devOtp) {
          setOtpCode(res.devOtp); // Auto-fill for developer convenience
        }
      } else {
        setErrorMsg(res.message || 'Không thể gửi mã xác nhận. Vui lòng kiểm tra lại email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi hệ thống khi gửi email xác nhận.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Forgot password - Step 2: Verify OTP & Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode || !newPassword) {
      setErrorMsg('Vui lòng nhập mã xác nhận 6 số và mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Mật khẩu mới và mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (!resetValidation.valid) {
      setErrorMsg(resetValidation.message);
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await api.resetPassword(forgotEmail, otpCode, newPassword);
      if (res.success && res.user && res.token) {
        setSuccessMsg('Đặt lại mật khẩu thành công! Đang tự động đăng nhập...');
        setAuthenticatedUser(res.user, res.token);
        setTimeout(() => {
          onEnterApp();
        }, 600);
      } else {
        setErrorMsg(res.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi đặt lại mật khẩu.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Helper component to render password criteria checklist
  const renderPasswordRules = (pwd: string, validation: typeof regValidation) => {
    if (!pwd) return null;
    return (
      <div className={`mt-2 p-2.5 rounded-xl border text-[11px] space-y-1 transition-all ${
        isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`font-semibold mb-1 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
          Yêu cầu mật khẩu an toàn:
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className={`flex items-center gap-1.5 ${validation.rules.minLength ? 'text-emerald-500 font-semibold' : 'text-neutral-400'}`}>
            {validation.rules.minLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />}
            <span>Tối thiểu 8 ký tự</span>
          </div>
          <div className={`flex items-center gap-1.5 ${validation.rules.hasUpper ? 'text-emerald-500 font-semibold' : 'text-neutral-400'}`}>
            {validation.rules.hasUpper ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />}
            <span>Chữ in hoa (A-Z)</span>
          </div>
          <div className={`flex items-center gap-1.5 ${validation.rules.hasNumber ? 'text-emerald-500 font-semibold' : 'text-neutral-400'}`}>
            {validation.rules.hasNumber ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />}
            <span>Chữ số (0-9)</span>
          </div>
          <div className={`flex items-center gap-1.5 ${validation.rules.hasSpecial ? 'text-emerald-500 font-semibold' : 'text-neutral-400'}`}>
            {validation.rules.hasSpecial ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />}
            <span>Ký tự đặc biệt (@, #, $)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-screen w-full flex flex-col lg:flex-row overflow-hidden transition-colors ${
      isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-white text-slate-900'
    }`}>
      {/* ========================================================================= */}
      {/* NỬA TRÁI (LEFT HALF): THÔNG TIN GIỚI THIỆU & BRANDING GỌN GÀNG             */}
      {/* ========================================================================= */}
      <div className={`w-full lg:w-5/12 xl:w-5/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r shrink-0 transition-colors ${
        isDark 
          ? 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-indigo-950/40 border-neutral-800' 
          : 'bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 border-slate-200'
      }`}>
        {/* Background Ambient Glow Accents */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Top brand header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <PlanoraLogo size="lg" onClick={onBackToLanding} />
            <button
              onClick={onBackToLanding}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800' 
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang Giới Thiệu</span>
            </button>
          </div>

          <div className="space-y-3 max-w-lg">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Nền Tảng Quản Lý Kế Hoạch & Học Tập Kỷ Nguyên AI</span>
            </span>

            <h1 className={`text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Định hướng lộ trình,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-500 to-blue-600">
                chinh phục mục tiêu
              </span>
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              Planora giúp bạn quản lý toàn bộ môn học, tự động chia nhỏ bài tập lớn thành từng bước khả thi bằng Gemini AI và theo dõi sát sao tiến độ học tập mỗi ngày.
            </p>
          </div>
        </div>

        {/* Visual Feature Highlights on Left Decor */}
        <div className="relative z-10 my-4 space-y-3 hidden sm:block">
          <div className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/70 border-neutral-800/80 backdrop-blur-sm' : 'bg-white/90 border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`font-semibold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Bảo mật tài khoản đa tầng
                </h2>
                <p className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Chuẩn mật khẩu cao cấp (8 ký tự, chữ hoa, số & ký tự đặc biệt @). Phân quyền Admin và Thành viên rõ ràng.
                </p>
              </div>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/70 border-neutral-800/80 backdrop-blur-sm' : 'bg-white/90 border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`font-semibold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Gửi mã khôi phục về Email thật
                </h2>
                <p className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Tích hợp máy chủ thư điện tử bảo mật, cấp mã OTP 6 số xác thực đặt lại mật khẩu trong 15 phút.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Security Note on Left */}
        <div className={`relative z-10 pt-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-500'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Dữ liệu mã hoá & phân quyền an toàn</span>
          </div>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Planora Platform v1.5
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NỬA PHẢI (RIGHT HALF): FORM LOGIN / REGISTER / FORGOT PASSWORD             */}
      {/* ========================================================================= */}
      <div className={`flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-16 xl:px-24 py-6 overflow-y-auto ${
        isDark ? 'bg-neutral-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center">
          {/* Top Switcher: 3 NÚT [ ĐĂNG NHẬP | ĐĂNG KÝ | QUÊN MẬT KHẨU ] */}
          <div className="flex items-center justify-center mb-5">
            <div className={`p-1 rounded-xl border flex items-center text-xs sm:text-sm font-semibold w-full sm:w-auto ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 sm:flex-initial px-6 py-2 rounded-lg transition-all cursor-pointer text-center ${
                  mode === 'login'
                    ? isDark 
                      ? 'bg-neutral-800 text-white font-bold shadow-xs' 
                      : 'bg-white text-indigo-600 font-bold shadow-xs'
                    : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Nhập
              </button>

              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 sm:flex-initial px-6 py-2 rounded-lg transition-all cursor-pointer text-center ${
                  mode === 'register'
                    ? isDark 
                      ? 'bg-neutral-800 text-white font-bold shadow-xs' 
                      : 'bg-white text-indigo-600 font-bold shadow-xs'
                    : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Ký
              </button>

              <button
                type="button"
                onClick={() => { setMode('forgot'); setForgotStep('email'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 sm:flex-initial px-6 py-2 rounded-lg transition-all cursor-pointer text-center ${
                  mode === 'forgot'
                    ? isDark 
                      ? 'bg-neutral-800 text-white font-bold shadow-xs' 
                      : 'bg-white text-indigo-600 font-bold shadow-xs'
                    : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quên Mật Khẩu
              </button>
            </div>
          </div>

          {/* Quick Fill Testing Accounts Badge Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Tài khoản kiểm thử nhanh:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border ${
                  isDark 
                    ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-200' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-2xs'
                }`}
                title="Admin: systemadmin@gmail.com / @Systemadmin"
              >
                👑 Admin
              </button>

              <button
                type="button"
                onClick={handleQuickFillTester}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border ${
                  isDark 
                    ? 'bg-indigo-900/40 border-indigo-700 hover:bg-indigo-800/50 text-indigo-200' 
                    : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700 shadow-2xs'
                }`}
                title="Thành viên: Tester123@gmail.com / Password123@"
              >
                🎓 Tester Thành Viên
              </button>
            </div>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* 1. FORM ĐĂNG NHẬP (LOGIN)                                         */}
          {/* ================================================================= */}
          {mode === 'login' && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Chào mừng bạn trở lại!</h3>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Đăng nhập vào tài khoản Planora để tiếp tục tiến trình học tập.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="tenban@example.com hoặc Tester123@gmail.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs sm:text-sm font-semibold ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setForgotStep('email'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu (ví dụ: Password123@)"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer p-1"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={`text-xs ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
                      Ghi nhớ đăng nhập trên thiết bị này
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer mt-2"
                >
                  {loading ? 'Đang xác thực tài khoản...' : 'Đăng Nhập Vào Planora'}
                </button>
              </form>

              <div className={`mt-5 text-center text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                Chưa có tài khoản học viên?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer ml-1"
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 2. FORM ĐĂNG KÝ (REGISTER)                                        */}
          {/* ================================================================= */}
          {mode === 'register' && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Tạo tài khoản Thành Viên mới</h3>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Mật khẩu bảo mật bắt buộc có 8 ký tự, chữ hoa, số và ký tự đặc biệt như @.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className={`block text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                    Họ và tên
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="tenban@gmail.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="VD: Password123@"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className={`w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                      Nhập lại mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập lại mật khẩu"
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real-time visual criteria checklist */}
                {renderPasswordRules(regPassword, regValidation)}

                <button
                  type="submit"
                  disabled={loading || !regValidation.valid}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer mt-2"
                >
                  {loading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký Thành Viên'}
                </button>
              </form>

              <div className={`mt-4 text-center text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer ml-1"
                >
                  Đăng nhập tại đây
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 3. FORM QUÊN MẬT KHẨU (GỬI VỀ EMAIL THẬT + XÁC THỰC OTP)         */}
          {/* ================================================================= */}
          {mode === 'forgot' && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Khôi phục mật khẩu</h3>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  {forgotStep === 'email' 
                    ? 'Nhập địa chỉ email thật để nhận mã xác nhận OTP 6 số qua hòm thư điện tử.'
                    : `Hệ thống đã gửi mã xác nhận 6 số tới ${forgotEmail}. Vui lòng nhập mã để tạo mật khẩu mới.`}
                </p>
              </div>

              {/* STEP 1: NHẬP EMAIL ĐỂ GỬI MÃ OTP THẬT */}
              {forgotStep === 'email' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                      Địa chỉ Email đăng ký
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="Ví dụ: Tester123@gmail.com"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    Hệ thống sẽ gửi một bức thư chứa mã OTP 6 chữ số đến hộp thư của bạn. Mã có hiệu lực trong vòng 15 phút.
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{isSendingEmail ? 'Đang gửi email thật...' : 'Gửi Mã Xác Nhận Về Email'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      className={`text-xs sm:text-sm font-semibold hover:underline cursor-pointer ${
                        isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ← Quay lại đăng nhập
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: NHẬP MÃ OTP & MẬT KHẨU MỚI (TUÂN THỦ 8 KÝ TỰ, CHỮ HOA, SỐ, ĐẶC BIỆT @) */}
              {forgotStep === 'otp_reset' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  {/* Email Delivery Banner / Dev Inbox Link */}
                  {emailResultInfo?.previewUrl && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-600 dark:text-blue-400 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span>Xem thư thực tế trong hòm thư ảo Ethereal:</span>
                      </div>
                      <a
                        href={emailResultInfo.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-blue-600 text-white rounded font-bold hover:bg-blue-500 flex items-center gap-1"
                      >
                        <span>Mở Thư</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={`block text-xs sm:text-sm font-semibold ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                        Mã xác nhận OTP (6 chữ số)
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
                      placeholder="VD: 123456"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.trim())}
                      className={`w-full px-4 py-2.5 text-center tracking-widest font-mono text-lg font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="VD: Password123@"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={`w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        className={`w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Real-time visual criteria checklist for reset password */}
                  {renderPasswordRules(newPassword, resetValidation)}

                  <button
                    type="submit"
                    disabled={isSendingEmail || !resetValidation.valid}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    {isSendingEmail ? 'Đang cập nhật mật khẩu...' : 'Xác Nhận Đặt Lại & Tự Động Đăng Nhập'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      className={`text-xs sm:text-sm font-semibold hover:underline cursor-pointer ${
                        isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ← Huỷ và quay lại đăng nhập
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
