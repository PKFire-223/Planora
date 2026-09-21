import { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PlanoraLogo } from '../../components/common/PlanoraLogo';

export function ProfileView() {
  const { user, isAdmin, updateUser } = useAuth();
  const { isDark } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '0987 654 321');
  const [studentCode, setStudentCode] = useState(user?.studentCode || 'IT-2026-8899');
  const [faculty, setFaculty] = useState(user?.faculty || 'Công Nghệ Thông Tin & Khoa Học Máy Tính');
  const [bio, setBio] = useState(
    user?.bio || 'Học viên đam mê phát triển phần mềm Full-Stack, trí tuệ nhân tạo và phương pháp tự học khoa học.'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      phone,
      studentCode,
      faculty,
      bio
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border relative overflow-hidden transition-colors ${
        isDark 
          ? 'bg-neutral-900 border-neutral-800 text-white' 
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar Icon / Logo */}
          <div className="relative group">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md border ${
              isAdmin
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600'
            }`}>
              {isAdmin ? <Shield className="w-10 h-10" /> : <GraduationCap className="w-10 h-10" />}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-neutral-900"></span>
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{name || 'Người dùng'}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isAdmin 
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
              }`}>
                {isAdmin ? 'Quản Trị Viên Hệ Thống' : 'Học Viên Chính Thức'}
              </span>
            </div>

            <p className={`text-xs sm:text-sm ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              {email} • Tham gia từ {user?.createdAt || 'Tháng 9/2026'}
            </p>

            <p className={`text-xs leading-relaxed max-w-xl pt-1 ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
              {bio}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className={`p-6 sm:p-8 rounded-2xl border space-y-6 transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b dark:border-neutral-800 border-slate-200">
          <div>
            <h2 className="text-base font-bold">Thông Tin Chi Tiết Hồ Sơ</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Cập nhật thông tin nhận diện tài khoản trên nền tảng Planora.
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
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
              Địa chỉ Email (Cố định)
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
              Mã Học Viên / Sinh Viên
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
              Số điện thoại
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

          <div className="sm:col-span-2">
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
              Chuyên ngành / Khoa đào tạo
            </label>
            <input
              type="text"
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
              className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
              Tiểu sử & Mục tiêu cá nhân
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
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
    </div>
  );
}
