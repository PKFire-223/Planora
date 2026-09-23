import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import {
  CourseItem,
  TaskItem,
  NoteItem,
  GoalItem,
  ErrorReportItem,
  TimetableItem
} from '../types';
import { CourseModel } from '../models/course.model';
import { TaskModel } from '../models/task.model';
import { NoteModel } from '../models/note.model';
import { GoalModel } from '../models/goal.model';
import { ErrorReportModel } from '../models/error.model';
import { TimetableModel } from '../models/timetable.model';

// Function to safely load sample data if sampleData.json exists
// If the user deletes sampleData.json after pushing to MongoDB,
// this function safely returns empty arrays with zero compilation/runtime conflicts!
function loadInitialSeedData(): {
  courses: CourseItem[];
  tasks: TaskItem[];
  notes: NoteItem[];
  goals: GoalItem[];
  errors: ErrorReportItem[];
  timetable: TimetableItem[];
} {
  const sampleFilePath = path.join(process.cwd(), 'server', 'seed', 'sampleData.json');
  if (fs.existsSync(sampleFilePath)) {
    try {
      const raw = fs.readFileSync(sampleFilePath, 'utf-8');
      const data = JSON.parse(raw);
      return {
        courses: Array.isArray(data.courses) ? data.courses : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        notes: Array.isArray(data.notes) ? data.notes : [],
        goals: Array.isArray(data.goals) ? data.goals : [],
        errors: Array.isArray(data.errors) ? data.errors : [],
        timetable: Array.isArray(data.timetable) ? data.timetable : []
      };
    } catch (e: any) {
      console.warn('[Database] Cảnh báo đọc sampleData.json:', e.message);
    }
  }
  return { courses: [], tasks: [], notes: [], goals: [], errors: [], timetable: [] };
}

const initialData = loadInitialSeedData();

class InMemoryStore {
  public courses: CourseItem[] = [...initialData.courses];
  public tasks: TaskItem[] = [...initialData.tasks];
  public notes: NoteItem[] = [...initialData.notes];
  public goals: GoalItem[] = [...initialData.goals];
  public errors: ErrorReportItem[] = [...initialData.errors];
  public timetable: TimetableItem[] = [...initialData.timetable];
}

export const memoryStore = new InMemoryStore();

export let isMongoConnected = false;

// Synchronize MongoDB collections into the fast in-memory cache
export async function syncFromMongoToMemory(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;

  try {
    const [dbCourses, dbTasks, dbNotes, dbGoals, dbErrors, dbTimetable] = await Promise.all([
      CourseModel.find().lean(),
      TaskModel.find().lean(),
      NoteModel.find().lean(),
      GoalModel.find().lean(),
      ErrorReportModel.find().lean(),
      TimetableModel.find().lean()
    ]);

    if (dbCourses.length > 0) {
      memoryStore.courses = dbCourses as unknown as CourseItem[];
    }
    if (dbTasks.length > 0) {
      memoryStore.tasks = dbTasks as unknown as TaskItem[];
    }
    if (dbNotes.length > 0) {
      memoryStore.notes = dbNotes as unknown as NoteItem[];
    }
    if (dbGoals.length > 0) {
      memoryStore.goals = dbGoals as unknown as GoalItem[];
    }
    if (dbErrors.length > 0) {
      memoryStore.errors = dbErrors as unknown as ErrorReportItem[];
    }
    if (dbTimetable.length > 0) {
      memoryStore.timetable = dbTimetable as unknown as TimetableItem[];
    }

    console.log(
      `[Database] Đã đồng bộ từ MongoDB vào RAM: ${memoryStore.courses.length} courses, ${memoryStore.tasks.length} tasks, ${memoryStore.goals.length} goals.`
    );
  } catch (err: any) {
    console.warn('[Database] Cảnh báo đồng bộ từ MongoDB:', err.message);
  }
}

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[Database] Chưa cấu hình MONGODB_URI. Hoạt động với In-Memory Store.');
    isMongoConnected = false;
    return;
  }

  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log('[Database] Kết nối MongoDB thành công.');

    // Sync data from MongoDB into in-memory store
    await syncFromMongoToMemory();
  } catch (err: any) {
    isMongoConnected = false;
    console.log(`[Database] Không thể kết nối MongoDB (${err.message}). Hoạt động với In-Memory Store.`);
  }
}
