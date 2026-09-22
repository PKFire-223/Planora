import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  ShieldCheck,
  Database, 
  Cpu, 
  CheckCircle2, 
  Key, 
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
  Languages,
  Globe,
  Sliders,
  FileText,
  Lock,
  Download,
  Trash2,
  Volume2,
  Clock,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  Laptop,
  CheckCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { Course, Task, Goal, Note } from '../../types';

interface SettingsViewProps {
  lastAutoSaveTime?: string | null;
  isAutoSaving?: boolean;
  onTriggerManualSave?: () => void;
  courses?: Course[];
  tasks?: Task[];
  goals?: Goal[];
  notes?: Note[];
}

type SettingsTab = 
  | 'language' 
  | 'privacy' 
  | 'appearance' 
  | 'security' 
  | 'notifications' 
  | 'ai' 
  | 'data' 
  | 'about';

export function SettingsView({
  lastAutoSaveTime,
  isAutoSaving,
  onTriggerManualSave,
  courses = [],
  tasks = [],
  goals = [],
  notes = []
}: SettingsViewProps = {}) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { 
    language, 
    setLanguage, 
    t, 
    timeFormat, 
    setTimeFormat, 
    firstDayOfWeek, 
    setFirstDayOfWeek 
  } = useLanguage();

  // Active sub-tab in settings
  const [activeTab, setActiveTab] = useState<SettingsTab>('language');
  
  // Privacy policy modal visibility
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Notification toggles
  const [notifyDeadline, setNotifyDeadline] = useState(true);
  const [notifyAiTips, setNotifyAiTips] = useState(true);
  const [notifyCourseUpdates, setNotifyCourseUpdates] = useState(false);
  const [notifySound, setNotifySound] = useState(true);
  const [quietHours, setQuietHours] = useState(false);

  // Appearance preferences
  const [compactDensity, setCompactDensity] = useState(() => {
    try {
      return localStorage.getItem('planora_compact_density') === 'true';
    } catch {
      return false;
    }
  });
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('planora_animations') !== 'false';
    } catch {
      return true;
    }
  });
  const [accentColor, setAccentColor] = useState<'indigo' | 'cyan' | 'emerald' | 'purple'>('indigo');

  // AI & Study settings
  const [aiModel, setAiModel] = useState<'flash' | 'pro'>('flash');
  const [aiBreakdownDepth, setAiBreakdownDepth] = useState<'standard' | 'detailed'>('detailed');
  const [aiTone, setAiTone] = useState<'academic' | 'concise' | 'friendly'>('concise');
  const [aiAutoSuggest, setAiAutoSuggest] = useState(true);
  const [defaultTaskMinutes, setDefaultTaskMinutes] = useState(45);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2FA Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState<string | null>(null);
  const [sessionMsg, setSessionMsg] = useState<string | null>(null);

  // Privacy controls state
  const [allowAiContext, setAllowAiContext] = useState(true);
  const [allowOfflineCache, setAllowOfflineCache] = useState(true);
  const [allowCrashReports, setAllowCrashReports] = useState(true);

  // Action status feedbacks
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const showTemporaryFeedback = (type: 'success' | 'info', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Play a soft test chime with Web Audio API (no external file needed)
  const handleTestSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
      showTemporaryFeedback('info', language === 'vi' ? 'Đã phát chuông thử nghiệm!' : 'Alert chime tested!');
    } catch {
      // AudioContext not supported
    }
  };

  // Export personal data
  const handleExportData = () => {
    try {
      const exportPayload = {
        exportVersion: '1.2.0',
        exportedAt: new Date().toISOString(),
        user: {
          name: user?.name,
          email: user?.email,
          role: user?.role,
          studentCode: user?.studentCode
        },
        counts: {
          courses: courses.length,
          tasks: tasks.length,
          goals: goals.length,
          notes: notes.length
        },
        data: {
          courses,
          tasks,
          goals,
          notes
        },
        preferences: {
          language,
          timeFormat,
          firstDayOfWeek,
          isDark
        }
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `planora-archive-${user?.name ? user.name.toLowerCase().replace(/\s+/g, '-') : 'student'}-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showTemporaryFeedback('success', language === 'vi' ? 'Đã tải về tệp lưu trữ dữ liệu cá nhân!' : 'Personal archive JSON downloaded successfully!');
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  // Clear local storage and cache
  const handleClearCache = () => {
    const confirmText = t('settings.privacy.clear_confirm');
    if (window.confirm(confirmText)) {
      try {
        localStorage.removeItem('planora_notifications');
        localStorage.removeItem('planora_backup_time');
        localStorage.removeItem('planora_compact_density');
        localStorage.removeItem('planora_animations');
        showTemporaryFeedback('info', language === 'vi' ? 'Đã dọn sạch bộ nhớ tạm!' : 'Local cache cleaned!');
      } catch (e) {
        console.warn('Clear storage error', e);
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: t('settings.security.pw_min_length') });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: t('settings.security.pw_mismatch') });
      return;
    }
    setPasswordMsg({ type: 'success', text: t('settings.security.pw_success') });
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => setPasswordMsg(null), 3500);
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      setTwoFactorEnabled(true);
      setTwoFactorMsg(t('settings.security.two_factor_enabled_msg'));
    } else {
      setTwoFactorEnabled(false);
      setTwoFactorMsg(t('settings.security.two_factor_disabled_msg'));
    }
    setTimeout(() => setTwoFactorMsg(null), 3500);
  };

  const handleTerminateOtherSessions = () => {
    setSessionMsg(t('settings.security.terminate_msg'));
    setTimeout(() => setSessionMsg(null), 3500);
  };

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const pwStrength = getPasswordStrength(newPassword);

  const tabs: { id: SettingsTab; label: string; icon: any; badge?: string }[] = [
    { id: 'language', label: t('settings.tab.language'), icon: Languages, badge: language.toUpperCase() },
    { id: 'privacy', label: t('settings.tab.privacy'), icon: ShieldCheck },
    { id: 'appearance', label: t('settings.tab.appearance'), icon: Sun },
    { id: 'security', label: t('settings.tab.security'), icon: Lock },
    { id: 'notifications', label: t('settings.tab.notifications'), icon: Bell },
    { id: 'ai', label: t('settings.tab.ai'), icon: Cpu },
    { id: 'data', label: t('settings.tab.data'), icon: Database },
    { id: 'about', label: t('settings.tab.about'), icon: Info }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('settings.title')}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                  v1.2.0
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {t('settings.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick status badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border ${
              isDark ? 'bg-neutral-800/80 border-neutral-700 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'en' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}</span>
            </div>

            <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border ${
              isDark ? 'bg-neutral-800/80 border-neutral-700 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>TLS 1.3 Active</span>
            </div>
          </div>
        </div>

        {/* Global Feedback notification */}
        {feedbackMsg && (
          <div className={`mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
          }`}>
            <CheckCheck className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* 2. Categorized Tab Navigation */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-1 overflow-x-auto scrollbar-none transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: LANGUAGE & REGION */}
      {activeTab === 'language' && (
        <div className="space-y-5">
          <div className={`p-6 rounded-2xl border space-y-5 transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-neutral-800 border-slate-200">
              <div className="flex items-center gap-2.5">
                <Languages className="w-5 h-5 text-indigo-500" />
                <div>
                  <h2 className="text-base font-bold">{t('settings.lang.title')}</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.lang.desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Language Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: English */}
              <div 
                onClick={() => setLanguage('en')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  language === 'en'
                    ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                    : isDark 
                      ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl" role="img" aria-label="UK flag">🇬🇧</span>
                      <div>
                        <div className="font-bold text-sm">{t('settings.lang.en_name')}</div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 mt-0.5">
                          {t('settings.lang.default_badge')}
                        </span>
                      </div>
                    </div>
                    {language === 'en' && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    {t('settings.lang.en_desc')}
                  </p>
                </div>
              </div>

              {/* Option B: Vietnamese */}
              <div 
                onClick={() => setLanguage('vi')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  language === 'vi'
                    ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                    : isDark 
                      ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl" role="img" aria-label="Vietnam flag">🇻🇳</span>
                      <div>
                        <div className="font-bold text-sm">{t('settings.lang.vi_name')}</div>
                        <span className="inline-block text-[10px] font-semibold text-indigo-500 mt-0.5">
                          Tiếng Việt chuẩn
                        </span>
                      </div>
                    </div>
                    {language === 'vi' && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    {t('settings.lang.vi_desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Time & Calendar Regional Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-950/40 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <label className="block text-xs font-bold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>{t('settings.lang.time_format')}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeFormat('24')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                      timeFormat === '24'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    24:00 (14:30)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat('12')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                      timeFormat === '12'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    12h AM/PM (02:30 PM)
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-950/40 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <label className="block text-xs font-bold mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>{t('settings.lang.first_day')}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFirstDayOfWeek('mon')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                      firstDayOfWeek === 'mon'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    {t('settings.lang.monday')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFirstDayOfWeek('sun')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                      firstDayOfWeek === 'sun'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    {t('settings.lang.sunday')}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
              isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-indigo-50/50 border-indigo-100'
            }`}>
              <div>
                <span className="font-bold text-indigo-500 block mb-0.5">{t('settings.lang.preview_heading')}</span>
                <span className={isDark ? 'text-neutral-400' : 'text-slate-600'}>
                  {t('settings.lang.preview_note')}
                </span>
              </div>
              <div className="font-mono font-bold px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                {timeFormat === '24' ? '14:30:00 • 22/09/2026' : '02:30:00 PM • Sep 22, 2026'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRIVACY POLICY & DATA RIGHTS */}
      {activeTab === 'privacy' && (
        <div className="space-y-5">
          <div className={`p-6 rounded-2xl border space-y-5 transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b dark:border-neutral-800 border-slate-200 gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className="text-base font-bold">{t('settings.privacy.title')}</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.privacy.desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Xem Toàn Bộ Chính Sách' : 'Read Full Privacy Policy'}</span>
                </button>
              </div>
            </div>

            {/* Core privacy guarantee cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs">{t('settings.privacy.p1_title')}</div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  {t('settings.privacy.p1_text')}
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs">{t('settings.privacy.p3_title')}</div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  {t('settings.privacy.p3_text')}
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs">{t('settings.privacy.p4_title')}</div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  {t('settings.privacy.p4_text')}
                </p>
              </div>
            </div>

            {/* Interactive Data Control Actions */}
            <div className={`p-4 rounded-xl border space-y-4 ${
              isDark ? 'bg-neutral-950/40 border-neutral-800' : 'bg-slate-50/80 border-slate-200'
            }`}>
              <div className="font-bold text-xs sm:text-sm text-indigo-500">
                {language === 'vi' ? 'Quyền Kiểm Soát Dữ Liệu Của Học Viên (Data Rights)' : 'Student Data Governance & Portability'}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b dark:border-neutral-800 border-slate-200">
                <div>
                  <div className="font-semibold text-xs sm:text-sm">{t('settings.privacy.export_title')}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.privacy.export_desc')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('settings.privacy.export_btn')}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
                <div>
                  <div className="font-semibold text-xs sm:text-sm">{t('settings.privacy.clear_cache_title')}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.privacy.clear_cache_desc')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                    isDark ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-rose-400' : 'bg-white border-slate-200 hover:bg-slate-100 text-rose-600'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('settings.privacy.clear_cache_btn')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APPEARANCE & DISPLAY */}
      {activeTab === 'appearance' && (
        <div className="space-y-5">
          <div className={`p-6 rounded-2xl border space-y-5 transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-2.5 pb-3 border-b dark:border-neutral-800 border-slate-200">
              <Sun className="w-5 h-5 text-indigo-500" />
              <div>
                <h2 className="text-base font-bold">{t('settings.appearance.title')}</h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {t('settings.appearance.desc')}
                </p>
              </div>
            </div>

            {/* Dark / Light Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div>
                <div className="font-semibold text-xs sm:text-sm">{t('settings.appearance.theme_mode')}</div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {t('settings.appearance.current_mode')} {isDark ? t('settings.appearance.dark') : t('settings.appearance.light')}
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-neutral-800 border-neutral-700 text-amber-300 hover:bg-neutral-700' 
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{t('settings.appearance.toggle_theme')} {isDark ? t('settings.appearance.light') : t('settings.appearance.dark')}</span>
              </button>
            </div>

            <div className="border-t dark:border-neutral-800 border-slate-200 pt-4 space-y-4">
              {/* Compact Density View */}
              <label className="flex items-center justify-between cursor-pointer py-1.5">
                <div>
                  <div className="font-semibold text-xs sm:text-sm">{t('settings.appearance.compact_mode')}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.appearance.compact_desc')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={compactDensity}
                  onChange={e => {
                    setCompactDensity(e.target.checked);
                    localStorage.setItem('planora_compact_density', String(e.target.checked));
                    showTemporaryFeedback('success', language === 'vi' ? 'Đã lưu tùy chọn mật độ giao diện!' : 'Display density saved!');
                  }}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {/* Interface Animations */}
              <label className="flex items-center justify-between cursor-pointer py-1.5">
                <div>
                  <div className="font-semibold text-xs sm:text-sm">{t('settings.appearance.animations')}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.appearance.animations_desc')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={animationsEnabled}
                  onChange={e => {
                    setAnimationsEnabled(e.target.checked);
                    localStorage.setItem('planora_animations', String(e.target.checked));
                    showTemporaryFeedback('success', language === 'vi' ? 'Đã cập nhật hiệu ứng chuyển động!' : 'Motion preference updated!');
                  }}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & AUTH */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          {/* Password Change Form */}
          <form onSubmit={handlePasswordSubmit} className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-neutral-800 border-slate-200">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-bold">{t('settings.security.change_pw')}</h2>
              </div>
              {passwordMsg && (
                <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}>
                  {passwordMsg.text}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                  {t('settings.security.current_pw')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 pr-9 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                  {t('settings.security.new_pw')}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                {newPassword && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 ${pwStrength >= 1 ? 'bg-rose-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${pwStrength >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${pwStrength >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {pwStrength < 2 ? 'Weak' : pwStrength < 4 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                  {t('settings.security.confirm_pw')}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-colors"
              >
                {t('settings.security.update_pw_btn')}
              </button>
            </div>
          </form>

          {/* 2FA Protection Card */}
          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b dark:border-neutral-800 border-slate-200 gap-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-base font-bold">{t('settings.security.two_factor')}</h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.security.two_factor_desc')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggle2FA}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  twoFactorEnabled
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {twoFactorEnabled ? t('settings.security.two_factor_btn_disable') : t('settings.security.two_factor_btn_enable')}
              </button>
            </div>

            {twoFactorMsg && (
              <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {twoFactorMsg}
              </div>
            )}

            {/* Active Sessions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{t('settings.security.sessions_title')}</span>
                <button
                  type="button"
                  onClick={handleTerminateOtherSessions}
                  className="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  {t('settings.security.terminate_others')}
                </button>
              </div>

              {sessionMsg && (
                <div className="p-2.5 rounded-lg text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {sessionMsg}
                </div>
              )}

              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div className="font-bold">{t('settings.security.current_device')}</div>
                    <div className={isDark ? 'text-neutral-400' : 'text-slate-500'}>
                      Web Browser • IP: 127.0.0.1 • TLS 1.3 Active
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  {t('common.online')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-5">
          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-neutral-800 border-slate-200">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-indigo-500" />
                <div>
                  <h2 className="text-base font-bold">{t('settings.notify.title')}</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.notify.desc')}
                  </p>
                </div>
              </div>

              {notifySound && (
                <button
                  type="button"
                  onClick={handleTestSound}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isDark ? 'bg-neutral-800 border-neutral-700 text-indigo-400 hover:bg-neutral-700' : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Thử chuông' : 'Test chime'}</span>
                </button>
              )}
            </div>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer py-1.5">
                <div>
                  <div className="font-semibold text-xs sm:text-sm">{t('settings.notify.deadline')}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.notify.deadline_desc')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyDeadline}
                  onChange={e => setNotifyDeadline(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1.5">
                <div>
                  <div className="font-semibold text-xs sm:text-sm">{t('settings.notify.ai_tips')}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.notify.ai_tips_desc')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyAiTips}
                  onChange={e => setNotifyAiTips(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1.5">
                <div>
                  <div className="font-semibold text-xs sm:text-sm">{t('settings.notify.course_updates')}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.notify.course_updates_desc')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCourseUpdates}
                  onChange={e => setNotifyCourseUpdates(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1.5">
                <div>
                  <div className="font-semibold text-xs sm:text-sm">{t('settings.notify.sound')}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.notify.sound_desc')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifySound}
                  onChange={e => setNotifySound(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1.5">
                <div>
                  <div className="font-semibold text-xs sm:text-sm">{t('settings.notify.quiet_hours')}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.notify.quiet_hours_desc')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={quietHours}
                  onChange={e => setQuietHours(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AI PREFERENCES */}
      {activeTab === 'ai' && (
        <div className="space-y-5">
          <div className={`p-6 rounded-2xl border space-y-5 transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center gap-2.5 pb-3 border-b dark:border-neutral-800 border-slate-200">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <div>
                <h2 className="text-base font-bold">{t('settings.ai.title')}</h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {t('settings.ai.desc')}
                </p>
              </div>
            </div>

            {/* AI Model Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-bold">{t('settings.ai.model')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAiModel('flash')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    aiModel === 'flash'
                      ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                      : isDark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Gemini 2.5 Flash</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-semibold">Recommended</span>
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.ai.model_fast')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAiModel('pro')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    aiModel === 'pro'
                      ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                      : isDark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Gemini 2.5 Pro</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-500 font-semibold">Deep Reasoning</span>
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {t('settings.ai.model_deep')}
                  </p>
                </button>
              </div>
            </div>

            {/* Subtask Depth & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold mb-2">{t('settings.ai.depth')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiBreakdownDepth('standard')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                      aiBreakdownDepth === 'standard'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    {t('settings.ai.depth_standard')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiBreakdownDepth('detailed')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                      aiBreakdownDepth === 'detailed'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : isDark ? 'border-neutral-700 hover:bg-neutral-800' : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    {t('settings.ai.depth_detailed')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">{t('settings.ai.tone')}</label>
                <select
                  value={aiTone}
                  onChange={e => setAiTone(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="concise">{t('settings.ai.tone_concise')}</option>
                  <option value="academic">{t('settings.ai.tone_academic')}</option>
                  <option value="friendly">{t('settings.ai.tone_friendly')}</option>
                </select>
              </div>
            </div>

            {/* Auto suggest timetable blocks */}
            <label className="flex items-center justify-between cursor-pointer py-1.5 pt-2 border-t dark:border-neutral-800 border-slate-200">
              <div>
                <div className="font-semibold text-xs sm:text-sm">{t('settings.ai.auto_suggest')}</div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {t('settings.ai.auto_suggest_desc')}
                </div>
              </div>
              <input
                type="checkbox"
                checked={aiAutoSuggest}
                onChange={e => setAiAutoSuggest(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 7: DATA & BACKUP */}
      {activeTab === 'data' && (
        <div className="space-y-5">
          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-neutral-800 border-slate-200">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold">{t('settings.data.title')}</h2>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('settings.data.autosave_interval')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1">
              <div>
                <div className="font-semibold text-xs sm:text-sm">{t('settings.data.status_label')}</div>
                <div className={`text-xs mt-0.5 max-w-xl leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {t('settings.data.status_desc')}
                  {lastAutoSaveTime && (
                    <span className="block mt-1 font-medium text-emerald-600 dark:text-emerald-400">
                      {t('settings.data.last_backup')} {lastAutoSaveTime}
                    </span>
                  )}
                </div>
              </div>

              {onTriggerManualSave && (
                <button
                  type="button"
                  onClick={onTriggerManualSave}
                  disabled={isAutoSaving}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    isAutoSaving
                      ? 'bg-indigo-500/20 text-indigo-400 cursor-not-allowed border-indigo-500/30'
                      : isDark
                        ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isAutoSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span>{t('settings.data.syncing')}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{t('settings.data.backup_now')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className={`p-6 rounded-2xl border space-y-3 transition-colors ${
            isDark ? 'bg-rose-950/20 border-rose-900/40 text-white' : 'bg-rose-50/50 border-rose-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{t('settings.data.danger_title')}</span>
            </div>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              {t('settings.data.reset_desc')}
            </p>
            <button
              type="button"
              onClick={handleClearCache}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              {t('settings.data.reset_all')}
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: SYSTEM & ABOUT */}
      {activeTab === 'about' && (
        <div className="space-y-5">
          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-neutral-800 border-slate-200">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-bold">{t('settings.about.title')}</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {t('settings.about.ping_healthy')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="font-semibold block text-indigo-500 mb-1">{t('settings.about.app_name')}</span>
                <span>{t('settings.about.version')}</span>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="font-semibold block text-indigo-500 mb-1">Architecture</span>
                <span>{t('settings.about.framework')}</span>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="font-semibold block text-indigo-500 mb-1">Server & Database</span>
                <span>{t('settings.about.server')}</span>
              </div>
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="font-semibold block text-indigo-500 mb-1">Artificial Intelligence</span>
                <span>{t('settings.about.ai_engine')}</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              isDark ? 'bg-neutral-950/40 border-neutral-800 text-neutral-300' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <div className="font-bold mb-1">{t('settings.about.support_contact')}</div>
              <div>{t('settings.about.license')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Full Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onExportData={handleExportData}
      />
    </div>
  );
}
