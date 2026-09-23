import { Router, Request, Response } from 'express';
import crypto from 'crypto';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'student';
  createdAt: string;
  lastActiveAt?: string;
  phone?: string;
  studentCode?: string;
  faculty?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  schoolName?: string;
}

const ADMIN_EMAIL = (process.env.SEED_SYSTEM_ADMIN_EMAIL || 'systemadmin@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_SYSTEM_ADMIN_PASSWORD || '@Systemadmin';

// Hash helper using Node crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initial in-memory users list with the seeded admin and demo student
const usersStore: UserItem[] = [
  {
    id: 'user-admin-seed',
    name: 'Quản Trị Viên Hệ Thống',
    email: ADMIN_EMAIL,
    passwordHash: hashPassword(ADMIN_PASSWORD),
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
    phone: '0901 234 567',
    studentCode: 'ADMIN-001',
    faculty: 'Quản Trị & Kỹ Thuật Hệ Thống Planora',
    bio: 'Quản trị viên cấp cao chịu trách nhiệm điều hành, bảo mật và phân quyền toàn bộ hệ sinh thái LMS.'
  },
  {
    id: 'user-demo-student',
    name: 'Nguyễn Văn Minh',
    email: 'hocvien@planora.edu.vn',
    passwordHash: hashPassword('hocvien123'),
    role: 'student',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // Online 12 phút trước
    phone: '0987 654 321',
    studentCode: 'IT-2026-8899',
    faculty: 'Công Nghệ Thông Tin & Khoa Học Máy Tính',
    bio: 'Học viên chuyên ngành Kỹ thuật Phần mềm, theo đuổi lập trình Fullstack React & Node.js.'
  },
  {
    id: 'user-demo-student-2',
    name: 'Trần Thị Mai Lan',
    email: 'mailan.tran@planora.edu.vn',
    passwordHash: hashPassword('student456'),
    role: 'student',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Online 2 giờ trước
    phone: '0912 345 678',
    studentCode: 'DS-2026-1042',
    faculty: 'Khoa Học Dữ Liệu & Trí Tuệ Nhân Tạo',
    bio: 'Nghiên cứu thị giác máy tính và học máy nâng cao.'
  },
  {
    id: 'user-demo-student-3',
    name: 'Lê Hoàng Long',
    email: 'hoanglong.le@planora.edu.vn',
    passwordHash: hashPassword('student789'),
    role: 'student',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // Online 1 ngày trước
    phone: '0933 888 999',
    studentCode: 'SE-2026-3021',
    faculty: 'Kỹ Thuật Hệ Thống & Mạng Máy Tính',
    bio: 'Đam mê an toàn thông tin và kiến trúc Cloud DevOps.'
  }
];

// Simple token storage
const sessions = new Map<string, { userId: string; expiresAt: number }>();

function generateToken(userId: string): string {
  const token = 'pln_' + crypto.randomBytes(24).toString('hex');
  // Token valid for 7 days
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });
  return token;
}

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const inputHash = hashPassword(password);

  // Check against usersStore (which includes seeded admin)
  const user = usersStore.find(u => u.email === normalizedEmail);

  if (!user || user.passwordHash !== inputHash) {
    res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không chính xác. Thử lại hoặc dùng tài khoản admin.'
    });
    return;
  }

  const token = generateToken(user.id);

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Vui lòng điền đủ họ tên, email và mật khẩu' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (password.length < 6) {
    res.status(400).json({ success: false, message: 'Mật khẩu phải chứa ít nhất 6 ký tự' });
    return;
  }

  const existing = usersStore.find(u => u.email === normalizedEmail);
  if (existing) {
    res.status(409).json({ success: false, message: 'Email này đã được đăng ký trong hệ thống Planora' });
    return;
  }

  const newUser: UserItem = {
    id: `user-${Date.now()}`,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: 'student',
    createdAt: new Date().toISOString()
  };

  usersStore.push(newUser);
  const token = generateToken(newUser.id);

  res.status(201).json({
    success: true,
    message: 'Đăng ký tài khoản Planora thành công!',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    }
  });
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token || !sessions.has(token)) {
    // Return anonymous state instead of 401 error so client can handle cleanly
    res.json({
      success: true,
      authenticated: false,
      user: null
    });
    return;
  }

  const session = sessions.get(token)!;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    res.json({ success: true, authenticated: false, user: null });
    return;
  }

  const user = usersStore.find(u => u.id === session.userId);
  if (!user) {
    res.json({ success: true, authenticated: false, user: null });
    return;
  }

  // Update last active
  user.lastActiveAt = new Date().toISOString();

  res.json({
    success: true,
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      phone: user.phone,
      studentCode: user.studentCode,
      faculty: user.faculty,
      bio: user.bio,
      avatar: user.avatar,
      coverImage: user.coverImage,
      schoolName: user.schoolName
    }
  });
});

