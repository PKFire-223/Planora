import { Search, Bell, Sparkles, User } from 'lucide-react';
import { ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenAi: () => void;
}

export function Header({ activeTab, onOpenAi }: HeaderProps) {
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Bảng Điều Khiển Học Tập',
      subtitle: 'Theo dõi tiến độ khoá học, nhiệm vụ hôm nay và mục tiêu cá nhân.'
    },
    courses: {
      title: 'Quản Lý Khoá Học (Courses)',
      subtitle: 'Danh sách các môn học, tiến độ bài học và tài liệu tham khảo.'
    },
    tasks: {
      title: 'Bài Tập & Nhiệm Vụ (Tasks)',
      subtitle: 'Quản lý deadline, bài tập thực hành và tính năng tự động chia nhỏ bằng AI.'
    },
    notes: {
      title: 'Ghi Chú Học Tập (Notes)',
      subtitle: 'Lưu trữ tóm tắt kiến thức, tài liệu Markdown và mẹo lập trình.'
    },
    goals: {
      title: 'Mục Tiêu Cá Nhân (Goals)',
      subtitle: 'Thiết lập KPI tự học, số giờ nghiên cứu và số lượng bài tập.'
    },
    ai: {
      title: 'AI Study Assistant',
      subtitle: 'Trợ lý học tập thông minh: hỏi đáp, giải thích thuật toán & lên lộ trình.'
    },
    errors: {
      title: 'Báo Cáo & Sửa Lỗi (Error Tracker)',
      subtitle: 'Ghi nhận phản hồi lỗi hệ thống, debug stack trace và kiểm soát chất lượng code.'
    },
    structure: {
      title: 'Cấu Trúc Thư Mục Dự Án (Tree View)',
      subtitle: 'Thiết kế khung sườn phân chia file/folder chuẩn Full-Stack theo yêu cầu.'
    }
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <span>{current.title}</span>
        </h2>
        <p className="text-xs text-neutral-400 hidden sm:block">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAi}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Hỏi AI Trợ Lý</span>
        </button>

        <div className="h-4 w-px bg-neutral-800" />

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
          <div className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 flex items-center justify-center font-semibold text-[11px]">
            PK
          </div>
          <span className="font-medium hidden md:inline">Sinh Viên (Full Stack)</span>
        </div>
      </div>
    </header>
  );
}
