import mongoose from 'mongoose';
import {
  INITIAL_COURSES,
  INITIAL_TASKS,
  INITIAL_NOTES,
  INITIAL_GOALS,
  INITIAL_ERRORS,
  CourseItem,
  TaskItem,
  NoteItem,
  GoalItem,
  ErrorReportItem
} from '../data/seedData';

class InMemoryStore {
  public courses: CourseItem[] = [...INITIAL_COURSES];
  public tasks: TaskItem[] = [...INITIAL_TASKS];
  public notes: NoteItem[] = [...INITIAL_NOTES];
  public goals: GoalItem[] = [...INITIAL_GOALS];
  public errors: ErrorReportItem[] = [...INITIAL_ERRORS];
}

export const memoryStore = new InMemoryStore();

export let isMongoConnected = false;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  // In cloud sandbox container or when local MongoDB is not configured:
  if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
    console.log('[Database] Operating with resilient In-Memory Store.');
    isMongoConnected = false;
    return;
  }

  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1000,
    });
    isMongoConnected = true;
    console.log('[Database] Connected to remote MongoDB successfully.');
  } catch {
    console.log('[Database] Operating with resilient In-Memory Store.');
    isMongoConnected = false;
  }
}