// PUT /api/auth/profile - Update user profile
authRouter.put('/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const { name, phone, studentCode, faculty, bio, avatar, coverImage, schoolName } = req.body;

  let targetUser: UserItem | undefined;
  if (token && sessions.has(token)) {
    const session = sessions.get(token)!;
    targetUser = usersStore.find(u => u.id === session.userId);
  }
  if (!targetUser && usersStore.length > 0) {
    targetUser = usersStore[0];
  }

  if (!targetUser) {
    res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    return;
  }

  if (name !== undefined) targetUser.name = String(name).trim();
  if (phone !== undefined) targetUser.phone = String(phone).trim();
  if (studentCode !== undefined) targetUser.studentCode = String(studentCode).trim();
  if (faculty !== undefined) targetUser.faculty = String(faculty).trim();
  if (bio !== undefined) targetUser.bio = String(bio).trim();
  if (avatar !== undefined) targetUser.avatar = avatar;
  if (coverImage !== undefined) targetUser.coverImage = coverImage;
  if (schoolName !== undefined) targetUser.schoolName = String(schoolName).trim();
  targetUser.lastActiveAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Cập nhật hồ sơ thành công',
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      createdAt: targetUser.createdAt,
      lastActiveAt: targetUser.lastActiveAt,
      phone: targetUser.phone,
      studentCode: targetUser.studentCode,
      faculty: targetUser.faculty,
      bio: targetUser.bio,
      avatar: targetUser.avatar,
      coverImage: targetUser.coverImage,
      schoolName: targetUser.schoolName
    }
  });
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    const session = sessions.get(token);
    if (session) {
      const user = usersStore.find(u => u.id === session.userId);
      if (user) {
        user.lastActiveAt = new Date().toISOString();
      }
    }
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

// GET /api/auth/users (Admin only / full user list with status & profile details)
authRouter.get('/users', (_req: Request, res: Response) => {
  const publicUsers = usersStore.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    lastActiveAt: u.lastActiveAt || u.createdAt,
    phone: u.phone || '',
    studentCode: u.studentCode || '',
    faculty: u.faculty || '',
    bio: u.bio || ''
  }));
  res.json({ success: true, count: publicUsers.length, data: publicUsers });
});

// POST /api/auth/users (Admin creates new account)
authRouter.post('/users', (req: Request, res: Response) => {
  const { name, email, password, role, phone, studentCode, faculty, bio } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
    return;
  }
  const normEmail = String(email).trim().toLowerCase();
  if (usersStore.some(u => u.email === normEmail)) {
    res.status(409).json({ success: false, message: 'Email này đã tồn tại trong hệ thống' });
    return;
  }

  const newUser: UserItem = {
    id: `user-${Date.now()}`,
    name: String(name).trim(),
    email: normEmail,
    passwordHash: hashPassword(password),
    role: role === 'admin' ? 'admin' : 'student',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    phone: phone || '',
    studentCode: studentCode || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    faculty: faculty || 'Khoa Công Nghệ Thông Tin',
    bio: bio || ''
  };

  usersStore.unshift(newUser);
  res.status(201).json({
    success: true,
    message: 'Tạo tài khoản mới thành công',
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
      lastActiveAt: newUser.lastActiveAt,
      phone: newUser.phone,
      studentCode: newUser.studentCode,
      faculty: newUser.faculty,
      bio: newUser.bio
    }
  });
});

// PUT /api/auth/users/:id (Admin updates user profile and role)
authRouter.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = usersStore.find(u => u.id === id);
  if (!user) {
    res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản người dùng' });
    return;
  }

  const { name, email, role, phone, studentCode, faculty, bio, password } = req.body;

  if (email) {
    const normEmail = String(email).trim().toLowerCase();
    const duplicate = usersStore.find(u => u.id !== id && u.email === normEmail);
    if (duplicate) {
      res.status(409).json({ success: false, message: 'Email này đang được dùng bởi tài khoản khác' });
      return;
    }
    user.email = normEmail;
  }

  if (name) user.name = String(name).trim();
  if (role && (role === 'admin' || role === 'student')) user.role = role;
  if (phone !== undefined) user.phone = phone;
  if (studentCode !== undefined) user.studentCode = studentCode;
  if (faculty !== undefined) user.faculty = faculty;
  if (bio !== undefined) user.bio = bio;
  if (password && String(password).trim().length >= 6) {
    user.passwordHash = hashPassword(String(password).trim());
  }

  res.json({
    success: true,
    message: 'Cập nhật tài khoản thành công',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      phone: user.phone,
      studentCode: user.studentCode,
      faculty: user.faculty,
      bio: user.bio
    }
  });
});

// DELETE /api/auth/users/:id (Admin deletes user account)
authRouter.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = usersStore.findIndex(u => u.id === id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản cần xóa' });
    return;
  }

  const user = usersStore[index];
  if (user.email === ADMIN_EMAIL) {
    res.status(403).json({ success: false, message: 'Không thể xóa tài khoản Quản trị viên gốc của hệ thống' });
    return;
  }

  // Remove active sessions for this user
  for (const [tokenKey, sess] of sessions.entries()) {
    if (sess.userId === id) {
      sessions.delete(tokenKey);
    }
  }

  usersStore.splice(index, 1);
  res.json({ success: true, message: `Đã xóa tài khoản "${user.name}" thành công` });
});
