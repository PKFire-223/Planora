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
  KeyRound,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { PlanoraLogo } from '../../components/common/PlanoraLogo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { login, register, loading } = useAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
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
  const [regRole, setRegRole] = useState<'student' | 'admin'>('student');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Quick-fill admin credentials
  const handleQuickFillAdmin = () => {
    setLoginEmail('systemadmin@gmail.com');
    setLoginPassword('@Systemadmin');
    setErrorMsg('');
  };

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
      }, 500);
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
      }, 600);
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
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors ${
      isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* ========================================================================= */}
      {/* NỬA TRÁI (LEFT HALF): PHẦN TRANG TRÍ GIỮ NGUYÊN BẤT KỂ CHUYỂN ĐỔI FORM   */}
      {/* ========================================================================= */}
      <div className={`w-full md:w-1/2 lg:w-5/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r transition-colors ${
        isDark 
          ? 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-indigo-950/40 border-neutral-800' 
          : 'bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/70 border-slate-200'
      }`}>
        {/* Background Ambient Glow Accents */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Top brand header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-8">
            <PlanoraLogo size="lg" onClick={onBackToLanding} />
            <button
              onClick={onBackToLanding}
              className={`text-xs font-medium px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </button>
          </div>

          <div className="space-y-4 max-w-lg">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Nền Tảng Quản Lý Học Tập Thông Minh</span>
            </span>

            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Định hướng lộ trình,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-500 to-blue-600">
                chinh phục mục tiêu
              </span>
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              Planora giúp bạn quản lý toàn bộ khoá học, tự động chia nhỏ bài tập lớn thành từng bước khả thi bằng Gemini AI và theo dõi sát sao tiến độ học tập mỗi ngày.
            </p>
          </div>
        </div>

        {/* Visual Feature Highlights on Left Decor */}
        <div className="relative z-10 my-8 space-y-3">
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800/80 backdrop-blur-sm' : 'bg-white/90 border-slate-200/90 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Theo dõi môn học & bài giảng
                </h2>
                <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Trực quan hóa tiến độ % từng khoá học, không bao giờ bỏ quên deadline.
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-neutral-900/60 border-neutral-800/80 backdrop-blur-sm' : 'bg-white/90 border-slate-200/90 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`font-semibold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Planora AI Subtask Engine
                </h2>
                <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  1-Click phân rã bài tập lập trình phức tạp thành các đầu việc nhỏ vừa sức.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Security Note on Left */}
        <div className={`relative z-10 pt-4 border-t flex items-center justify-between text-xs ${
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
      {/* NỬA PHẢI (RIGHT HALF): BACKGROUND TO CHỨA KHUNG ĐĂNG NHẬP, ĐĂNG KÝ, QUÊN MK */}
      {/* ========================================================================= */}
      <div className={`flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 relative ${
        isDark ? 'bg-neutral-950' : 'bg-slate-100/70'
      }`}>
        {/* Decorative Grid Lines / Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.07] pointer-events-none" />

        {/* Khung (Container Card) lớn chứa các form xác thực */}
        <div className={`w-full max-w-lg rounded-3xl border p-6 sm:p-9 shadow-xl relative z-10 transition-all ${
          isDark 
            ? 'bg-neutral-900 border-neutral-800 text-white shadow-black/40' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/80'
        }`}>
          {/* Top Switcher Tabs inside the Card */}
          <div className="flex items-center justify-between mb-6">
            <div className={`p-1 rounded-xl border flex items-center text-xs font-medium ${
              isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tab === 'login'
                    ? isDark 
                      ? 'bg-neutral-800 text-white font-bold shadow-xs' 
                      : 'bg-white text-indigo-700 font-bold shadow-xs'
                    : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Nhập
              </button>

              <button
                type="button"
                onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tab === 'register'
                    ? isDark 
                      ? 'bg-neutral-800 text-white font-bold shadow-xs' 
                      : 'bg-white text-indigo-700 font-bold shadow-xs'
                    : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Ký
              </button>

              <button
                type="button"
                onClick={() => { setTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  tab === 'forgot'
                    ? isDark 
                      ? 'bg-neutral-800 text-white font-bold shadow-xs' 
                      : 'bg-white text-indigo-700 font-bold shadow-xs'
                    : isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quên MK
              </button>
            </div>

            {/* Quick Demo App Entry Link */}
            <button
              type="button"
              onClick={onEnterApp}
              className={`text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              <span>Vào app ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: FORM ĐĂNG NHẬP (LOGIN)                                     */}
          {/* ================================================================= */}
          {tab === 'login' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-bold tracking-tight">Chào mừng bạn trở lại!</h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Đăng nhập vào tài khoản Planora để tiếp tục tiến trình học tập.
                </p>
              </div>

              {/* Quick Fill Admin Box */}
              <div className={`p-3 rounded-2xl border mb-5 flex items-center justify-between gap-3 ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-xs">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 block">
                    Tài khoản Admin kiểm thử:
                  </span>
                  <span className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    systemadmin@gmail.com
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors shrink-0"
                >
                  ⚡ Điền nhanh
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="tenban@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span className={isDark ? 'text-neutral-300' : 'text-slate-600'}>
                      Ghi nhớ đăng nhập trên thiết bị này
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer mt-2"
                >
                  {loading ? 'Đang xác thực...' : 'Đăng Nhập Vào Planora'}
                </button>
              </form>

              <div className={`mt-6 text-center text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Chưa có tài khoản học viên?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Đăng ký miễn phí ngay
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: FORM ĐĂNG KÝ (REGISTER)                                    */}
          {/* ================================================================= */}
          {tab === 'register' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-bold tracking-tight">Tạo tài khoản mới</h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Bắt đầu lập kế hoạch học tập thông minh hoàn toàn miễn phí.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Họ và tên
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="tenban@domain.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                      Nhập lại mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    Vai trò tài khoản
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegRole('student')}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        regRole === 'student'
                          ? isDark 
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300' 
                            : 'bg-indigo-50 border-indigo-600 text-indigo-700'
                          : isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>Học Viên (Student)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('admin')}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        regRole === 'admin'
                          ? isDark 
                            ? 'bg-rose-950/60 border-rose-500 text-rose-300' 
                            : 'bg-rose-50 border-rose-600 text-rose-700'
                          : isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>Quản Trị Viên (Admin)</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer mt-2"
                >
                  {loading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký'}
                </button>
              </form>

              <div className={`mt-5 text-center text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: FORM QUÊN MẬT KHẨU (FORGOT PASSWORD)                       */}
          {/* ================================================================= */}
          {tab === 'forgot' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-bold tracking-tight">Khôi phục mật khẩu</h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Nhập địa chỉ email tài khoản để nhận liên kết hoặc mã đặt lại mật khẩu mới.
                </p>
              </div>

              {forgotSent ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Đã gửi hướng dẫn khôi phục!</h4>
                    <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                      Hệ thống đã gửi liên kết xác thực tới <strong>{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam).
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => { setTab('login'); setForgotSent(false); }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      Quay Lại Đăng Nhập
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                      Địa chỉ Email đăng ký
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="tenban@example.com"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                          isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <div className="flex items-start gap-2">
                      <KeyRound className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        Nếu bạn quên mật khẩu Admin kiểm thử, mật khẩu mặc định là: <strong>@Systemadmin</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    Gửi Liên Kết Đặt Lại Mật Khẩu
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className={`text-xs font-medium hover:underline cursor-pointer ${
                        isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ← Quay lại Đăng Nhập
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
