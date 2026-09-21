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
  Code2, 
  MessageSquareText, 
  CalendarDays, 
  Star,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { PlanoraLogo } from '../../components/common/PlanoraLogo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface LandingPageViewProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
  onEnterApp: () => void;
}

export function LandingPageView({ onOpenAuth, onEnterApp }: LandingPageViewProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Quản Lý Môn Học Chuyên Sâu',
      description: 'Lưu trữ thông tin môn học, mã lớp, giảng viên phụ trách, phân loại màu sắc và theo dõi tỷ lệ hoàn thành theo thời gian thực.',
      color: 'indigo'
    },
    {
      icon: Sparkles,
      title: 'Phân Tích & Chia Nhỏ Bài Tập AI',
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
    { label: 'Học viên & Lập trình viên', value: '12,500+' },
    { label: 'Bài tập hoàn thành đúng hạn', value: '98.6%' },
    { label: 'Nhiệm vụ AI tự động chia nhỏ', value: '45,000+' },
    { label: 'Thời gian tiết kiệm mỗi tuần', value: '6.5 Giờ' }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Minh Quân',
      role: 'Sinh viên Kỹ Thuật Phần Mềm - ĐHQG',
      rating: 5,
      text: 'Tính năng chia nhỏ đồ án của Planora bằng AI thực sự xuất sắc. Mình không còn cảm giác quá tải mỗi khi đối mặt với các bài tập lớn cuối kỳ.'
    },
    {
      name: 'Trần Thị Thu Hà',
      role: 'Học viên Chuyển ngành Data Science',
      rating: 5,
      text: 'Giao diện sáng sủa, sạch sẽ, không bị rối mắt. Mục tiêu học tập hàng ngày giúp mình duy trì việc tự học đều đặn mỗi tối.'
    },
    {
      name: 'Lê Hoàng Nam',
      role: 'Frontend Developer & Tự học',
      rating: 5,
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
        isDark ? 'bg-neutral-950/90 border-neutral-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900 shadow-2xs'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Official Logo */}
          <PlanoraLogo size="lg" />

          {/* Desktop Nav Items: Giãn khoảng cách rộng rãi (gap-10 sm:gap-12) & Bấm cuộn tới đúng section */}
          <nav className="hidden md:flex items-center gap-10 lg:gap-12 text-sm font-semibold">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className={`transition-colors cursor-pointer py-1 ${
                isDark ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Tính Năng
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('ai-assistant')}
              className={`transition-colors cursor-pointer py-1 ${
                isDark ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Trợ Lý AI
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('stats')}
              className={`transition-colors cursor-pointer py-1 ${
                isDark ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Thống Kê
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('reviews')}
              className={`transition-colors cursor-pointer py-1 ${
                isDark ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Đánh Giá
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
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
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Vào Không Gian Học Tập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng Ký</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border ${
            isDark ? 'bg-indigo-950/50 border-indigo-800/80 text-indigo-300' : 'bg-indigo-50/80 border-indigo-200 text-indigo-700'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Planora Platform • Quản Lý Kế Hoạch & Học Tập Kỷ Nguyên AI</span>
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
            isDark ? 'text-neutral-300' : 'text-slate-600'
          }`}>
            Không còn nỗi lo trễ hạn hay bài tập dồn ứ. Planora cung cấp giải pháp toàn diện từ theo dõi tiến độ môn học, chia nhỏ bài tập bằng Gemini AI đến đo lường KPI học tập mỗi ngày.
          </p>

          {/* CTA Buttons: Đã bỏ chữ "miễn phí", chỉ để "Bắt Đầu Ngay" */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm sm:text-base transition-all flex items-center gap-2.5 cursor-pointer shadow-xs"
            >
              <span>Bắt Đầu Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className={`px-8 py-3.5 rounded-xl border font-bold text-sm sm:text-base transition-all flex items-center gap-2.5 cursor-pointer ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800' 
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <LogIn className="w-4 h-4 text-indigo-500" />
              <span>Đăng Nhập Tài Khoản</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* MOCKUP PREVIEW CARD: GIAO DIỆN HỌC TẬP TRỰC QUAN PLANORA              */}
          {/* ===================================================================== */}
          <div className={`p-4 sm:p-6 rounded-2xl border text-left transition-all ${
            isDark 
              ? 'bg-neutral-900 border-neutral-800' 
              : 'bg-white border-slate-200 shadow-xs'
          }`}>
            {/* Window bar: Bỏ đường dẫn website app.planora.edu.vn */}
            <div className={`flex items-center justify-between pb-4 mb-5 border-b text-xs ${
              isDark ? 'border-neutral-800 text-neutral-400' : 'border-slate-200 text-slate-500'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                <span className={`font-semibold ml-2 text-xs ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  Không Gian Học Tập Planora
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Hệ thống trực tuyến
                </span>
              </div>
            </div>

            {/* Mini Dashboard Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Courses */}
              <div className={`p-4 rounded-2xl border transition-colors ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Môn Học Đang Tiến Hành
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    3 môn
                  </span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span className={isDark ? 'text-neutral-300' : 'text-slate-700'}>Lập trình Web nâng cao</span>
                      <span className="font-bold text-indigo-500">80%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                      <div className="h-full bg-indigo-600 rounded-full w-4/5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span className={isDark ? 'text-neutral-300' : 'text-slate-700'}>Cấu trúc dữ liệu & Giải thuật</span>
                      <span className="font-bold text-cyan-500">55%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                      <div className="h-full bg-cyan-500 rounded-full w-[55%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Task Breakdown preview - ĐÃ SỬA TOÀN BỘ ĐỊNH DẠNG BAN ĐÊM, KHÔNG CÒN LỖI CHỮ TRẮNG NỀN TRẮNG */}
              <div className={`p-4 rounded-2xl border transition-colors ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    Chia Nhỏ Bài Tập AI
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  }`}>
                    Gemini Flash
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                  }`}>
                    <span className={`font-medium text-xs ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
                      1. Thiết kế Schema MongoDB
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                  }`}>
                    <span className={`font-medium text-xs ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
                      2. Viết API xác thực JWT
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      Đang làm
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                  }`}>
                    <span className={`font-medium text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      3. Kiểm thử & Báo cáo lỗi
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      Chờ xử lý
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Goals */}
              <div className={`p-4 rounded-2xl border transition-colors ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
                    <Target className="w-3.5 h-3.5 text-purple-500" />
                    Mục Tiêu Tuần Này
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                  }`}>
                    Đạt 85%
                  </span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className={isDark ? 'text-neutral-300' : 'text-slate-700'}>Luyện tập code (Giờ)</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>18 / 20h</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                      <div className="h-full bg-purple-600 rounded-full w-[90%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className={isDark ? 'text-neutral-300' : 'text-slate-700'}>Đọc tài liệu chuyên đề</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>4 / 5 bài</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
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
      {/* 3. SECTION 1: TÍNH NĂNG (FEATURES)                                       */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Bộ Công Cụ Toàn Diện</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Mọi công cụ bạn cần để làm chủ việc tự học
          </h2>
          <p className={`text-sm sm:text-base mt-3 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Planora được thiết kế chuyên biệt cho học sinh, sinh viên và lập trình viên cần tính kỷ luật và sự rõ ràng trong lộ trình phát triển bản thân.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all ${
                  feat.highlight
                    ? isDark 
                      ? 'bg-neutral-900 border-indigo-500/40 shadow-xs' 
                      : 'bg-white border-indigo-300 shadow-xs'
                    : isDark 
                      ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700' 
                      : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className={`font-bold text-base mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{feat.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 2: TRỢ LÝ AI (AI ASSISTANT ENGINE - CHUYÊN BIỆT THEO YÊU CẦU)   */}
      {/* ========================================================================= */}
      <section id="ai-assistant" className={`py-20 px-6 scroll-mt-24 border-y transition-colors ${
        isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-indigo-50/40 border-indigo-100'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Trợ Lý Gemini AI Đồng Hành</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Trợ lý AI thông minh giải quyết bài tập & lập trình 24/7
            </h2>
            <p className={`text-sm sm:text-base mt-3 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              Được tinh chỉnh cho mục tiêu giáo dục, Planora AI không chỉ trả lời mà còn hướng dẫn bạn tư duy từng bước để thấu hiểu bản chất vấn đề.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* AI Feature 1: Subtask Generator */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Tự động chia nhỏ bài tập lớn
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Chỉ cần nhập tên đồ án (ví dụ: "Xây dựng website bán hàng"), Gemini AI sẽ tự động phân rã thành 3-5 nhiệm vụ cụ thể 30 phút có thể bắt tay làm ngay.
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="font-semibold text-cyan-500 text-[11px] uppercase tracking-wider">Ví dụ phân rã:</div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span>Bước 1: Thiết kế Wireframe trên Figma</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span>Bước 2: Cấu hình Redux Toolkit & Store</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span>Bước 3: Tích hợp Payment Gateway</span>
                </div>
              </div>
            </div>

            {/* AI Feature 2: Code Explainer & Debugger */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Giải thích thuật toán & gỡ lỗi
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Dán đoạn code báo lỗi hoặc bài tập thuật toán phức tạp để nhận phân tích chi tiết nguyên nhân, giải pháp tối ưu và độ phức tạp Big-O.
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="font-semibold text-indigo-500 text-[11px] uppercase tracking-wider">Hỗ trợ đa ngôn ngữ:</div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                  <span className={`p-1.5 rounded-lg ${isDark ? 'bg-neutral-900' : 'bg-white border border-slate-200'}`}>TypeScript</span>
                  <span className={`p-1.5 rounded-lg ${isDark ? 'bg-neutral-900' : 'bg-white border border-slate-200'}`}>Python</span>
                  <span className={`p-1.5 rounded-lg ${isDark ? 'bg-neutral-900' : 'bg-white border border-slate-200'}`}>Java / C++</span>
                </div>
              </div>
            </div>

            {/* AI Feature 3: Schedule Optimizer */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
              isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-5">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Lập kế hoạch & tư vấn lộ trình
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Hỏi đáp trực tiếp bằng ngôn ngữ tự nhiên: yêu cầu AI sắp xếp thời gian biểu tuần, lập kế hoạch ôn thi môn Giải tích hoặc chuẩn bị đồ án tốt nghiệp.
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="font-semibold text-purple-500 text-[11px] uppercase tracking-wider">Tương tác Socratic:</div>
                <div className="flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="italic">"Nên học React hay Next.js trước cho người mới?"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION 3: THỐNG KÊ (STATS)                                           */}
      {/* ========================================================================= */}
      <section id="stats" className={`py-20 border-b scroll-mt-24 transition-colors ${
        isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              Chỉ Số Đáng Tin Cậy
            </h2>
            <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Đồng hành cùng hàng ngàn học viên mỗi ngày
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((item, idx) => (
              <div key={idx} className={`p-6 rounded-2xl border transition-all ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-500 to-blue-600 mb-2">
                  {item.value}
                </div>
                <div className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION 4: ĐÁNH GIÁ (REVIEWS)                                         */}
      {/* ========================================================================= */}
      <section id="reviews" className="py-20 px-6 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 mb-3">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Phản Hồi Từ Người Dùng</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Được tin dùng bởi hơn 12,000+ sinh viên & lập trình viên
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((review, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className={`text-sm leading-relaxed italic mb-6 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  "{review.text}"
                </p>
              </div>
              <div className={`pt-4 border-t ${isDark ? 'border-neutral-800' : 'border-slate-100'}`}>
                <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {review.name}
                </div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {review.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
