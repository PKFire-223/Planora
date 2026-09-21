import { Router, Request, Response } from 'express';
import crypto from 'crypto';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'student';
  createdAt: string;
}

const ADMIN_EMAIL = (process.env.SEED_SYSTEM_ADMIN_EMAIL || 'systemadmin@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_SYSTEM_ADMIN_PASSWORD || '@Systemadmin';

// Hash helper using Node crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initial in-memory users list with the seeded admin
const usersStore: UserItem[] = [
  {
    id: 'user-admin-seed',
    name: 'Quản Trị Viên Hệ Thống',
    email: ADMIN_EMAIL,
    passwordHash: hashPassword(ADMIN_PASSWORD),
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-demo-student',
    name: 'Nguyễn Văn Minh',
    email: 'hocvien@planora.edu.vn',
    passwordHash: hashPassword('hocvien123'),
    role: 'student',
    createdAt: new Date().toISOString()
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

  res.json({
    success: true,
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

// GET /api/auth/users (for Admin overview)
authRouter.get('/users', (_req: Request, res: Response) => {
  const publicUsers = usersStore.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
  res.json({ success: true, count: publicUsers.length, data: publicUsers });
});
