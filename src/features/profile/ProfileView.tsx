import { useState, useRef, ChangeEvent } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  GraduationCap, 
  Calendar, 
  Phone, 
  School, 
  Save, 
  CheckCircle2, 
  BookOpen, 
  CheckSquare, 
  Target,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Settings as SettingsIcon,
  HardDrive,
  Cloud,
  Check,
  UploadCloud,
  ExternalLink,
  ChevronRight,
  Globe,
  Github,
  Linkedin,
  RefreshCw,
  Trash2,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveTab } from '../../types';
import { fileToDataUrl } from '../../utils/fileUpload';

// Curated preset cover wallpapers
const COVER_PRESETS = [
  {
    id: 'cyber-indigo',
    name: 'Cyber Indigo',
    style: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #06b6d4 100%)'
  },
  {
    id: 'midnight-space',
    name: 'Midnight Slate',
    style: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)'
  },
  {
    id: 'emerald-campus',
    name: 'Emerald Academic',
    style: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)'
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Sunrise',
    style: 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #f59e0b 100%)'
  },
  {
    id: 'tech-purple',
    name: 'Violet Tech',
    style: 'linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #ec4899 100%)'
  }
];

// Curated stylized avatar presets
const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=PlanoraDev&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Sam&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberStudent&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/notionists/svg?seed=MinhNguyen&backgroundColor=ffdfbf'
];

interface ProfileViewProps {
  onNavigate?: (tab: ActiveTab) => void;
  coursesCount?: number;
  completedTasksCount?: number;
  goalsCount?: number;
  notesCount?: number;
}

