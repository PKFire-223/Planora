import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  FileText, 
  Cpu, 
  Database, 
  UserCheck, 
  Mail, 
  Check, 
  Copy, 
  Download,
  ExternalLink,
  Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData?: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose, onExportData }: PrivacyPolicyModalProps) {
  const { language, t } = useLanguage();
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState<'overview' | 'collection' | 'ai' | 'security' | 'rights' | 'cookies' | 'contact'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const text = language === 'vi' 
      ? `CHÍNH SÁCH BẢO MẬT PLANORA LMS
Cập nhật lần cuối: Tháng 09/2026
1. Cam kết không bán dữ liệu học tập cho bên thứ 3.
2. Dữ liệu bài tập & ghi chú KHÔNG bị dùng để huấn luyện mô hình AI công cộng.
3. Mã hóa toàn bộ dữ liệu qua giao thức TLS 1.3 và lưu trữ cơ sở dữ liệu bảo mật.
4. Học viên có toàn quyền xem, xuất dữ liệu JSON và yêu cầu xóa vĩnh viễn tài khoản.
Liên hệ hỗ trợ: support@planora.edu.vn`
      : `PLANORA LMS PRIVACY POLICY SUMMARY
Last Updated: September 2026
1. Strict commitment to never sell student data to third parties.
2. Personal notes and study materials are NEVER used to train public AI models.
3. End-to-end data encryption via TLS 1.3 and secured server storage.
4. Complete student data ownership: right to inspect, export JSON, and full erasure.
Contact: support@planora.edu.vn`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { id: 'overview', icon: ShieldCheck, label: language === 'vi' ? 'Tổng quan cam kết' : 'Overview & Pledge' },
    { id: 'collection', icon: Database, label: language === 'vi' ? 'Dữ liệu thu thập' : 'Data Collected' },
    { id: 'ai', icon: Cpu, label: language === 'vi' ? 'Bảo mật AI Gemini' : 'Gemini AI Privacy' },
    { id: 'security', icon: Lock, label: language === 'vi' ? 'Mã hóa & Lưu trữ' : 'Encryption & Security' },
    { id: 'rights', icon: UserCheck, label: language === 'vi' ? 'Quyền của học viên' : 'Your Data Rights' },
    { id: 'cookies', icon: FileText, label: language === 'vi' ? 'Cookies & Bộ nhớ' : 'Cookies & Storage' },
    { id: 'contact', icon: Mail, label: language === 'vi' ? 'Liên hệ & DPO' : 'Contact & DPO' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          isDark 
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100 shadow-black/80' 
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 shrink-0 ${
          isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="privacy-modal-title" className="text-base sm:text-lg font-bold">
                  {language === 'vi' ? 'Chính Sách Bảo Mật & Quyền Riêng Tư' : 'Privacy Policy & Student Data Rights'}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  {language === 'vi' ? 'Áp dụng: 09/2026' : 'Effective: Sep 2026'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {language === 'vi' 
                  ? 'Cam kết bảo vệ dữ liệu học tập, tuân thủ tiêu chuẩn an toàn thông tin GD & GDĐT.'
                  : 'Committed to student privacy, educational data security, and transparent data ownership.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300' 
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title={language === 'vi' ? 'Sao chép tóm tắt chính sách' : 'Copy policy summary'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? (language === 'vi' ? 'Đã chép' : 'Copied') : (language === 'vi' ? 'Sao chép' : 'Copy')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-400 hover:text-white' 
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
              title={t('common.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body with Sidebar + Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Section Navigation Tabs */}
          <div className={`w-full md:w-56 border-b md:border-b-0 md:border-r p-2 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto ${
            isDark ? 'border-neutral-800 bg-neutral-950/30' : 'border-slate-200 bg-slate-50/50'
          }`}>
            {sections.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id as any)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : isDark
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Detailed Content */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 leading-relaxed text-xs sm:text-sm">
            {activeSection === 'overview' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200' : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                }`}>
                  <Info className="w-5 h-5 shrink-0 text-indigo-500 mt-0.5" />
                  <p className="text-xs sm:text-sm">
                    {language === 'vi' 
                      ? 'Planora được phát triển với triết lý bảo vệ tối thượng quyền riêng tư của người học. Mọi dữ liệu bạn đưa vào hệ thống đều thuộc quyền sở hữu của bạn.'
                      : 'Planora is engineered with an unwavering commitment to learner privacy. Every piece of coursework, note, and timetable data you input remains exclusively yours.'}
                  </p>
                </div>

                <h3 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                  {language === 'vi' ? '1. Tôn Chỉ Bảo Vệ Dữ Liệu Học Tập' : '1. Core Academic Privacy Principles'}
                </h3>
                <p className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                  {language === 'vi' 
                    ? 'Chúng tôi hiểu rằng lịch học, đề thi, ghi chú và bài tập cá nhân là tài sản học thuật riêng tư. Planora khẳng định:'
                    : 'We recognize that lecture notes, assignments, course grades, and personal timetables constitute private intellectual property. Planora guarantees:'}
                </p>
                <ul className="space-y-2 list-disc list-inside pl-2">
                  <li>{language === 'vi' ? 'Không bao giờ bán, cho thuê thông tin tài khoản cho bất kỳ bên thứ ba hay mạng quảng cáo nào.' : 'Zero sale or monetization of your student profile to external advertising networks or data brokers.'}</li>
                  <li>{language === 'vi' ? 'Không phân tích nội dung học tập để tiếp thị thương mại.' : 'No behavioral ad targeting based on course selection or personal study habits.'}</li>
                  <li>{language === 'vi' ? 'Hỗ trợ trích xuất toàn bộ dữ liệu (Data Portability) bất cứ khi nào bạn cần chuyển đổi thiết bị.' : 'Full support for data portability: download your entire student archive anytime in open JSON format.'}</li>
                </ul>
              </div>
            )}

            {activeSection === 'collection' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Database className="w-4 h-4" />
                  {language === 'vi' ? '2. Phạm Vi Dữ Liệu Thu Thập' : '2. Scope of Data Collected'}
                </h3>
                <p className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                  {language === 'vi' 
                    ? 'Hệ thống chỉ thu thập và lưu giữ các thông tin tối thiểu cần thiết để vận hành ứng dụng quản lý học tập:'
                    : 'We gather and retain only the minimal dataset necessary to provide LMS planning and productivity capabilities:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="font-semibold text-xs mb-1 text-indigo-500">
                      {language === 'vi' ? 'Tài Khoản & Hồ Sơ' : 'Account & Credentials'}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                      {language === 'vi' ? 'Họ tên, địa chỉ email đăng nhập, mật khẩu được mã hóa băm an toàn, mã số học viên (tuỳ chọn) và vai trò (Admin/Student).' : 'Name, login email, cryptographically salted & hashed password, student ID (optional), and permission role.'}
                    </p>
                  </div>
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="font-semibold text-xs mb-1 text-emerald-500">
                      {language === 'vi' ? 'Học Tập & Tiến Độ' : 'Coursework & Schedule'}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                      {language === 'vi' ? 'Danh sách môn học, đề cương, thời khóa biểu sáng/chiều, nhiệm vụ bài tập cần hoàn thành, ghi chú và mục tiêu KPI.' : 'Course lists, syllabi, morning/afternoon timetables, assignment tasks, subtasks, notes, and study targets.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'ai' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Cpu className="w-4 h-4" />
                  {language === 'vi' ? '3. Bảo Vệ Dữ Liệu Khi Tương Tác Cùng Trợ Lý AI Gemini' : '3. Gemini AI Data Safeguards'}
                </h3>
                <p className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                  {language === 'vi' 
                    ? 'Tính năng Trợ lý AI và phân rã nhiệm vụ (AI Breakdown) sử dụng Google Gemini Generative AI SDK chạy hoàn toàn qua tầng máy chủ Backend bảo mật (Server-side):'
                    : 'AI assistant chat and automated task decomposition utilize the official Google Gemini SDK via isolated, server-side API proxy routes:'}
                </p>
                <div className={`p-4 rounded-xl border space-y-2.5 ${isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Không Dùng Để Huấn Luyện AI Công Cộng' : 'Zero Model Training on User Submissions'}</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    {language === 'vi' 
                      ? 'Nội dung câu hỏi và ghi chú của bạn không bị lưu trữ hay sử dụng để huấn luyện lại các mô hình nền tảng công khai của Google.'
                      : 'Course prompts and personal study materials are not retained or utilized to train general public foundation models.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                    <Check className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Bảo Vệ Khóa Bí Mật Backend (API Key Security)' : 'Server-Side Credential Masking'}</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    {language === 'vi' 
                      ? 'Khoá API Gemini được bảo mật tuyệt đối trên máy chủ, không lộ ra mã nguồn trình duyệt của người dùng.'
                      : 'The Gemini API token resides strictly server-side and is never exposed in client browser network requests.'}
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Lock className="w-4 h-4" />
                  {language === 'vi' ? '4. Tiêu Chuẩn An Ninh & Mã Hóa Hệ Thống' : '4. Security Architecture & Encryption'}
                </h3>
                <div className="space-y-2.5">
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'border-neutral-800 bg-neutral-950/50' : 'border-slate-200 bg-white'}`}>
                    <span className="font-semibold">{language === 'vi' ? 'Mã hóa truyền tải (In Transit)' : 'Transmission Encryption'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">HTTPS / TLS 1.3</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'border-neutral-800 bg-neutral-950/50' : 'border-slate-200 bg-white'}`}>
                    <span className="font-semibold">{language === 'vi' ? 'Mã hóa lưu trữ (At Rest)' : 'Storage Encryption'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">AES-256 Storage</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'border-neutral-800 bg-neutral-950/50' : 'border-slate-200 bg-white'}`}>
                    <span className="font-semibold">{language === 'vi' ? 'Xác thực phiên (Session Auth)' : 'Session Tokens'}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Encrypted JWT / Cookies</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'rights' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <UserCheck className="w-4 h-4" />
                  {language === 'vi' ? '5. Quyền Của Bạn Đối Với Dữ Liệu' : '5. Student Rights (GDPR & Data Ownership)'}
                </h3>
                <p className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                  {language === 'vi' 
                    ? 'Bạn sở hữu trọn vẹn quyền kiểm soát đối với thông tin của mình theo các quy định bảo vệ dữ liệu hiện hành:'
                    : 'You maintain absolute agency over your information under international data protection frameworks:'}
                </p>
                <div className="space-y-2">
                  <div className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="font-bold block mb-0.5">{language === 'vi' ? '• Quyền Xuất Dữ Liệu (Right to Data Portability)' : '• Right to Data Portability'}</span>
                    <span>{language === 'vi' ? 'Tải trọn vẹn tệp lưu trữ gồm môn học, ghi chú, lịch học dưới định dạng JSON độc lập.' : 'Export your complete dataset at any time in structured, human-readable JSON format.'}</span>
                  </div>
                  <div className={`p-3 rounded-xl border text-xs ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="font-bold block mb-0.5">{language === 'vi' ? '• Quyền Chỉnh Sửa & Xóa Bỏ (Right to Rectification & Erasure)' : '• Right to Rectification & Erasure'}</span>
                    <span>{language === 'vi' ? 'Chỉnh sửa mọi mục hoặc yêu cầu xoá vĩnh viễn tài khoản khỏi máy chủ (Right to be Forgotten).' : 'Modify any erroneous entries or request total, irrevocable account deletion from our database.'}</span>
                  </div>
                </div>

                {onExportData && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onExportData}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t('settings.privacy.export_btn')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'cookies' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-4 h-4" />
                  {language === 'vi' ? '6. Chính Sách Bộ Nhớ Trình Duyệt (LocalStorage)' : '6. Local Browser Storage Policy'}
                </h3>
                <p className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                  {language === 'vi' 
                    ? 'Planora không sử dụng các cookie theo dõi quảng cáo của bên thứ ba. Hệ thống chỉ sử dụng HTML5 LocalStorage nhằm mục đích kỹ thuật trực tiếp:'
                    : 'Planora employs zero commercial tracking cookies. Browser LocalStorage is exclusively used for essential operational purposes:'}
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-xs pl-2">
                  <li><code>planora_language</code>: {language === 'vi' ? 'Ghi nhớ ngôn ngữ bạn đã chọn (mặc định cho người dùng mới là English).' : 'Stores your chosen display language (defaults to English for new users).'}</li>
                  <li><code>planora_theme</code>: {language === 'vi' ? 'Ghi nhớ chế độ sáng hoặc tối theo ý muốn của bạn.' : 'Remembers your light or dark mode aesthetic preference.'}</li>
                  <li><code>planora_backup_*</code>: {language === 'vi' ? 'Bộ nhớ đệm khẩn cấp lưu trạng thái gần nhất khi mất kết nối mạng đột ngột.' : 'Emergency client-side offline snapshot to prevent accidental data loss.'}</li>
                </ul>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Mail className="w-4 h-4" />
                  {language === 'vi' ? '7. Thông Tin Liên Hệ & Cán Bộ Bảo Vệ Dữ Liệu (DPO)' : '7. Contact & Data Protection Officer'}
                </h3>
                <p className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                  {language === 'vi' 
                    ? 'Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, muốn khiếu nại hoặc gửi yêu cầu xóa dữ liệu, vui lòng liên hệ trực tiếp với chúng tôi:'
                    : 'For any privacy-related inquiries, data erasure requests, or compliance auditing, please contact our team:'}
                </p>
                <div className={`p-4 rounded-xl border space-y-2 text-xs ${isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <span className="font-semibold block">{language === 'vi' ? 'Đơn vị phát triển:' : 'Platform Developer:'}</span>
                    <span>Planora Smart LMS Workspace Engineering Team</span>
                  </div>
                  <div>
                    <span className="font-semibold block">Email:</span>
                    <a href="mailto:support@planora.edu.vn" className="text-indigo-500 hover:underline">
                      support@planora.edu.vn
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold block">{language === 'vi' ? 'Thời gian giải quyết yêu cầu dữ liệu:' : 'Data Request Resolution Time:'}</span>
                    <span>{language === 'vi' ? 'Trong vòng 24 - 48 giờ làm việc' : 'Within 24 - 48 business hours'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between shrink-0 ${
          isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50/70'
        }`}>
          <div className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Planora Security & Privacy Charter • v1.2.0
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
