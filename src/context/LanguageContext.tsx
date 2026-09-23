import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type Language = 'en' | 'vi';

export interface Translations {
  [key: string]: string;
}

const enTranslations: Translations = {
  // Navigation & Tabs
  'nav.dashboard': 'Dashboard',
  'nav.courses': 'Courses',
  'nav.timetable': 'Timetable',
  'nav.tasks': 'Tasks',
  'nav.notes': 'Notes',
  'nav.goals': 'Goals',
  'nav.ai': 'AI Assistant',
  'nav.errors': 'Bug Reports',
  'nav.notifications': 'Notifications',
  'nav.profile': 'Profile',
  'nav.settings': 'Settings',
  'nav.users': 'User Management',
  'nav.landing': 'Landing Page',
  'nav.logout': 'Sign Out',
  'nav.admin_badge': 'Admin',
  'nav.student_badge': 'Student',
  'nav.menu_title': 'Navigation Menu',

  // Header titles & subtitles
  'header.dashboard.title': 'Dashboard Overview',
  'header.dashboard.subtitle': 'Track your study progress, pending assignments, and personal goals.',
  'header.courses.title': 'Courses & Subjects',
  'header.courses.subtitle': 'Course roster, completion milestones, and lecture breakdown.',
  'header.timetable.title': 'Timetable & Schedule',
  'header.timetable.subtitle': 'Organize morning and afternoon classes from Monday to Sunday with ease.',
  'header.tasks.title': 'Tasks & Assignments',
  'header.tasks.subtitle': 'Manage your to-do lists, upcoming deadlines, and AI-powered step breakdowns.',
  'header.notes.title': 'Study Notes',
  'header.notes.subtitle': 'Summarized knowledge repository, revision guides, and key formulas.',
  'header.goals.title': 'Self-Study Goals & Targets',
  'header.goals.subtitle': 'Set study KPIs, focused learning hours, and milestones.',
  'header.ai.title': 'Planora AI Study Assistant',
  'header.ai.subtitle': 'Ask coursework questions, clarify complex concepts, and build learning roadmaps.',
  'header.errors.title': 'Error Center & Bug Tracker',
  'header.errors.subtitle': 'Report technical issues, monitor resolution status, and assist quality assurance.',
  'header.notifications.title': 'Notifications & Reminders',
  'header.notifications.subtitle': 'Stay updated with deadlines, AI study suggestions, and course notices.',
  'header.profile.title': 'Personal Profile',
  'header.profile.subtitle': 'Student profile, contact details, and academic track.',
  'header.settings.title': 'System Settings & Preferences',
  'header.settings.subtitle': 'Customize language, display theme, privacy, notifications, and security.',
  'header.users.title': 'Account Management & Supervision',
  'header.users.subtitle': 'View registered users, online/offline status, and manage permissions.',

  // Common UI words
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.saved': 'Saved successfully',
  'common.confirm': 'Confirm',
  'common.delete': 'Delete',
  'common.close': 'Close',
  'common.export': 'Export Data',
  'common.import': 'Import Data',
  'common.reset': 'Reset',
  'common.loading': 'Loading...',
  'common.enabled': 'Enabled',
  'common.disabled': 'Disabled',
  'common.active': 'Active',
  'common.update': 'Update',
  'common.copied': 'Copied to clipboard!',
  'common.copy': 'Copy',
  'common.download': 'Download',
  'common.success': 'Success',
  'common.error': 'Error',
  'common.warning': 'Warning',
  'common.version': 'Version',
  'common.status': 'Status',
  'common.online': 'Online',
  'common.offline': 'Offline',

  // Settings Main Page
  'settings.title': 'System Settings & Preferences',
  'settings.subtitle': 'Tailor your learning environment, privacy policy, language, AI preferences, and security.',
  
  // Settings Tabs
  'settings.tab.language': 'Language & Region',
  'settings.tab.privacy': 'Privacy Policy',
  'settings.tab.appearance': 'Appearance',
  'settings.tab.security': 'Security & Auth',
  'settings.tab.notifications': 'Notifications',
  'settings.tab.ai': 'AI Preferences',
  'settings.tab.data': 'Data & Backup',
  'settings.tab.about': 'System & About',

  // Language & Region Tab
  'settings.lang.title': 'Language & Regional Formats',
  'settings.lang.desc': 'Select your preferred application language and regional time displays.',
  'settings.lang.current': 'Active Language',
  'settings.lang.default_badge': 'Default for new users',
  'settings.lang.en_name': 'English (US)',
  'settings.lang.en_desc': 'International English interface with standard date & metric notation.',
  'settings.lang.vi_name': 'Tiếng Việt',
  'settings.lang.vi_desc': 'Giao diện tiếng Việt chuẩn, hỗ trợ dấu và múi giờ Việt Nam (GMT+7).',
  'settings.lang.time_format': 'Time Display Format',
  'settings.lang.time_24': '24-hour clock (e.g., 14:30)',
  'settings.lang.time_12': '12-hour clock with AM/PM (e.g., 02:30 PM)',
  'settings.lang.first_day': 'First Day of the Week',
  'settings.lang.monday': 'Monday',
  'settings.lang.sunday': 'Sunday',
  'settings.lang.preview_heading': 'Format Live Preview',
  'settings.lang.preview_note': 'Displays how dates and timestamps look throughout Planora:',

  // Privacy Policy Tab
  'settings.privacy.title': 'Privacy Policy & Student Data Rights',
  'settings.privacy.desc': 'We treat your academic records and personal information with utmost security and confidentiality.',
  'settings.privacy.badge_verified': 'Compliant Privacy Standards',
  'settings.privacy.updated_date': 'Last updated: September 2026',
  'settings.privacy.p1_title': '1. Academic Data Protection Pledge',
  'settings.privacy.p1_text': 'Planora is built for focused learning. We never sell, rent, or trade your personal information, study logs, courses, or notes to third-party advertisers or data brokers.',
  'settings.privacy.p2_title': '2. Data We Collect & Store',
  'settings.privacy.p2_text': 'We only store data essential to your study productivity: your account credentials (name, encrypted password, email), enrolled courses, timetable schedule, tasks, notes, and study goals.',
  'settings.privacy.p3_title': '3. AI Assistant & Gemini Data Privacy',
  'settings.privacy.p3_text': 'When you interact with the Gemini AI assistant, prompts are sent strictly through secure server-side API calls. Your personal notes and assignments are NEVER used to train foundational public AI models.',
  'settings.privacy.p4_title': '4. Encryption & Security Standards',
  'settings.privacy.p4_text': 'All communication between your device and Planora servers is protected by HTTPS with TLS 1.3 encryption. Passwords and sensitive session tokens are salted and hashed using industry-standard cryptography.',
  'settings.privacy.p5_title': '5. Your Student Data Rights (GDPR & Data Ownership)',
  'settings.privacy.p5_text': 'You have full ownership of your data at all times. You possess the right to view, rectify, export all your records in standard JSON format, or request complete account erasure (Right to be Forgotten).',
  'settings.privacy.p6_title': '6. Cookies & Local Storage Usage',
  'settings.privacy.p6_text': 'Planora utilizes local storage solely for functional experience preferences (such as your chosen theme, active language, and emergency offline backup snapshots). No third-party tracking cookies are deployed.',
  'settings.privacy.export_title': 'Export Your Student Archive',
  'settings.privacy.export_desc': 'Download a portable, complete copy of all your courses, tasks, notes, goals, and timetable entries.',
  'settings.privacy.export_btn': 'Download Personal Data (JSON)',
  'settings.privacy.clear_cache_title': 'Clear Offline Cache & Local Storage',
  'settings.privacy.clear_cache_desc': 'Clear temporary client-side data and reload fresh settings without deleting your server account.',
  'settings.privacy.clear_cache_btn': 'Clear Cache & Refresh',
  'settings.privacy.clear_confirm': 'Are you sure you want to clear local cache? Your current language and theme preferences will be reset.',

  // Appearance Tab
  'settings.appearance.title': 'Display Mode & Visual Theme',
  'settings.appearance.desc': 'Choose light or dark visual comfort and customize interface responsiveness.',
  'settings.appearance.theme_mode': 'Color Theme',
  'settings.appearance.light': 'Light Theme',
  'settings.appearance.dark': 'Dark Theme',
  'settings.appearance.current_mode': 'Currently using',
  'settings.appearance.toggle_theme': 'Switch to',
  'settings.appearance.compact_mode': 'Compact Density View',
  'settings.appearance.compact_desc': 'Reduce card paddings and spacing for higher information density on large screens.',
  'settings.appearance.animations': 'Interface Transitions & Animations',
  'settings.appearance.animations_desc': 'Enable smooth motion transitions for tab changes and modal dialogues.',
  'settings.appearance.accent_color': 'Theme Accent Color',

  // Security Tab
  'settings.security.title': 'Account Security & Password',
  'settings.security.desc': 'Keep your Planora account protected with robust credentials and active session controls.',
  'settings.security.change_pw': 'Change Account Password',
  'settings.security.current_pw': 'Current Password',
  'settings.security.new_pw': 'New Password',
  'settings.security.confirm_pw': 'Confirm New Password',
  'settings.security.update_pw_btn': 'Update Password',
  'settings.security.pw_min_length': 'Password must be at least 6 characters long.',
  'settings.security.pw_mismatch': 'Confirm password does not match.',
  'settings.security.pw_success': 'Password updated successfully!',
  'settings.security.two_factor': 'Two-Factor Authentication (2FA)',
  'settings.security.two_factor_desc': 'Add an additional layer of security by requiring an authenticator code when signing in.',
  'settings.security.two_factor_status': '2FA is currently',
  'settings.security.two_factor_btn_enable': 'Enable 2FA Protection',
  'settings.security.two_factor_btn_disable': 'Disable 2FA',
  'settings.security.two_factor_enabled_msg': 'Two-Factor Authentication simulated and enabled for this device.',
  'settings.security.two_factor_disabled_msg': 'Two-Factor Authentication has been disabled.',
  'settings.security.sessions_title': 'Active Browser Sessions',
  'settings.security.current_device': 'This Device (Current Session)',
  'settings.security.terminate_others': 'Sign Out Other Sessions',
  'settings.security.terminate_msg': 'All other browser sessions have been terminated.',

  // Notifications Tab
  'settings.notify.title': 'Notification & Reminder Preferences',
  'settings.notify.desc': 'Control what events trigger alerts and stay focused without distraction.',
  'settings.notify.deadline': 'Task Deadline Alerts (24h & 1h prior)',
  'settings.notify.deadline_desc': 'Receive warning alerts when assignments approach due dates.',
  'settings.notify.ai_tips': 'AI Study & Breakdown Recommendations',
  'settings.notify.ai_tips_desc': 'Receive automatic suggestions from Gemini AI when tasks have high complexity.',
  'settings.notify.course_updates': 'Course & Syllabus Announcements',
  'settings.notify.course_updates_desc': 'Notify when lecture notes, schedules, or grading criteria are modified.',
  'settings.notify.sound': 'In-App Alert Chimes & Sounds',
  'settings.notify.sound_desc': 'Play a gentle sound when important study milestones or timers complete.',
  'settings.notify.quiet_hours': 'Quiet Hours / Do Not Disturb',
  'settings.notify.quiet_hours_desc': 'Silence non-urgent notifications between 23:00 and 07:00.',

  // AI Preferences Tab
  'settings.ai.title': 'Gemini AI Assistant Configuration',
  'settings.ai.desc': 'Fine-tune how the AI tutor analyzes course materials, creates task breakdowns, and provides feedback.',
  'settings.ai.model': 'AI Processing Profile',
  'settings.ai.model_fast': 'Gemini 2.5 Flash (Ultra-Fast & Responsive)',
  'settings.ai.model_deep': 'Gemini 2.5 Pro (Deep Conceptual Reasoning)',
  'settings.ai.depth': 'Default Subtask Decomposition Depth',
  'settings.ai.depth_standard': 'Standard (3 - 4 concise steps)',
  'settings.ai.depth_detailed': 'Detailed (5 - 8 granular actionable steps)',
  'settings.ai.tone': 'AI Response Style & Tone',
  'settings.ai.tone_academic': 'Academic & In-Depth',
  'settings.ai.tone_concise': 'Direct & Action-Oriented',
  'settings.ai.tone_friendly': 'Friendly & Encouraging Mentor',
  'settings.ai.auto_suggest': 'Auto-detect Study Sessions from Syllabus',
  'settings.ai.auto_suggest_desc': 'Let AI automatically suggest timetable study blocks based on upcoming task deadlines.',

  // Data & Backup Tab
  'settings.data.title': 'Data Synchronization & Automatic Backups',
  'settings.data.desc': 'Safeguard your academic progress with periodic cloud snapshots and manual backup triggers.',
  'settings.data.autosave_interval': '5-minute auto-backup cycle',
  'settings.data.status_label': 'Automatic Synchronization Status',
  'settings.data.status_desc': 'The system automatically persists your courses, tasks, and study goals every 5 minutes to prevent data loss during network interruptions.',
  'settings.data.last_backup': 'Last successful backup:',
  'settings.data.backup_now': 'Backup Now',
  'settings.data.syncing': 'Synchronizing...',
  'settings.data.backup_success': 'Backup completed successfully!',
  'settings.data.danger_title': 'Danger Zone',
  'settings.data.reset_all': 'Reset All Local Data',
  'settings.data.reset_desc': 'Clear all locally saved state, draft tasks, and return to default demonstration data.',
  'settings.data.reset_confirm': 'Are you sure you want to reset all local data? This action cannot be undone.',

  // System & About Tab
  'settings.about.title': 'System Information & Diagnostics',
  'settings.about.desc': 'Check system runtime version, database connectivity, and environment parameters.',
  'settings.about.app_name': 'Planora Smart LMS Workspace',
  'settings.about.version': 'Version 1.5.0 (Build 2026-09)',
  'settings.about.framework': 'React 19 + TypeScript + Tailwind CSS',
  'settings.about.server': 'Node.js Express + MongoDB',
  'settings.about.ai_engine': 'Google Gemini Generative AI SDK',
  'settings.about.license': 'Academic & Educational Edition',
  'settings.about.ping_healthy': 'API & Database: Connected (Operational)',
  'settings.about.support_contact': 'Technical Support & Data Protection Office: support@planora.edu.vn'
};

