import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { UserItem } from '../../types';
import { UserModel } from '../../models/user.model';

const ADMIN_EMAIL = (process.env.SEED_SYSTEM_ADMIN_EMAIL || 'systemadmin@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_SYSTEM_ADMIN_PASSWORD || '@Systemadmin';

// Hash helper using Node crypto
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function loadInitialUsers(): UserItem[] {
  const users: UserItem[] = [
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
    }
  ];

  // Dynamically load additional sample users if sampleData.json exists
  const sampleFilePath = path.join(process.cwd(), 'server', 'seed', 'sampleData.json');
  if (fs.existsSync(sampleFilePath)) {
    try {
      const raw = fs.readFileSync(sampleFilePath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.users)) {
        for (const u of data.users) {
          if (!users.some(existing => existing.email === u.email.toLowerCase())) {
            users.push({
              ...u,
              email: u.email.toLowerCase()
            });
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return users;
}

// In-memory users store
export const usersStore: UserItem[] = loadInitialUsers();

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
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const inputHash = hashPassword(password);

  let user = usersStore.find(u => u.email === normalizedEmail);

  // If not in memory store, check MongoDB if connected
  if (!user && mongoose.connection.readyState === 1) {
    try {
      const dbUser = await UserModel.findOne({ email: normalizedEmail }).lean();
      if (dbUser) {
        user = dbUser as unknown as UserItem;
        usersStore.push(user);
      }
    } catch {
      // fallback
    }
  }

  if (!user || user.passwordHash !== inputHash) {
    res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không chính xác. Thử lại hoặc dùng tài khoản admin.'
    });
    return;
  }

  const token = generateToken(user.id);
  user.lastActiveAt = new Date().toISOString();

  if (mongoose.connection.readyState === 1) {
    try {
      await UserModel.findOneAndUpdate({ id: user.id }, { lastActiveAt: user.lastActiveAt });
    } catch {
      // ignore
    }
  }

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
authRouter.post('/register', async (req: Request, res: Response) => {
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

  let existing = usersStore.find(u => u.email === normalizedEmail);
  if (!existing && mongoose.connection.readyState === 1) {
    try {
      existing = await UserModel.findOne({ email: normalizedEmail }).lean() as unknown as UserItem;
    } catch {
      // ignore
    }
  }

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
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    studentCode: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    faculty: 'Khoa Công Nghệ Thông Tin'
  };

  usersStore.push(newUser);

  if (mongoose.connection.readyState === 1) {
    try {
      await UserModel.create(newUser);
    } catch (err: any) {
      console.warn('[Auth] MongoDB create warning:', err.message);
    }
  }

  const token = generateToken(newUser.id);

  res.status(201).json({
    success: true,
    message: 'Đăng ký tài khoản thành công',
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
authRouter.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token || !sessions.has(token)) {
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

  let user = usersStore.find(u => u.id === session.userId);

  if (!user && mongoose.connection.readyState === 1) {
    try {
      const dbUser = await UserModel.findOne({ id: session.userId }).lean();
      if (dbUser) {
        user = dbUser as unknown as UserItem;
        usersStore.push(user);
      }
    } catch {
      // fallback
    }
  }

  if (!user) {
    res.json({ success: true, authenticated: false, user: null });
    return;
  }

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

// PUT /api/auth/profile
authRouter.put('/profile', async (req: Request, res: Response) => {
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

  if (mongoose.connection.readyState === 1) {
    try {
      await UserModel.findOneAndUpdate({ id: targetUser.id }, targetUser, { upsert: true });
    } catch (err: any) {
      console.warn('[Auth] MongoDB profile update warning:', err.message);
    }
  }

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

// GET /api/auth/users (Admin only)
authRouter.get('/users', async (_req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUsers = await UserModel.find().lean();
      if (dbUsers.length > 0) {
        // Sync into usersStore
        for (const dbU of dbUsers) {
          if (!usersStore.some(u => u.id === dbU.id)) {
            usersStore.push(dbU as unknown as UserItem);
          }
        }
      }
    } catch {
      // fallback
    }
  }

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
authRouter.post('/users', async (req: Request, res: Response) => {
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

  if (mongoose.connection.readyState === 1) {
    try {
      await UserModel.create(newUser);
    } catch (err: any) {
      console.warn('[Auth] MongoDB admin user create warning:', err.message);
    }
  }

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

// PUT /api/auth/users/:id (Admin updates user)
authRouter.put('/users/:id', async (req: Request, res: Response) => {
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

  if (mongoose.connection.readyState === 1) {
    try {
      await UserModel.findOneAndUpdate({ id }, user, { upsert: true });
    } catch (err: any) {
      console.warn('[Auth] MongoDB user update warning:', err.message);
    }
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

// DELETE /api/auth/users/:id (Admin deletes user)
authRouter.delete('/users/:id', async (req: Request, res: Response) => {
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

  for (const [tokenKey, sess] of sessions.entries()) {
    if (sess.userId === id) {
      sessions.delete(tokenKey);
    }
  }

  usersStore.splice(index, 1);

  if (mongoose.connection.readyState === 1) {
    try {
      await UserModel.findOneAndDelete({ id });
    } catch (err: any) {
      console.warn('[Auth] MongoDB user delete warning:', err.message);
    }
  }

  res.json({ success: true, message: `Đã xóa tài khoản "${user.name}" thành công` });
});
