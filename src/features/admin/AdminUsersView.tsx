import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  GraduationCap, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone, 
  School, 
  AlertCircle,
  X,
  Save,
  RefreshCw,
  Lock,
  UserCheck
} from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

// Format last seen duration in Vietnamese
function formatLastSeen(lastActiveAt?: string, isOnline?: boolean): string {
  if (isOnline) return 'Đang trực tuyến';
  if (!lastActiveAt) return 'Chưa có hoạt động';

  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa mới xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return new Date(lastActiveAt).toLocaleDateString('vi-VN');
}

// Calculate online status: consider active if within last 5 minutes
function checkIsOnline(lastActiveAt?: string): boolean {
  if (!lastActiveAt) return false;
  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  return diffMs <= 5 * 60 * 1000;
}

export function AdminUsersView() {
  const { isDark } = useTheme();
  const { user: currentUser, isAdmin, token } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  // Modal states
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit / Create Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'admin' | 'student',
    phone: '',
    studentCode: '',
    faculty: '',
    bio: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAllUsers(token || undefined);
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch {
      // Handled by api fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Auto refresh users list every 30 seconds to update online status
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Open Edit Modal
  const handleOpenEdit = (targetUser: User) => {
    setEditingUser(targetUser);
    setFormData({
      name: targetUser.name,
      email: targetUser.email,
      password: '',
      role: targetUser.role,
      phone: targetUser.phone || '',
      studentCode: targetUser.studentCode || '',
      faculty: targetUser.faculty || '',
      bio: targetUser.bio || ''
    });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      phone: '',
      studentCode: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      faculty: 'Khoa Công Nghệ Thông Tin & Khoa Học Máy Tính',
      bio: ''
    });
    setIsCreateModalOpen(true);
  };

  // Submit Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const payload: Partial<User> & { password?: string } = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        studentCode: formData.studentCode,
        faculty: formData.faculty,
        bio: formData.bio
      };
      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const res = await api.updateUserByAdmin(editingUser.id, payload, token || undefined);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...res.data } : u));
        if (viewingUser && viewingUser.id === editingUser.id) {
          setViewingUser(prev => prev ? { ...prev, ...res.data } : null);
        }
        showFeedback('success', `Đã cập nhật thông tin tài khoản "${formData.name}" thành công!`);
        setEditingUser(null);
      } else {
        showFeedback('error', res.message || 'Không thể cập nhật tài khoản');
      }
    } catch (err: any) {
      showFeedback('error', err?.message || 'Lỗi khi cập nhật tài khoản');
    }
  };

  // Submit Create New User
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showFeedback('error', 'Vui lòng điền đầy đủ họ tên, email và mật khẩu');
      return;
    }

    try {
      const res = await api.createUserByAdmin(formData, token || undefined);
      if (res.success) {
        setUsers(prev => [res.data, ...prev]);
        showFeedback('success', `Đã tạo tài khoản mới cho "${res.data.name}" thành công!`);
        setIsCreateModalOpen(false);
      } else {
        showFeedback('error', res.message || 'Không thể tạo tài khoản');
      }
    } catch (err: any) {
      showFeedback('error', err?.message || 'Lỗi khi tạo tài khoản');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      const res = await api.deleteUserByAdmin(deletingUser.id, token || undefined);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
        if (viewingUser && viewingUser.id === deletingUser.id) {
          setViewingUser(null);
        }
        showFeedback('success', res.message || `Đã xóa tài khoản "${deletingUser.name}"`);
        setDeletingUser(null);
      } else {
        showFeedback('error', res.message || 'Không thể xóa tài khoản');
      }
    } catch (err: any) {
      showFeedback('error', err?.message || 'Lỗi khi xóa tài khoản');
    }
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.studentCode && u.studentCode.toLowerCase().includes(search.toLowerCase())) ||
        (u.faculty && u.faculty.toLowerCase().includes(search.toLowerCase()));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      const isOnline = checkIsOnline(u.lastActiveAt);
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'online' && isOnline) || 
        (statusFilter === 'offline' && !isOnline);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const online = users.filter(u => checkIsOnline(u.lastActiveAt)).length;
    const admins = users.filter(u => u.role === 'admin').length;
    const students = users.filter(u => u.role === 'student').length;
    return { total, online, offline: total - online, admins, students };
  }, [users]);

  // If not admin, restrict view
  if (!isAdmin) {
    return (
      <div className={`p-8 rounded-2xl border text-center max-w-lg mx-auto mt-12 ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}>
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold mb-2">Quyền Truy Cập Bị Giới Hạn</h3>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
          Trang quản lý dữ liệu tài khoản và giám sát trạng thái online chỉ dành riêng cho tài khoản có vai trò <strong>Quản Trị Viên (Admin)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs animate-in fade-in duration-200 ${
          actionMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="font-medium">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner & Stats Overview */}
      <div className={`p-5 sm:p-6 rounded-2xl border relative overflow-hidden transition-colors ${
        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1">
              <Users className="w-4 h-4 shrink-0" />
              <span>Quản Lý Tài Khoản & Giám Sát Hoạt Động (Admin Only)</span>
            </div>
            <p className={`text-xs max-w-2xl leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              Xem toàn bộ danh sách tài khoản thành viên trong hệ thống, kiểm tra chi tiết thông tin cá nhân, theo dõi trạng thái Online / Offline (khoảng thời gian truy cập gần nhất), chỉnh sửa và xóa tài khoản.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
            <button
              onClick={fetchUsers}
              disabled={loading}
              title="Làm mới danh sách"
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Tài Khoản Mới</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-neutral-800">
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">Tổng tài khoản</div>
            <div className="text-xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{stats.total}</div>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đang Online</span>
            </div>
            <div className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats.online}</div>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">Quản Trị Viên</div>
            <div className="text-xl font-bold mt-1 text-rose-600 dark:text-rose-400">{stats.admins}</div>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/60 border-neutral-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">Học viên</div>
            <div className="text-xl font-bold mt-1 text-sky-600 dark:text-sky-400">{stats.students}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, MSSV, khoa viện..."
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
              isDark ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
        </div>

        {/* Role and Online Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role select */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className={`px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${
              isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-200' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản Trị Viên (Admin)</option>
            <option value="student">Học Viên (Student)</option>
          </select>

          {/* Status select */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className={`px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${
              isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-200' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="online">🟢 Đang Online</option>
            <option value="offline">⚪ Đã Offline</option>
          </select>
        </div>
      </div>

      {/* Users Table / List */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'bg-neutral-950/70 border-neutral-800 text-neutral-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <th className="py-3 px-4">Tài khoản & Người dùng</th>
                <th className="py-3 px-4">Trạng thái Online</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4 hidden md:table-cell">Mã định danh / Khoa</th>
                <th className="py-3 px-4 hidden sm:table-cell">Ngày tạo</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`py-12 text-center text-xs ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                    Không tìm thấy tài khoản nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(userItem => {
                  const isOnline = checkIsOnline(userItem.lastActiveAt);
                  const isCurrentAuthUser = currentUser?.id === userItem.id;
                  const isSeedAdmin = userItem.email.toLowerCase() === 'systemadmin@gmail.com';

                  return (
                    <tr 
                      key={userItem.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 relative ${
                            userItem.role === 'admin'
                              ? 'bg-rose-500/15 text-rose-500'
                              : 'bg-indigo-500/15 text-indigo-600'
                          }`}>
                            {userItem.role === 'admin' ? <Shield className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                            {/* Online dot indicator on avatar */}
                            <span className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-neutral-900 ${
                              isOnline ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-neutral-600'
                            }`} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold truncate text-slate-900 dark:text-white">
                                {userItem.name}
                              </span>
                              {isCurrentAuthUser && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-500">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{userItem.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Online Status + Duration */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-neutral-600'
                            }`} />
                            <span className={`font-semibold text-xs ${
                              isOnline 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-slate-600 dark:text-neutral-400'
                            }`}>
                              {isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <span className={`text-[10px] mt-0.5 flex items-center gap-1 ${
                            isDark ? 'text-neutral-500' : 'text-slate-400'
                          }`}>
                            <Clock className="w-2.5 h-2.5" />
                            {formatLastSeen(userItem.lastActiveAt, isOnline)}
                          </span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          userItem.role === 'admin'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {userItem.role === 'admin' ? (
                            <>
                              <Shield className="w-3 h-3" />
                              <span>Admin</span>
                            </>
                          ) : (
                            <>
                              <GraduationCap className="w-3 h-3" />
                              <span>Học Viên</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Code & Faculty */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="text-slate-900 dark:text-neutral-200 font-medium">
                          {userItem.studentCode || 'Chưa cập nhật'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate max-w-[200px]">
                          {userItem.faculty || 'Chưa phân khoa'}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 hidden sm:table-cell text-slate-500 dark:text-neutral-400 text-[11px]">
                        {new Date(userItem.createdAt).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* View Info */}
                          <button
                            type="button"
                            onClick={() => setViewingUser(userItem)}
                            title="Xem thông tin chi tiết"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'hover:bg-neutral-800 text-sky-400' : 'hover:bg-sky-50 text-sky-600'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(userItem)}
                            title="Chỉnh sửa thông tin tài khoản"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? 'hover:bg-neutral-800 text-amber-400' : 'hover:bg-amber-50 text-amber-600'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            type="button"
                            disabled={isSeedAdmin}
                            onClick={() => setDeletingUser(userItem)}
                            title={isSeedAdmin ? 'Không thể xóa Admin hệ thống gốc' : 'Xóa tài khoản này'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSeedAdmin
                                ? 'opacity-30 cursor-not-allowed text-slate-400'
                                : isDark ? 'hover:bg-neutral-800 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW USER DETAILS */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-all ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  viewingUser.role === 'admin' ? 'bg-rose-500/20 text-rose-500' : 'bg-indigo-500/20 text-indigo-600'
                }`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Hồ Sơ Tài Khoản Chi Tiết</h3>
                  <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>ID: {viewingUser.id}</p>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Status Header */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-neutral-950/70 border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400 block">Trạng thái kết nối</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      checkIsOnline(viewingUser.lastActiveAt) ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`} />
                    <span className="font-bold text-xs">
                      {checkIsOnline(viewingUser.lastActiveAt) ? 'Đang Trực Tuyến (Online)' : 'Đang Ngoại Tuyến (Offline)'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400 block">Thời gian hoạt động</span>
                  <span className="font-medium text-xs text-indigo-600 dark:text-indigo-400">
                    {formatLastSeen(viewingUser.lastActiveAt, checkIsOnline(viewingUser.lastActiveAt))}
                  </span>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold">Họ và Tên</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{viewingUser.name}</div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold">Email Đăng Nhập</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{viewingUser.email}</div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold">Vai Trò Hệ Thống</span>
                  <div className="mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      viewingUser.role === 'admin' ? 'bg-rose-500/20 text-rose-500' : 'bg-indigo-500/20 text-indigo-600'
                    }`}>
                      {viewingUser.role === 'admin' ? 'Quản Trị Viên (Admin)' : 'Học Viên (Student)'}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold">Mã Học Viên / MSSV</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{viewingUser.studentCode || 'N/A'}</div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold">Số Điện Thoại</span>
                  <div className="font-medium text-slate-900 dark:text-white mt-0.5">{viewingUser.phone || 'Chưa cung cấp'}</div>
                </div>

                <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold">Ngày Tạo Tài Khoản</span>
                  <div className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {new Date(viewingUser.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Faculty */}
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold">Khoa / Bộ Môn Đào Tạo</span>
                <div className="font-medium text-slate-900 dark:text-white mt-0.5">
                  {viewingUser.faculty || 'Chưa phân bổ khoa'}
                </div>
              </div>

              {/* Bio */}
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-neutral-950/50 border-neutral-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold">Tiểu Sử / Giới Thiệu Bản Thân</span>
                <p className={`mt-0.5 leading-relaxed text-xs ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                  {viewingUser.bio || 'Chưa có thông tin giới thiệu.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  const target = viewingUser;
                  setViewingUser(null);
                  handleOpenEdit(target);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh Sửa Hồ Sơ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-all max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Chỉnh Sửa Tài Khoản</h3>
                  <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>ID: {editingUser.id}</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Họ và Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Email Đăng Nhập *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Vai Trò (Role) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="student">Học Viên (Student)</option>
                    <option value="admin">Quản Trị Viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Mã Định Danh / MSSV
                  </label>
                  <input
                    type="text"
                    value={formData.studentCode}
                    onChange={e => setFormData({ ...formData, studentCode: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Đổi Mật Khẩu (Để trống nếu không đổi)
                  </label>
                  <input
                    type="password"
                    placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Khoa / Chuyên Ngành Đào Tạo
                </label>
                <input
                  type="text"
                  value={formData.faculty}
                  onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Tiểu Sử / Giới Thiệu
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE USER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border transition-all max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Thêm Tài Khoản Mới</h3>
                  <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>Tạo người dùng mới trong hệ thống LMS</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Họ và Tên *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Trần Văn Bình"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Email Đăng Nhập *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="VD: binh.tran@planora.edu.vn"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Mật Khẩu Khởi Tạo *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ít nhất 6 ký tự"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Vai Trò (Role) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="student">Học Viên (Student)</option>
                    <option value="admin">Quản Trị Viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Mã Học Viên / MSSV
                  </label>
                  <input
                    type="text"
                    value={formData.studentCode}
                    onChange={e => setFormData({ ...formData, studentCode: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 0987 123 456"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Khoa / Chuyên Ngành
                </label>
                <input
                  type="text"
                  value={formData.faculty}
                  onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Tiểu Sử
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả tóm tắt..."
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Tài Khoản</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold mb-2">Xác Nhận Xóa Tài Khoản?</h3>
            <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              Bạn có chắc chắn muốn xóa tài khoản của <strong>{deletingUser.name}</strong> ({deletingUser.email}) khỏi hệ thống? Hành động này sẽ thu hồi toàn bộ quyền truy cập và phiên đăng nhập của người dùng này.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isDark ? 'bg-neutral-800 text-neutral-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
