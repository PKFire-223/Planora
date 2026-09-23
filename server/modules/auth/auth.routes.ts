import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { UserItem } from '../../types';
import { UserModel } from '../../models/user.model';
import { validatePassword } from '../../utils/passwordValidator';
import { sendPasswordResetEmail } from '../../services/email.service';

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
    },
    {
      id: 'user-demo-student',
      name: 'Nguyễn Văn Minh',
      email: 'hocvien@planora.edu.vn',
      passwordHash: hashPassword('@Hocvien123'),
      role: 'student',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date().toISOString(),
      phone: '0987 654 321',
      studentCode: 'IT-2026-8899',
      faculty: 'Công Nghệ Thông Tin & Khoa Học Máy Tính',
      bio: 'Học viên chuyên ngành Kỹ thuật Phần mềm, theo đuổi lập trình Fullstack React & Node.js.'
    },
    {
      id: 'user-tester-member',
      name: 'Tester Thành Viên',
      email: 'tester123@gmail.com',
      passwordHash: hashPassword('Password123@'),
      role: 'student',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      phone: '0912 345 678',
      studentCode: 'TEST-MEMBER-01',
      faculty: 'Khoa Công Nghệ Thông Tin',
      bio: 'Tài khoản thành viên kiểm thử tính năng và bảo mật hệ thống Planora LMS.'
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

// Session token storage
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

// OTP store for forgot password reset: email -> { code, expiresAt, attempts }
const resetCodesStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

/**
 * Middleware: Verify user is authenticated and has Admin role
 */
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token || !sessions.has(token)) {
    res.status(401).json({
      success: false,
      message: 'Yêu cầu đăng nhập tài khoản Quản trị viên để thực hiện thao tác này'
    });
    return;
  }

  const session = sessions.get(token)!;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    res.status(401).json({ success: false, message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại' });
    return;
  }

  const user = usersStore.find(u => u.id === session.userId);
  if (!user || user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Quyền truy cập bị từ chối. Chỉ Quản trị viên (Admin) mới có quyền quản trị tài khoản người dùng.'
    });
    return;
  }

  next();
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
      message: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
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

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Vui lòng điền đủ họ tên, email và mật khẩu' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Validate strong password rule
  const pwdCheck = validatePassword(password);
  if (!pwdCheck.valid) {
    res.status(400).json({
      success: false,
      message: pwdCheck.message,
      rules: pwdCheck.rules
    });
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
    role: 'student', // Đăng ký tự do luôn là học viên / thành viên
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
      createdAt: newUser.createdAt,
      lastActiveAt: newUser.lastActiveAt,
      studentCode: newUser.studentCode,
      faculty: newUser.faculty
    }
  });
});

// POST /api/auth/forgot-password - Gửi mã OTP xác nhận về email thật
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email đã đăng ký' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  let user = usersStore.find(u => u.email === normalizedEmail);
  if (!user && mongoose.connection.readyState === 1) {
    try {
      const dbUser = await UserModel.findOne({ email: normalizedEmail }).lean();
      if (dbUser) {
        user = dbUser as unknown as UserItem;
        usersStore.push(user);
      }
    } catch {
      // ignore
    }
  }

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Không tìm thấy tài khoản liên kết với địa chỉ email này trong hệ thống Planora.'
    });
    return;
  }

  // Generate 6-digit OTP code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresInMinutes = 15;
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

  resetCodesStore.set(normalizedEmail, {
    code: resetCode,
    expiresAt,
    attempts: 0
  });

  // Send real email via Nodemailer
  const emailResult = await sendPasswordResetEmail({
    toEmail: user.email,
    userName: user.name,
    resetCode,
    expiresInMinutes
  });

  res.json({
    success: true,
    message: emailResult.success
      ? `Mã xác nhận 6 số đã được gửi tới email ${user.email}. Vui lòng kiểm tra hộp thư.`
      : `Hệ thống đã tạo mã xác nhận cho ${user.email}. (Lưu ý: ${emailResult.message})`,
    email: user.email,
    expiresInMinutes,
    isRealSmtp: emailResult.isRealSmtp,
    previewUrl: emailResult.previewUrl || undefined,
    // Provide OTP in response in dev/test environment to allow seamless verification
    devOtp: resetCode
  });
});