const viTranslations: Translations = {
  // Navigation & Tabs
  'nav.dashboard': 'Tổng Quan',
  'nav.courses': 'Khoá Học',
  'nav.timetable': 'Thời Khóa Biểu',
  'nav.tasks': 'Nhiệm Vụ',
  'nav.notes': 'Ghi Chú',
  'nav.goals': 'Mục Tiêu',
  'nav.ai': 'Trợ Lý AI',
  'nav.errors': 'Báo Lỗi',
  'nav.notifications': 'Thông Báo',
  'nav.profile': 'Cá Nhân',
  'nav.settings': 'Cài Đặt',
  'nav.users': 'Quản Trị Người Dùng',
  'nav.landing': 'Trang Giới Thiệu',
  'nav.logout': 'Đăng Xuất',
  'nav.admin_badge': 'Quản Trị Viên',
  'nav.student_badge': 'Học Viên',
  'nav.menu_title': 'Menu Quản Lý',

  // Header titles & subtitles
  'header.dashboard.title': 'Bảng Điều Khiển Tổng Quan',
  'header.dashboard.subtitle': 'Theo dõi tiến độ học tập, bài tập cần xử lý và mục tiêu cá nhân.',
  'header.courses.title': 'Khoá Học & Môn Học',
  'header.courses.subtitle': 'Danh sách môn học, tiến độ hoàn thành và phân bổ bài giảng.',
  'header.timetable.title': 'Thời Khóa Biểu & Lịch Học',
  'header.timetable.subtitle': 'Xếp lịch học Sáng/Chiều từ T2 đến CN bằng kéo thả trực quan và quản lý phòng học tự do.',
  'header.tasks.title': 'Nhiệm Vụ & Bài Tập',
  'header.tasks.subtitle': 'Quản lý danh sách nhiệm vụ cần làm, hạn chót và chia nhỏ bước bằng AI.',
  'header.notes.title': 'Ghi Chú Học Tập',
  'header.notes.subtitle': 'Hệ thống tài liệu tóm tắt kiến thức, cú pháp và mẹo thực hành.',
  'header.goals.title': 'Mục Tiêu & Chỉ Tiêu Tự Học',
  'header.goals.subtitle': 'Thiết lập KPI học tập cá nhân, số giờ học tập và bài tập giải quyết.',
  'header.ai.title': 'Trợ Lý Học Tập AI (Planora Assistant)',
  'header.ai.subtitle': 'Hỏi đáp bài học, giải thích khái niệm phức tạp và gợi ý lộ trình.',
  'header.errors.title': 'Trung Tâm Báo & Sửa Lỗi',
  'header.errors.subtitle': 'Ghi nhận sự cố, theo dõi trạng thái khắc phục và kiểm định chất lượng.',
  'header.notifications.title': 'Thông Báo & Nhắc Nhở',
  'header.notifications.subtitle': 'Cập nhật deadline nộp bài, đề xuất tối ưu từ Gemini AI và hoạt động khóa học.',
  'header.profile.title': 'Thông Tin Cá Nhân',
  'header.profile.subtitle': 'Hồ sơ học viên, thông tin liên hệ và chuyên ngành đào tạo.',
  'header.settings.title': 'Cài Đặt Hệ Thống & Trải Nghiệm',
  'header.settings.subtitle': 'Tùy chỉnh giao diện, chính sách bảo mật, ngôn ngữ, thông báo và bảo mật tài khoản.',
  'header.users.title': 'Quản Trị Người Dùng & Giám Sát Tài Khoản',
  'header.users.subtitle': 'Xem toàn bộ tài khoản, trạng thái Online/Offline, thông tin cá nhân và quản trị phân quyền.',

  // Common UI words
  'common.save': 'Lưu Thay Đổi',
  'common.cancel': 'Hủy Bỏ',
  'common.saved': 'Đã lưu thành công',
  'common.confirm': 'Xác Nhận',
  'common.delete': 'Xóa',
  'common.close': 'Đóng',
  'common.export': 'Xuất Dữ Liệu',
  'common.import': 'Nhập Dữ Liệu',
  'common.reset': 'Đặt Lại',
  'common.loading': 'Đang xử lý...',
  'common.enabled': 'Đang bật',
  'common.disabled': 'Đang tắt',
  'common.active': 'Hoạt động',
  'common.update': 'Cập Nhật',
  'common.copied': 'Đã sao chép vào bộ nhớ tạm!',
  'common.copy': 'Sao chép',
  'common.download': 'Tải về',
  'common.success': 'Thành công',
  'common.error': 'Lỗi',
  'common.warning': 'Cảnh báo',
  'common.version': 'Phiên bản',
  'common.status': 'Trạng thái',
  'common.online': 'Trực tuyến',
  'common.offline': 'Ngoại tuyến',

  // Settings Main Page
  'settings.title': 'Cài Đặt Hệ Thống & Trải Nghiệm',
  'settings.subtitle': 'Tùy chỉnh ngôn ngữ, chính sách bảo mật, giao diện, thông số AI và bảo mật tài khoản cá nhân.',

  // Settings Tabs
  'settings.tab.language': 'Ngôn Ngữ & Vùng',
  'settings.tab.privacy': 'Chính Sách Bảo Mật',
  'settings.tab.appearance': 'Giao Diện & Hiển Thị',
  'settings.tab.security': 'Bảo Mật & Mật Khẩu',
  'settings.tab.notifications': 'Thông Báo',
  'settings.tab.ai': 'Cấu Hình Trợ Lý AI',
  'settings.tab.data': 'Dữ Liệu & Sao Lưu',
  'settings.tab.about': 'Hệ Thống & Giới Thiệu',

  // Language & Region Tab
  'settings.lang.title': 'Ngôn Ngữ & Định Dạng Vùng',
  'settings.lang.desc': 'Chọn ngôn ngữ giao diện ứng dụng và quy chuẩn định dạng thời gian yêu thích.',
  'settings.lang.current': 'Ngôn ngữ đang kích hoạt',
  'settings.lang.default_badge': 'Mặc định cho người dùng mới',
  'settings.lang.en_name': 'English (Tiếng Anh)',
  'settings.lang.en_desc': 'Giao diện tiếng Anh chuẩn quốc tế với ký hiệu đơn vị tiêu chuẩn.',
  'settings.lang.vi_name': 'Tiếng Việt',
  'settings.lang.vi_desc': 'Giao diện tiếng Việt bản địa hóa hoàn chỉnh, múi giờ Việt Nam (GMT+7).',
  'settings.lang.time_format': 'Định Dạng Hiển Thị Giờ',
  'settings.lang.time_24': 'Hệ 24 giờ (Ví dụ: 14:30)',
  'settings.lang.time_12': 'Hệ 12 giờ AM/PM (Ví dụ: 02:30 PM)',
  'settings.lang.first_day': 'Ngày Đầu Tuần Trong Lịch',
  'settings.lang.monday': 'Thứ Hai',
  'settings.lang.sunday': 'Chủ Nhật',
  'settings.lang.preview_heading': 'Xem Trước Định Dạng Trực Quan',
  'settings.lang.preview_note': 'Minh họa cách ngày tháng và đồng hồ hiển thị trong các bài học và nhiệm vụ:',

  // Privacy Policy Tab
  'settings.privacy.title': 'Chính Sách Bảo Mật & Quyền Riêng Tư Của Học Viên',
  'settings.privacy.desc': 'Cam kết bảo vệ dữ liệu học tập cá nhân, bảo mật ghi chú và tôn trọng quyền riêng tư tuyệt đối.',
  'settings.privacy.badge_verified': 'Chứng Nhận Chuẩn Bảo Mật',
  'settings.privacy.updated_date': 'Cập nhật lần cuối: Tháng 09/2026',
  'settings.privacy.p1_title': '1. Cam Kết Bảo Vệ Dữ Liệu Học Tập Tuyệt Đối',
  'settings.privacy.p1_text': 'Planora được thiết kế chuyên biệt cho việc học tập hiệu quả. Chúng tôi cam kết KHÔNG BAO GIỜ bán, cho thuê hoặc chuyển nhượng thông tin cá nhân, lịch học hay ghi chú của bạn cho bên quảng cáo thứ ba.',
  'settings.privacy.p2_title': '2. Dữ Liệu Được Thu Thập & Lưu Trữ',
  'settings.privacy.p2_text': 'Hệ thống chỉ lưu trữ các thông tin thiết yếu phục vụ quá trình học tập: hồ sơ tài khoản (họ tên, email, mật khẩu mã hoá), danh sách môn học, lịch thời khóa biểu, nhiệm vụ, ghi chú và mục tiêu KPI học tập cá nhân.',
  'settings.privacy.p3_title': '3. Cơ Chế Bảo Vệ Dữ Liệu Khi Sử Dụng Trợ Lý AI Gemini',
  'settings.privacy.p3_text': 'Khi bạn hỏi đáp cùng trợ lý AI Gemini, toàn bộ câu hỏi được gửi bảo mật qua máy chủ Backend riêng biệt. Dữ liệu ghi chú bài vở của bạn KHÔNG bị sử dụng để huấn luyện (train) các mô hình AI công cộng.',
  'settings.privacy.p4_title': '4. Tiêu Chuẩn Mã Hóa & Lưu Trữ Đạt Chuẩn',
  'settings.privacy.p4_text': 'Mọi luồng dữ liệu truyền tải giữa thiết bị của bạn và hệ thống Planora đều được mã hóa bằng giao thức HTTPS với chứng chỉ TLS 1.3. Mật khẩu được băm (hash) bằng thuật toán an toàn trước khi lưu vào cơ sở dữ liệu.',
  'settings.privacy.p5_title': '5. Quyền Của Học Viên Đối Với Dữ Liệu (GDPR & Data Ownership)',
  'settings.privacy.p5_text': 'Bạn là chủ sở hữu duy nhất của dữ liệu học tập. Bạn có quyền xem, chỉnh sửa, tải về toàn bộ dữ liệu dưới định dạng JSON độc lập, hoặc yêu cầu xóa vĩnh viễn tài khoản khỏi hệ thống bất kỳ lúc nào.',
  'settings.privacy.p6_title': '6. Chính Sách Bộ Nhớ Cục Bộ (LocalStorage) & Cookies',
  'settings.privacy.p6_text': 'Planora chỉ dùng LocalStorage trình duyệt để ghi nhớ cài đặt giao diện (chế độ sáng/tối, ngôn ngữ lựa chọn) và tạo bản sao lưu dự phòng khi mất kết nối mạng. Không chứa mã theo dõi quảng cáo.',
  'settings.privacy.export_title': 'Tải Về Hồ Sơ Dữ Liệu Cá Nhân',
  'settings.privacy.export_desc': 'Tải trọn vẹn tệp lưu trữ toàn bộ khóa học, bài tập, ghi chú, mục tiêu và thời khóa biểu của bạn.',
  'settings.privacy.export_btn': 'Tải Về Hồ Sơ Cá Nhân (JSON)',
  'settings.privacy.clear_cache_title': 'Xóa Bộ Nhớ Đệm & Cài Đặt Cục Bộ',
  'settings.privacy.clear_cache_desc': 'Dọn sạch dữ liệu tạm trên trình duyệt của máy này mà không ảnh hưởng đến dữ liệu trên máy chủ.',
  'settings.privacy.clear_cache_btn': 'Dọn Sạch Bộ Nhớ Tạm',
  'settings.privacy.clear_confirm': 'Bạn có chắc chắn muốn dọn sạch bộ nhớ tạm? Cài đặt ngôn ngữ và giao diện sẽ được đưa về mặc định.',

  // Appearance Tab
  'settings.appearance.title': 'Chế Độ Hiển Thị & Giao Diện',
  'settings.appearance.desc': 'Tùy chỉnh màu sắc giao diện sáng tối và tối ưu không gian hiển thị cho mắt.',
  'settings.appearance.theme_mode': 'Chủ Đề Màu Sắc',
  'settings.appearance.light': 'Chế Độ Sáng (Light Theme)',
  'settings.appearance.dark': 'Chế Độ Tối (Dark Theme)',
  'settings.appearance.current_mode': 'Hiện tại đang sử dụng',
  'settings.appearance.toggle_theme': 'Chuyển sang',
  'settings.appearance.compact_mode': 'Chế Độ Hiển Thị Gọn (Compact Mode)',
  'settings.appearance.compact_desc': 'Thu hẹp khoảng cách và đệm viền để hiển thị nhiều thông tin hơn trên màn hình máy tính.',
  'settings.appearance.animations': 'Hiệu Ứng Chuyển Động Giao Diện',
  'settings.appearance.animations_desc': 'Bật hoạt ảnh chuyển trang và mở hộp thoại mượt mà.',
  'settings.appearance.accent_color': 'Màu Sắc Nhấn Chủ Đạo',

  // Security Tab
  'settings.security.title': 'Bảo Mật & Đổi Mật Khẩu',
  'settings.security.desc': 'Bảo vệ tài khoản học tập với mật khẩu mạnh mẽ và quản lý các phiên đăng nhập.',
  'settings.security.change_pw': 'Đổi Mật Khẩu Đăng Nhập',
  'settings.security.current_pw': 'Mật khẩu hiện tại',
  'settings.security.new_pw': 'Mật khẩu mới',
  'settings.security.confirm_pw': 'Nhập lại mật khẩu mới',
  'settings.security.update_pw_btn': 'Cập Nhật Mật Khẩu',
  'settings.security.pw_min_length': 'Mật khẩu mới phải có ít nhất 6 ký tự.',
  'settings.security.pw_mismatch': 'Mật khẩu xác nhận không trùng khớp.',
  'settings.security.pw_success': 'Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.',
  'settings.security.two_factor': 'Xác Thực 2 Lớp (2FA Security)',
  'settings.security.two_factor_desc': 'Tăng cường bảo vệ tài khoản bằng mã bảo mật 6 số từ ứng dụng xác thực.',
  'settings.security.two_factor_status': 'Bảo vệ 2FA hiện',
  'settings.security.two_factor_btn_enable': 'Bật Bảo Vệ 2FA',
  'settings.security.two_factor_btn_disable': 'Tắt Bảo Vệ 2FA',
  'settings.security.two_factor_enabled_msg': 'Đã kích hoạt cơ chế mô phỏng xác thực hai lớp (2FA) an toàn.',
  'settings.security.two_factor_disabled_msg': 'Đã tắt tính năng xác thực hai lớp.',
  'settings.security.sessions_title': 'Các Phiên Thiết Bị Đang Đăng Nhập',
  'settings.security.current_device': 'Thiết bị này (Phiên hiện tại)',
  'settings.security.terminate_others': 'Đăng Xuất Mọi Thiết Bị Khác',
  'settings.security.terminate_msg': 'Đã đăng xuất tài khoản khỏi tất cả các thiết bị khác thành công.',

  // Notifications Tab
  'settings.notify.title': 'Tùy Chọn Thông Báo & Nhắc Nhở',
  'settings.notify.desc': 'Tùy chỉnh thông báo để luôn nắm bắt lịch nộp bài mà không bị làm phiền.',
  'settings.notify.deadline': 'Nhắc nhở hạn chót bài tập (Deadlines 24h & 1h)',
  'settings.notify.deadline_desc': 'Nhận cảnh báo sớm khi bài tập đến gần hạn hoàn thành trong 24 giờ.',
  'settings.notify.ai_tips': 'Đề xuất tối ưu hóa từ Gemini AI',
  'settings.notify.ai_tips_desc': 'Nhận phân tích gợi ý chia nhỏ subtask tự động khi bài tập có độ phức tạp cao.',
  'settings.notify.course_updates': 'Cập nhật tài liệu & bài giảng khóa học',
  'settings.notify.course_updates_desc': 'Thông báo khi giảng viên cập nhật tài liệu hoặc thay đổi lịch trình.',
  'settings.notify.sound': 'Âm thanh thông báo trong ứng dụng',
  'settings.notify.sound_desc': 'Phát chuông nhẹ nhàng khi hoàn thành bài tập hoặc đến giờ hẹn lịch học.',
  'settings.notify.quiet_hours': 'Chế Độ Giờ Yên Lặng (Không làm phiền)',
  'settings.notify.quiet_hours_desc': 'Tắt chuông thông báo bài tập từ 23:00 đêm đến 07:00 sáng hôm sau.',

  // AI Preferences Tab
  'settings.ai.title': 'Cấu Hình Trợ Lý Học Tập Gemini AI',
  'settings.ai.desc': 'Tùy chỉnh phong cách giải bài, độ chi tiết và tốc độ phản hồi của AI.',
  'settings.ai.model': 'Cấu hình mô hình AI',
  'settings.ai.model_fast': 'Gemini 2.5 Flash (Tốc độ cao, phản hồi tức thì)',
  'settings.ai.model_deep': 'Gemini 2.5 Pro (Tư duy chuyên sâu, giải thích chi tiết)',
  'settings.ai.depth': 'Độ sâu phân bổ nhiệm vụ (Subtask Breakdown)',
  'settings.ai.depth_standard': 'Chuẩn (3 - 4 bước thực hiện cô đọng)',
  'settings.ai.depth_detailed': 'Chi tiết (5 - 8 bước cụ thể hóa từng khâu)',
  'settings.ai.tone': 'Phong cách văn phong phản hồi',
  'settings.ai.tone_academic': 'Học thuật & Đầy đủ lý thuyết',
  'settings.ai.tone_concise': 'Ngắn gọn, súc tích & Tập trung hành động',
  'settings.ai.tone_friendly': 'Thân thiện, động viên như gia sư đồng hành',
  'settings.ai.auto_suggest': 'Tự động gợi ý lịch học từ đề cương môn',
  'settings.ai.auto_suggest_desc': 'Cho phép AI tự động tính toán thời gian ôn tập hợp lý trước mỗi hạn nộp bài.',

  // Data & Backup Tab
  'settings.data.title': 'Sao Lưu & Bảo Vệ Dữ Liệu Tự Động',
  'settings.data.desc': 'Bảo vệ dữ liệu khóa học và mục tiêu với cơ chế sao lưu định kỳ liên tục.',
  'settings.data.autosave_interval': 'Chu kỳ 5 phút/lần',
  'settings.data.status_label': 'Trạng thái đồng bộ tự động',
  'settings.data.status_desc': 'Hệ thống tự động lưu toàn bộ dữ liệu khoá học, nhiệm vụ và mục tiêu học tập định kỳ mỗi 5 phút để bảo vệ dữ liệu khi mất kết nối mạng đột ngột.',
  'settings.data.last_backup': 'Lần sao lưu gần nhất:',
  'settings.data.backup_now': 'Sao Lưu Ngay Bây Giờ',
  'settings.data.syncing': 'Đang đồng bộ...',
  'settings.data.backup_success': 'Đã sao lưu thành công!',
  'settings.data.danger_title': 'Vùng Nguy Hiểm (Danger Zone)',
  'settings.data.reset_all': 'Đặt Lại Toàn Bộ Dữ Liệu Cục Bộ',
  'settings.data.reset_desc': 'Xóa các dữ liệu nháp trên trình duyệt và nạp lại dữ liệu bài mẫu ban đầu.',
  'settings.data.reset_confirm': 'Bạn có chắc chắn muốn đặt lại dữ liệu cục bộ? Thao tác này không thể hoàn tác.',

  // System & About Tab
  'settings.about.title': 'Thông Tin Hệ Thống & Kiểm Tra',
  'settings.about.desc': 'Kiểm tra phiên bản ứng dụng, tình trạng kết nối máy chủ và giấy phép vận hành.',
  'settings.about.app_name': 'Nền Tảng Quản Lý Học Tập Planora LMS',
  'settings.about.version': 'Phiên bản 1.5.0 (Bản dựng 09/2026)',
  'settings.about.framework': 'React 19 + TypeScript + Tailwind CSS',
  'settings.about.server': 'Node.js Express + MongoDB',
  'settings.about.ai_engine': 'Google Gemini Generative AI SDK',
  'settings.about.license': 'Bản Quyền Giáo Dục & Học Thuật',
  'settings.about.ping_healthy': 'Máy chủ & Cơ sở dữ liệu: Kết nối ổn định (Bình thường)',
  'settings.about.support_contact': 'Bộ phận hỗ trợ kỹ thuật & DPO: support@planora.edu.vn'
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  timeFormat: '24' | '12';
  setTimeFormat: (fmt: '24' | '12') => void;
  firstDayOfWeek: 'mon' | 'sun';
  setFirstDayOfWeek: (day: 'mon' | 'sun') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default system language to English for new users if no stored preference exists
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('planora_language');
      if (saved === 'en' || saved === 'vi') {
        return saved;
      }
      return 'en'; // Default to English for new users
    } catch {
      return 'en';
    }
  });

  const [timeFormat, setTimeFormatState] = useState<'24' | '12'>(() => {
    try {
      const saved = localStorage.getItem('planora_time_format');
      return saved === '12' ? '12' : '24';
    } catch {
      return '24';
    }
  });

  const [firstDayOfWeek, setFirstDayOfWeekState] = useState<'mon' | 'sun'>(() => {
    try {
      const saved = localStorage.getItem('planora_first_day');
      return saved === 'sun' ? 'sun' : 'mon';
    } catch {
      return 'mon';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('planora_language', language);
      document.documentElement.lang = language;
    } catch (e) {
      console.warn('Failed to save language preference', e);
    }
  }, [language]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
  };

  const setTimeFormat = (fmt: '24' | '12') => {
    setTimeFormatState(fmt);
    try {
      localStorage.setItem('planora_time_format', fmt);
    } catch (e) {
      console.warn('Failed to save time format', e);
    }
  };

  const setFirstDayOfWeek = (day: 'mon' | 'sun') => {
    setFirstDayOfWeekState(day);
    try {
      localStorage.setItem('planora_first_day', day);
    } catch (e) {
      console.warn('Failed to save first day', e);
    }
  };

  const translations = useMemo(() => {
    return language === 'vi' ? viTranslations : enTranslations;
  }, [language]);

  const t = (key: string, defaultText?: string): string => {
    if (translations[key]) {
      return translations[key];
    }
    // Fallback to English if Vietnamese is missing or vice-versa
    if (language === 'vi' && enTranslations[key]) {
      return enTranslations[key];
    }
    if (language === 'en' && viTranslations[key]) {
      return viTranslations[key];
    }
    return defaultText ?? key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      timeFormat,
      setTimeFormat,
      firstDayOfWeek,
      setFirstDayOfWeek
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