export function ProfileView({
  onNavigate,
  coursesCount = 4,
  completedTasksCount = 8,
  goalsCount = 3,
  notesCount = 6
}: ProfileViewProps) {
  const { user, isAdmin, updateUser } = useAuth();
  const { isDark } = useTheme();
  const { language, t } = useLanguage();

  // Basic info states
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '0987 654 321');
  const [studentCode, setStudentCode] = useState(user?.studentCode || 'IT-2026-8899');
  const [faculty, setFaculty] = useState(user?.faculty || 'Công Nghệ Thông Tin & Khoa Học Máy Tính');
  const [schoolName, setSchoolName] = useState(user?.schoolName || 'Đại Học Quốc Gia TP.HCM (VNU)');
  const [bio, setBio] = useState(
    user?.bio || 'Học viên đam mê phát triển phần mềm Full-Stack, trí tuệ nhân tạo và phương pháp tự học khoa học.'
  );

  // Avatar and Cover States
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [coverImage, setCoverImage] = useState(user?.coverImage || COVER_PRESETS[0].style);
  const [github, setGithub] = useState(user?.socialLinks?.github || 'https://github.com/planora-student');
  const [website, setWebsite] = useState(user?.socialLinks?.website || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [showCoverPresets, setShowCoverPresets] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Handle custom avatar upload
  const handleAvatarFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const dataUrl = await fileToDataUrl(file, 800);
      setAvatar(dataUrl);
      updateUser({ avatar: dataUrl });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // Fallback
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Handle custom cover image upload
  const handleCoverFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const dataUrl = await fileToDataUrl(file, 1920);
      setCoverImage(dataUrl);
      updateUser({ coverImage: dataUrl });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // Fallback
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const getCoverStyle = () => {
    const current = coverImage || COVER_PRESETS[0].style;
    if (current.startsWith('data:') || current.startsWith('http') || current.startsWith('/')) {
      return {
        backgroundImage: `url("${current}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (current.startsWith('url(')) {
      return {
        backgroundImage: current,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {
      background: current
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      phone,
      studentCode,
      faculty,
      schoolName,
      bio,
      avatar,
      coverImage,
      socialLinks: {
        github,
        website
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverFileChange}
        className="hidden"
      />

      {/* Profile Banner & Floating Avatar Card */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
      }`}>
        {/* Customizable Cover Wallpaper */}
        <div 
          className="h-44 sm:h-56 w-full relative transition-all duration-300 rounded-t-3xl overflow-hidden"
          style={getCoverStyle()}
        >
          {/* Subtle gradient for controls readability without darkening the wallpaper */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10 pointer-events-none" />

          {/* Cover Controls (Top Right) */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCoverPresets(!showCoverPresets)}
                className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mẫu Nền</span>
              </button>

              {showCoverPresets && (
                <div className={`absolute right-0 mt-2 w-56 p-2 rounded-2xl border shadow-xl z-30 ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <p className="text-[11px] font-bold px-2 py-1 text-slate-400">Chọn bảng màu nền:</p>
                  <div className="space-y-1 mt-1">
                    {COVER_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setCoverImage(preset.style);
                          updateUser({ coverImage: preset.style });
                          setShowCoverPresets(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
                          coverImage === preset.style ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''
                        }`}
                      >
                        <span 
                          className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                          style={{ background: preset.style }}
                        />
                        <span className="truncate">{preset.name}</span>
                        {coverImage === preset.style && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isUploadingCover}
              onClick={() => coverInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-sm transition-all cursor-pointer"
            >
              {isUploadingCover ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>Tải ảnh nền</span>
            </button>
          </div>
        </div>

        {/* Floating Avatar & User Bio Header */}
        <div className="px-5 sm:px-8 pb-6 pt-0 relative">
          {/* Row 1: Floating Avatar on left and Action Buttons on right */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-18">
            {/* Avatar Section */}
            <div className="relative group shrink-0">
              <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-4 shadow-xl overflow-hidden flex items-center justify-center font-extrabold text-3xl relative z-10 transition-transform ${
                isDark ? 'border-neutral-900 bg-neutral-950 text-white' : 'border-white bg-slate-100 text-indigo-600'
              }`}>
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    isAdmin 
                      ? 'bg-rose-500/20 text-rose-500' 
                      : 'bg-indigo-500/20 text-indigo-600'
                  }`}>
                    {isAdmin ? <Shield className="w-14 h-14" /> : <GraduationCap className="w-14 h-14" />}
                  </div>
                )}

                {/* Hover Overlay Button to change avatar */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Bấm để tải ảnh đại diện từ máy tính"
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Đổi avatar</span>
                </button>
              </div>

              {/* Quick Avatar Change Camera Button */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                title="Tải ảnh mới từ thiết bị"
                className="absolute bottom-1 right-1 z-20 p-2 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer border-2 border-white dark:border-neutral-900"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Action Buttons (Avatar Presets & Settings Link) - placed on card surface */}
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end pb-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Avatar Mẫu</span>
                </button>

                {showAvatarPresets && (
                  <div className={`absolute right-0 sm:right-auto sm:left-0 mt-2 w-64 p-3 rounded-2xl border shadow-xl z-30 ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <p className="text-xs font-bold mb-2">Chọn avatar có sẵn:</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {AVATAR_PRESETS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatar(url);
                            updateUser({ avatar: url });
                            setShowAvatarPresets(false);
                          }}
                          className="w-11 h-11 rounded-xl border overflow-hidden shrink-0 hover:scale-105 transition-transform cursor-pointer border-slate-200 dark:border-neutral-700 hover:border-indigo-500"
                        >
                          <img src={url} alt={`Preset ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Open Settings Button */}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('settings')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Mở Cài Đặt</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: User Identity & Badges (Cleanly separated, strictly inside the card!) */}
          <div className="mt-4 text-center sm:text-left space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-snug">
                {name || 'Người dùng Planora'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                isAdmin 
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400' 
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
              }`}>
                {isAdmin ? 'Quản Trị Viên' : 'Học Viên'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 font-medium flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span>{email}</span>
              {studentCode && (
                <>
                  <span>•</span>
                  <span>MSSV: <strong className="font-bold text-slate-800 dark:text-neutral-200">{studentCode}</strong></span>
                </>
              )}
            </p>

            {(faculty || schoolName) && (
              <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                {faculty} {schoolName ? `(${schoolName})` : ''}
              </p>
            )}
          </div>

          {/* Row 3: Learning Statistics Bar */}
          <div className={`mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border ${
            isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {coursesCount}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">Môn học tham gia</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {completedTasksCount}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">Nhiệm vụ hoàn thành</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {goalsCount}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">Mục tiêu học tập</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {notesCount}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">Ghi chú & Tệp lưu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form and Settings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detailed Form */}
        <form onSubmit={handleSave} className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border space-y-6 transition-colors ${
          isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b dark:border-neutral-800 border-slate-200">
            <div>
              <h2 className="text-base font-bold">Chỉnh Sửa Thông Tin Hồ Sơ</h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Thông tin này sẽ hiển thị trên bảng điểm, bài tập và phân quyền tài khoản.
              </p>
            </div>

            {savedSuccess && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã lưu thành công!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                Họ và tên
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                Địa chỉ Email (Cố định tài khoản)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border opacity-75 cursor-not-allowed ${
                    isDark ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                Mã Học Viên / Sinh Viên (MSSV)
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={studentCode}
                  onChange={e => setStudentCode(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                Số điện thoại liên hệ
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                Trường / Viện Đào Tạo
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                placeholder="VD: Đại Học Bách Khoa, Đại học Khoa học Tự nhiên..."
                className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                Khoa / Chuyên Ngành
              </label>
              <input
                type="text"
                value={faculty}
                onChange={e => setFaculty(e.target.value)}
                placeholder="VD: Kỹ Thuật Phần Mềm, Khoa Học Dữ Liệu..."
                className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                GitHub & Portfolio Link
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={github}
                    onChange={e => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://mywebsite.dev"
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                Tiểu sử & Định hướng học tập
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Giới thiệu đôi nét về bản thân và mục tiêu học tập..."
                className={`w-full p-3.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                  isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-sm shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thay Đổi Hồ Sơ</span>
            </button>
          </div>
        </form>

        {/* Right 1 Col: Settings Hub & Storage Evaluation */}
        <div className="space-y-6">
          {/* Cài đặt hệ thống Navigation Card */}
          <div className={`p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Cài Đặt Hệ Thống</h3>
                <p className="text-[11px] text-slate-400">Quản lý giao diện, sao lưu & ngôn ngữ</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-4">
              Bạn có thể tùy biến giao diện Sáng/Tối, ngôn ngữ hiển thị (VI/EN), thời gian tự động đồng bộ và xuất dữ liệu JSON tại trang Cài Đặt.
            </p>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800 text-white'
                    : 'bg-indigo-50/70 border-indigo-100 hover:bg-indigo-100 text-indigo-700'
                }`}
              >
                <span>Mở Toàn Bộ Cài Đặt</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cloud Storage & AWS Evaluation Card */}
          <div className={`p-6 rounded-3xl border transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Đánh Giá Lưu Trữ & Tải File</h3>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  Planora Unified Storage
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-neutral-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200/80 dark:border-neutral-800">
                <p className="font-bold text-slate-800 dark:text-neutral-100 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Chế độ tích hợp sẵn (Hiện tại)</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Tải lên ảnh, tài liệu PDF, Slide, file bài tập trực tiếp tức thì. Không cần thẻ tín dụng, không phụ thuộc API key ngoài, chạy an toàn cả khi ngoại tuyến.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200/80 dark:border-neutral-800">
                <p className="font-bold text-slate-800 dark:text-neutral-100 flex items-center gap-1.5 mb-1">
                  <Cloud className="w-3.5 h-3.5 text-sky-500" />
                  <span>Về phương thức AWS S3:</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  AWS S3 là chuẩn doanh nghiệp cho hàng triệu file lớn. Nhưng với LMS học tập, AWS yêu cầu cấu hình tài khoản AWS IAM, Bucket CORS và tính phí thẻ quốc tế. Planora đã thiết kế sẵn kiến trúc để bạn chỉ cần thêm AWS Key vào môi trường là tự kích hoạt mà không làm gián đoạn hệ thống.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
