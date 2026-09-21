import { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { PlanoraLogo } from '../../components/common/PlanoraLogo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface AuthSplitViewProps {
  initialTab?: 'login' | 'register';
  onBackToLanding: () => void;
  onEnterApp: () => void;
}

export function AuthSplitView({
  initialTab = 'login',
  onBackToLanding,
  onEnterApp
}: AuthSplitViewProps) {
  const { isDark } = useTheme();
  const { login, register, loading } = useAuth();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
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
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

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
      setSuccessMsg('Đăng nhập thành công! Đang chuyển tiếp...');
      setTimeout(() => {
        onEnterApp();
      }, 400);
    } else {
      setErrorMsg(res.message || 'Email hoặc mật khẩu không chính xác.');
    }
  };

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

    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    const res = await register(regName, regEmail, regPassword);
    if (res.success) {
      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển tiếp...');
      setTimeout(() => {
        onEnterApp();
      }, 500);
    } else {
      setErrorMsg(res.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ email đã đăng ký.');
      return;
    }
    setErrorMsg('');
    setForgotSent(true);
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
                  Theo dõi môn học & bài giảng
                </h2>
                <p className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Trực quan hóa tiến độ % từng khoá học, không bao giờ bỏ quên deadline.
                </p>
              </div>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/70 border-neutral-800/80 backdrop-blur-sm' : 'bg-white/90 border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`font-semibold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Planora AI Subtask Engine
                </h2>
                <p className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  1-Click phân rã bài tập lập trình phức tạp thành các đầu việc nhỏ vừa sức.
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
            <span>Dữ liệu lưu trữ an toàn & đồng bộ</span>
          </div>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Planora Platform v1.0
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NỬA PHẢI (RIGHT HALF): CHIẾM TRỌN TOÀN BỘ KHÔNG GIAN, KHÔNG VIỀN POP-UP    */}
      {/* VỪA KHÍT TRONG MÀN HÌNH - KHÔNG BỊ THANH CUỘN LÊN XUỐNG                   */}
      {/* ========================================================================= */}
      <div className={`flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-16 xl:px-24 py-6 overflow-y-auto ${
        isDark ? 'bg-neutral-950 text-white' : 'bg-white text-slate-900'
      }`}>
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center">
          {/* Top Switcher: 2 NÚT [ ĐĂNG NHẬP | ĐĂNG KÝ ] */}
          <div className="flex items-center justify-center mb-6">
            <div className={`p-1 rounded-xl border flex items-center text-sm font-semibold w-full sm:w-auto ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 sm:flex-initial px-8 py-2 rounded-lg transition-all cursor-pointer text-center text-xs sm:text-sm ${
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
                className={`flex-1 sm:flex-initial px-8 py-2 rounded-lg transition-all cursor-pointer text-center text-xs sm:text-sm ${
                  mode === 'register'
                    ? isDark 
                      ? 'bg-neutral-800 text-white font-bold shadow-xs' 
                      : 'bg-white text-indigo-600 font-bold shadow-xs'
                    : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Ký
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
              <div className="mb-5">
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
                      placeholder="tenban@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
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
                      onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
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
                      placeholder="Nhập mật khẩu của bạn"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
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
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm sm:text-base font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer mt-2"
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
          {/* 2. FORM ĐĂNG KÝ (REGISTER) - ĐÃ BỎ HOÀN TOÀN CHỌN VAI TRÒ TÀI KHOẢN */}
          {/* ================================================================= */}
          {mode === 'register' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Tạo tài khoản mới</h3>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Bắt đầu lập kế hoạch học tập thông minh cùng Planora.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-3.5">
                <div>
                  <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
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
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="tenban@domain.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                      Nhập lại mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm sm:text-base font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer mt-2"
                >
                  {loading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký'}
                </button>
              </form>

              <div className={`mt-5 text-center text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
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
          {/* 3. FORM QUÊN MẬT KHẨU (FORGOT PASSWORD)                          */}
          {/* ================================================================= */}
          {mode === 'forgot' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Khôi phục mật khẩu</h3>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Nhập địa chỉ email tài khoản để nhận liên kết đặt lại mật khẩu mới.
                </p>
              </div>

              {forgotSent ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold">Đã gửi hướng dẫn khôi phục!</h4>
                    <p className={`text-xs sm:text-sm mt-1.5 max-w-md mx-auto ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                      Hệ thống đã gửi liên kết xác thực tới <strong>{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư đến.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setForgotSent(false); }}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      Quay Lại Đăng Nhập
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                      Địa chỉ Email đăng ký
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="tenban@example.com"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    Chúng tôi sẽ gửi một đường dẫn an toàn vào email của bạn để bạn có thể tự thiết lập mật khẩu mới trong vòng 15 phút.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    Gửi Liên Kết Khôi Phục
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
