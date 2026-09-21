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

  if (!uri) {
    console.log('[Database] MONGODB_URI not set. Operating in resilient In-Memory Mock Store mode.');
    return;
  }

  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log('[Database] Connected to MongoDB successfully.');
  } catch (error) {
    console.warn('[Database] MongoDB connection failed or offline. Seamlessly utilizing In-Memory Fallback Store.');
    isMongoConnected = false;
  }
}
