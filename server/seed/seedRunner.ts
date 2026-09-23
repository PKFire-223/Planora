import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { UserModel } from '../models/user.model';
import { CourseModel } from '../models/course.model';
import { TaskModel } from '../models/task.model';
import { NoteModel } from '../models/note.model';
import { GoalModel } from '../models/goal.model';
import { ErrorReportModel } from '../models/error.model';
import { TimetableModel } from '../models/timetable.model';

export async function runDatabaseSeed(customUri?: string) {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/personal_lms';
  const sampleFilePath = path.join(process.cwd(), 'server', 'seed', 'sampleData.json');

  console.log('\n🌱 ======================================================');
  console.log('🌱  PLANORA LMS - MONGODB SEEDING UTILITY');
  console.log('🌱 ======================================================');
  console.log(`[Seed] Target Database: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  if (!fs.existsSync(sampleFilePath)) {
    console.log(`[Seed] ⚠️  Tệp dữ liệu mẫu 'server/seed/sampleData.json' không tồn tại.`);
    console.log(`[Seed] Có thể bạn đã xoá tệp này sau khi hoàn tất nạp dữ liệu.`);
    console.log(`[Seed] Hệ thống vẫn an toàn và không bị xung đột logic.\n`);
    return { success: false, reason: 'FILE_NOT_FOUND' };
  }

  let rawData = '';
  try {
    rawData = fs.readFileSync(sampleFilePath, 'utf-8');
  } catch (err: any) {
    console.error(`[Seed] ❌ Không thể đọc tệp dữ liệu mẫu: ${err.message}`);
    return { success: false, reason: 'READ_ERROR' };
  }

  let data: any;
  try {
    data = JSON.parse(rawData);
  } catch (err: any) {
    console.error(`[Seed] ❌ Định dạng JSON trong sampleData.json không hợp lệ: ${err.message}`);
    return { success: false, reason: 'PARSE_ERROR' };
  }

  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('[Seed] ✅ Kết nối MongoDB thành công.');
  } catch (err: any) {
    console.error(`[Seed] ❌ Không thể kết nối MongoDB: ${err.message}`);
    console.error('[Seed] 👉 Vui lòng kiểm tra MONGODB_URI hoặc đảm bảo MongoDB service đang chạy.');
    return { success: false, reason: 'CONNECTION_FAILED' };
  }

  const results: Record<string, number> = {};

  try {
    // 1. Seed Users
    if (Array.isArray(data.users) && data.users.length > 0) {
      for (const u of data.users) {
        await UserModel.findOneAndUpdate({ id: u.id }, u, { upsert: true, new: true });
      }
      results.users = data.users.length;
    }

    // 2. Seed Courses
    if (Array.isArray(data.courses) && data.courses.length > 0) {
      for (const c of data.courses) {
        await CourseModel.findOneAndUpdate({ id: c.id }, c, { upsert: true, new: true });
      }
      results.courses = data.courses.length;
    }

    // 3. Seed Tasks
    if (Array.isArray(data.tasks) && data.tasks.length > 0) {
      for (const t of data.tasks) {
        await TaskModel.findOneAndUpdate({ id: t.id }, t, { upsert: true, new: true });
      }
      results.tasks = data.tasks.length;
    }

    // 4. Seed Notes
    if (Array.isArray(data.notes) && data.notes.length > 0) {
      for (const n of data.notes) {
        await NoteModel.findOneAndUpdate({ id: n.id }, n, { upsert: true, new: true });
      }
      results.notes = data.notes.length;
    }

    // 5. Seed Goals
    if (Array.isArray(data.goals) && data.goals.length > 0) {
      for (const g of data.goals) {
        await GoalModel.findOneAndUpdate({ id: g.id }, g, { upsert: true, new: true });
      }
      results.goals = data.goals.length;
    }

    // 6. Seed Error Reports
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      for (const e of data.errors) {
        await ErrorReportModel.findOneAndUpdate({ id: e.id }, e, { upsert: true, new: true });
      }
      results.errors = data.errors.length;
    }

    // 7. Seed Timetable
    if (Array.isArray(data.timetable) && data.timetable.length > 0) {
      for (const tt of data.timetable) {
        await TimetableModel.findOneAndUpdate({ id: tt.id }, tt, { upsert: true, new: true });
      }
      results.timetable = data.timetable.length;
    }

    console.log('\n📊 KẾT QUẢ ĐẨY DỮ LIỆU VÀO MONGODB THÀNH CÔNG:');
    console.log('------------------------------------------------------');
    console.log(` • Người dùng (users):        ${results.users ?? 0} bản ghi`);
    console.log(` • Môn học (courses):         ${results.courses ?? 0} bản ghi`);
    console.log(` • Nhiệm vụ (tasks):          ${results.tasks ?? 0} bản ghi`);
    console.log(` • Ghi chú (notes):           ${results.notes ?? 0} bản ghi`);
    console.log(` • Mục tiêu (goals):          ${results.goals ?? 0} bản ghi`);
    console.log(` • Báo cáo lỗi (error_logs):  ${results.errors ?? 0} bản ghi`);
    console.log(` • Thời khoá biểu (timetable): ${results.timetable ?? 0} bản ghi`);
    console.log('------------------------------------------------------');
    console.log('💡 Ghi chú: Dữ liệu mẫu nằm riêng biệt trong "server/seed/sampleData.json".');
    console.log('💡 Sau khi đã đẩy dữ liệu vào MongoDB, bạn có thể xoá file này bất cứ lúc nào');
    console.log('   mà không gây bất kỳ lỗi import hay xung đột code nào trong dự án!\n');

    return { success: true, counts: results };
  } catch (seedErr: any) {
    console.error(`[Seed] ❌ Lỗi trong quá trình nạp dữ liệu: ${seedErr.message}`);
    return { success: false, reason: 'INSERTION_ERROR', error: seedErr.message };
  } finally {
    await mongoose.disconnect();
  }
}

// If executed directly from command line (tsx server/seed/seedRunner.ts)
if (process.argv[1] && process.argv[1].includes('seedRunner')) {
  runDatabaseSeed()
    .then(res => {
      process.exit(res.success ? 0 : 1);
    })
    .catch(err => {
      console.error('[Seed] Unhandled error:', err);
      process.exit(1);
    });
}