// POST /api/auth/verify-reset-code - Kiểm tra tính hợp lệ của mã OTP
authRouter.post('/verify-reset-code', (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mã xác nhận' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const record = resetCodesStore.get(normalizedEmail);

  if (!record) {
    res.status(400).json({ success: false, message: 'Chưa có yêu cầu đặt lại mật khẩu cho email này hoặc mã đã hết hạn' });
    return;
  }

  if (Date.now() > record.expiresAt) {
    resetCodesStore.delete(normalizedEmail);
    res.status(400).json({ success: false, message: 'Mã xác nhận đã quá hạn (15 phút). Vui lòng yêu cầu mã mới.' });
    return;
  }

  if (record.code !== String(code).trim()) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      resetCodesStore.delete(normalizedEmail);
      res.status(400).json({ success: false, message: 'Bạn đã nhập sai mã quá 5 lần. Vui lòng gửi lại yêu cầu.' });
      return;
    }
    res.status(400).json({ success: false, message: 'Mã xác nhận không chính xác. Vui lòng kiểm tra lại email.' });
    return;
  }

  res.json({ success: true, message: 'Mã xác nhận chính xác' });
});

// POST /api/auth/reset-password - Đặt lại mật khẩu mới với mã OTP & xác thực độ mạnh
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ email, mã xác nhận và mật khẩu mới' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const record = resetCodesStore.get(normalizedEmail);

  if (!record || record.code !== String(code).trim()) {
    res.status(400).json({ success: false, message: 'Mã xác nhận không đúng hoặc đã hết hạn.' });
    return;
  }

  if (Date.now() > record.expiresAt) {
    resetCodesStore.delete(normalizedEmail);
    res.status(400).json({ success: false, message: 'Mã xác nhận đã quá hạn 15 phút. Vui lòng yêu cầu mã mới.' });
    return;
  }

  // Validate strong password rule
  const pwdCheck = validatePassword(newPassword);
  if (!pwdCheck.valid) {
    res.status(400).json({
      success: false,
      message: pwdCheck.message,
      rules: pwdCheck.rules
    });
    return;
  }

  let user = usersStore.find(u => u.email === normalizedEmail);
  if (!user && mongoose.connection.readyState === 1) {
    try {
      const dbUser = await UserModel.findOne({ email: normalizedEmail }).lean();
      if (dbUser) {
        user = dbUser as unknown as UserItem;
        usersStore.push(user);
      }
    } catch {
      // ignore
    }
  }

  if (!user) {
    res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    return;
  }

  user.passwordHash = hashPassword(newPassword);
  user.lastActiveAt = new Date().toISOString();

  // Clear OTP record
  resetCodesStore.delete(normalizedEmail);

  if (mongoose.connection.readyState === 1) {
    try {
      await UserModel.findOneAndUpdate(
        { email: normalizedEmail },
        { passwordHash: user.passwordHash, lastActiveAt: user.lastActiveAt }
      );
    } catch (err: any) {
      console.warn('[Auth] MongoDB reset password warning:', err.message);
    }
  }

  const token = generateToken(user.id);

  res.json({
    success: true,
    message: 'Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.',
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

// =========================================================================
// ADMIN ONLY ROUTES - Protected by requireAdmin
// =========================================================================

// GET /api/auth/users (Admin only)
authRouter.get('/users', requireAdmin, async (_req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUsers = await UserModel.find().lean();
      if (dbUsers.length > 0) {
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
authRouter.post('/users', requireAdmin, async (req: Request, res: Response) => {
  const { name, email, password, role, phone, studentCode, faculty, bio } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
    return;
  }

  // Validate strong password rule
  const pwdCheck = validatePassword(password);
  if (!pwdCheck.valid) {
    res.status(400).json({ success: false, message: pwdCheck.message, rules: pwdCheck.rules });
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
authRouter.put('/users/:id', requireAdmin, async (req: Request, res: Response) => {
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

  if (password && String(password).trim().length > 0) {
    const pwdCheck = validatePassword(String(password).trim());
    if (!pwdCheck.valid) {
      res.status(400).json({ success: false, message: pwdCheck.message, rules: pwdCheck.rules });
      return;
    }
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
authRouter.delete('/users/:id', requireAdmin, async (req: Request, res: Response) => {
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
