import { 
  BookOpen, 
  CheckSquare, 
  StickyNote, 
  Target, 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Sun, 
  Moon, 
  LogIn, 
  UserPlus, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Users, 
  FolderTree, 
  Lock,
  Compass
} from 'lucide-react';
import { PlanoraLogo } from '../../components/common/PlanoraLogo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface LandingPageViewProps {
  onOpenAuth: (tab: 'login' | 'register' | 'forgot') => void;
  onEnterApp: () => void;
}

export function LandingPageView({ onOpenAuth, onEnterApp }: LandingPageViewProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Quản Lý Khoá Học Chuyên Sâu',
      description: 'Lưu trữ thông tin môn học, mã lớp, giảng viên, phân loại màu sắc và theo dõi tỷ lệ phần trăm hoàn thành theo thời gian thực.',
      color: 'indigo'
    },
    {
      icon: Sparkles,
      title: 'Phân Tích & Chia Nhỏ Task Bằng AI',
      description: 'Tích hợp Gemini AI giúp tự động phân rã các đề bài, bài tập lớn phức tạp thành từng bước hành động cụ thể trong 1 giây.',
      color: 'cyan',
      highlight: true
    },
    {
      icon: CheckSquare,
      title: 'Deadline & Kế Hoạch Khoa Học',
      description: 'Sắp xếp công việc theo mức độ ưu tiên (Khẩn cấp, Cao, Trung bình), thời lượng ước tính và trạng thái hoàn thành rõ ràng.',
      color: 'emerald'
    },
    {
      icon: StickyNote,
      title: 'Ghi Chú & Tóm Tắt Kiến Thức',
      description: 'Soạn thảo ghi chép học tập với hệ thống thẻ tag, phân loại theo môn học, ghim tài liệu quan trọng và tra cứu tức thì.',
      color: 'amber'
    },
    {
      icon: Target,
      title: 'Chỉ Tiêu & KPI Tự Học Định Lượng',
      description: 'Thiết lập các mục tiêu cụ thể như đọc tài liệu, giải bài tập LeetCode hay luyện nghe ngoại ngữ với thanh tiến độ trực quan.',
      color: 'purple'
    },
    {
      icon: Bot,
      title: 'Trợ Lý Đồng Hành Planora Assistant',
      description: 'Chat và giải đáp học tập thông minh, tóm tắt giáo trình, giải thích đoạn code khó hiểu và lập thời khóa biểu tối ưu.',
      color: 'blue'
    }
  ];

  const stats = [
    { label: 'Sinh viên & Lập trình viên', value: '12,500+' },
    { label: 'Bài tập hoàn thành đúng hạn', value: '98.6%' },
    { label: 'Nhiệm vụ AI tự động chia nhỏ', value: '45,000+' },
    { label: 'Thời gian tiết kiệm mỗi tuần', value: '6.5 Giờ' }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Minh Quân',
      role: 'Sinh viên Kỹ Thuật Phần Mềm - ĐHQG',
      text: 'Tính năng chia nhỏ đồ án của Planora bằng AI thực sự xuất sắc. Mình không còn cảm giác quá tải mỗi khi đối mặt với các bài tập lớn cuối kỳ.'
    },
    {
      name: 'Trần Thị Thu Hà',
      role: 'Học viên Chuyển ngành Data Science',
      text: 'Giao diện sáng sủa, sạch sẽ, không bị rối mắt. Mục tiêu học tập hàng ngày giúp mình duy trì việc tự học đều đặn mỗi tối.'
    },
    {
      name: 'Lê Hoàng Nam',
      role: 'Frontend Developer & Tự học',
      text: 'Hệ thống vừa có quản lý khoá học, vừa ghi chép Markdown và trợ lý AI trong cùng một nơi. Cực kỳ tiện lợi và tập trung.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION HEADER                                                 */}
      {/* ========================================================================= */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-neutral-950/85 border-neutral-800 text-white' : 'bg-white/85 border-slate-200 text-slate-900 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Official Logo */}
          <PlanoraLogo size="lg" />

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <a href="#features" className={`transition-colors ${isDark ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>
              Tính Năng
            </a>
            <a href="#ai-engine" className={`transition-colors ${isDark ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>
              Trợ Lý AI
            </a>
            <a href="#stats" className={`transition-colors ${isDark ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>
              Thống Kê
            </a>
            <a href="#reviews" className={`transition-colors ${isDark ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'}`}>
              Đánh Giá
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-amber-300 hover:bg-neutral-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* If user is already logged in, show direct entry to Dashboard */}
            {user ? (
              <button
                onClick={onEnterApp}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Vào Bảng Điều Khiển</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-800'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng Nhập</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng Ký Miễn Phí</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border bg-indigo-50/70 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Planora Platform 2026 • Quản Lý Kế Hoạch & Học Tập Kỷ Nguyên AI</span>
          </div>

          {/* Main Title */}
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Lập kế hoạch thông minh,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-500 to-blue-600">
              Chinh phục mọi môn học cùng AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8 ${
            isDark ? 'text-neutral-400' : 'text-slate-600'
          }`}>
            Không còn nỗi lo trễ hạn hay bài tập dồn ứ. Planora cung cấp giải pháp toàn diện từ theo dõi tiến độ môn học, chia nhỏ bài tập bằng Gemini AI đến đo lường KPI học tập mỗi ngày.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Bắt Đầu Ngay (Miễn Phí)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className={`px-6 py-3.5 rounded-2xl border font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800' 
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <LogIn className="w-4 h-4 text-indigo-500" />
              <span>Đăng Nhập Tài Khoản</span>
            </button>

            <button
              onClick={onEnterApp}
              className={`px-5 py-3.5 rounded-2xl border font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                isDark 
                  ? 'border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700' 
                  : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Xem Trực Tiếp Bảng Điều Khiển</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* MOCKUP PREVIEW CARD: GIAO DIỆN HỌC TẬP TRỰC QUAN PLANORA              */}
          {/* ===================================================================== */}
          <div className={`p-4 sm:p-6 rounded-3xl border shadow-2xl relative text-left transition-all ${
            isDark 
              ? 'bg-neutral-900/90 border-neutral-800 shadow-indigo-950/30' 
              : 'bg-white border-slate-200 shadow-indigo-100'
          }`}>
            {/* Window bar */}
            <div className={`flex items-center justify-between pb-4 mb-5 border-b text-xs ${
              isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-500'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono ml-2 text-[11px]">app.planora.edu.vn • Workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Hệ thống trực tuyến
                </span>
              </div>
            </div>

            {/* Mini Dashboard Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Courses */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Môn Học Đang Tiến Hành
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-semibold">
                    3 môn
                  </span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span>Lập trình Web nâng cao</span>
                      <span className="font-bold text-indigo-600">80%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full w-4/5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span>Cấu trúc dữ liệu & Giải thuật</span>
                      <span className="font-bold text-cyan-600">55%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full w-[55%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Task Breakdown preview */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    Chia Nhỏ Bài Tập AI
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 font-bold">
                    Gemini Flash
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                    <span className="font-medium text-[11px]">1. Thiết kế Schema MongoDB</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                    <span className="font-medium text-[11px]">2. Viết API xác thực JWT</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">Đang làm</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                    <span className="font-medium text-[11px]">3. Kiểm thử & Báo cáo lỗi</span>
                    <span className="text-[10px] text-slate-400">Chờ xử lý</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Goals */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-purple-500" />
                    Mục Tiêu Tuần Này
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-semibold">
                    Đạt 85%
                  </span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Luyện tập code (Giờ)</span>
                      <span className="font-bold">18 / 20h</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full w-[90%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Đọc tài liệu chuyên đề</span>
                      <span className="font-bold">4 / 5 bài</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[80%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. KHU VỰC TRUY CẬP NHANH ĐĂNG NHẬP & ĐĂNG KÝ (PHẢI DƯỚI GIỮA THEO YÊU CẦU) */}
      {/* ========================================================================= */}
      <section className="py-10 px-6 max-w-5xl mx-auto">
        <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all ${
          isDark 
            ? 'bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/50 border-neutral-800' 
            : 'bg-gradient-to-r from-indigo-50/90 via-white to-blue-50/80 border-slate-200 shadow-md'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Bắt Đầu Sử Dụng Ngay Trong 30 Giây</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Sẵn sàng nâng tầm phương pháp học tập của bạn?
              </h2>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                Trang đăng nhập và đăng ký chuyên biệt với giao diện nửa trái trang trí tinh tế đang chờ bạn.
              </p>
            </div>

            {/* Hai nút Đăng nhập & Đăng ký dưới giữa / phải */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                }`}
              >
                <LogIn className="w-4 h-4 text-indigo-500" />
                <span>Đăng Nhập Tài Khoản</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng Ký Thành Viên</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURES GRID                                                          */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            Tính Năng Nổi Bật
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mọi công cụ bạn cần để làm chủ việc tự học
          </h3>
          <p className={`text-xs sm:text-sm mt-3 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Planora được thiết kế chuyên biệt cho học sinh, sinh viên và lập trình viên cần tính kỷ luật và sự rõ ràng trong lộ trình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                  feat.highlight
                    ? isDark 
                      ? 'bg-neutral-900 border-indigo-500/50 shadow-lg shadow-indigo-950/30' 
                      : 'bg-white border-indigo-200 shadow-md shadow-indigo-50'
                    : isDark 
                      ? 'bg-neutral-900/60 border-neutral-800' 
                      : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm mb-2">{feat.title}</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. STATS COUNTER                                                         */}
      {/* ========================================================================= */}
      <section id="stats" className={`py-14 border-y ${
        isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-slate-100/60 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                {item.value}
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TESTIMONIALS SECTION                                                  */}
      {/* ========================================================================= */}
      <section id="reviews" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            Đánh Giá Học Viên
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Được tin dùng bởi hơn 12,000+ sinh viên
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((review, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border flex flex-col justify-between ${
                isDark ? 'bg-neutral-900/70 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <p className={`text-xs leading-relaxed italic mb-5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                "{review.text}"
              </p>
              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800">
                <div className="font-bold text-xs">{review.name}</div>
                <div className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {review.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className={`py-10 border-t ${
        isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <PlanoraLogo size="md" />

          <div className="text-xs">
            © 2026 Planora LMS • Nền tảng Quản Lý Kế Hoạch & Học Tập Cá Nhân.
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => onOpenAuth('login')}
              className="hover:underline cursor-pointer"
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="hover:underline cursor-pointer"
            >
              Đăng Ký
            </button>
            <button
              onClick={onEnterApp}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              Vào Workspace →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
