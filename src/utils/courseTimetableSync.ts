import { Course, TimetableEntry, DayOfWeek, DaySession } from '../types';

const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: 'Thứ 2',
  tue: 'Thứ 3',
  wed: 'Thứ 4',
  thu: 'Thứ 5',
  fri: 'Thứ 6',
  sat: 'Thứ 7',
  sun: 'Chủ Nhật'
};

/**
 * Parse human schedule string (e.g. "Thứ 2 (07:30 - 09:30)", "Thứ 4 (13:30 - 16:00)")
 * into structured DayOfWeek, time string, and DaySession ('morning' | 'afternoon')
 */
export function parseCourseSchedule(scheduleStr?: string): {
  day?: DayOfWeek;
  time: string;
  session?: DaySession;
} {
  const defaultTime = '07:30 - 09:45';
  if (!scheduleStr || !scheduleStr.trim()) {
    return { time: defaultTime };
  }

  const s = scheduleStr.toLowerCase();
  let day: DayOfWeek | undefined;

  if (s.includes('thứ 2') || s.includes('thứ hai') || /\bt2\b/.test(s) || s.includes('mon')) {
    day = 'mon';
  } else if (s.includes('thứ 3') || s.includes('thứ ba') || /\bt3\b/.test(s) || s.includes('tue')) {
    day = 'tue';
  } else if (s.includes('thứ 4') || s.includes('thứ tư') || /\bt4\b/.test(s) || s.includes('wed')) {
    day = 'wed';
  } else if (s.includes('thứ 5') || s.includes('thứ năm') || /\bt5\b/.test(s) || s.includes('thu')) {
    day = 'thu';
  } else if (s.includes('thứ 6') || s.includes('thứ sáu') || /\bt6\b/.test(s) || s.includes('fri')) {
    day = 'fri';
  } else if (s.includes('thứ 7') || s.includes('thứ bảy') || /\bt7\b/.test(s) || s.includes('sat')) {
    day = 'sat';
  } else if (s.includes('chủ nhật') || /\bcn\b/.test(s) || s.includes('sun')) {
    day = 'sun';
  }

  // Extract time HH:MM - HH:MM
  const timeMatch = scheduleStr.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  let time = defaultTime;
  let session: DaySession | undefined;

  if (timeMatch) {
    const startHour = parseInt(timeMatch[1].split(':')[0], 10);
    time = `${timeMatch[1]} - ${timeMatch[2]}`;
    session = startHour < 12 ? 'morning' : 'afternoon';
  } else if (day) {
    // If no specific time found but day exists, detect morning/afternoon keywords
    if (s.includes('chiều') || s.includes('tối')) {
      session = 'afternoon';
      time = '13:30 - 16:00';
    } else {
      session = 'morning';
      time = '07:30 - 09:45';
    }
  }

  return { day, time, session };
}

/**
 * Format day and time into standard Vietnamese schedule string
 * e.g. "Thứ 2 (07:30 - 09:30)"
 */
export function formatCourseSchedule(day?: DayOfWeek, time?: string): string {
  if (!day) return '';
  const dayName = DAY_LABELS[day] || 'Thứ 2';
  return time ? `${dayName} (${time})` : dayName;
}

/**
 * Map course color string to valid TimetableEntry color
 */
export function mapCourseColor(courseColor?: string): TimetableEntry['color'] {
  const allowed: TimetableEntry['color'][] = ['indigo', 'sky', 'emerald', 'amber', 'rose', 'purple', 'teal'];
  if (courseColor && allowed.includes(courseColor as any)) {
    return courseColor as TimetableEntry['color'];
  }
  return 'indigo';
}

/**
 * Synchronize Courses array into Timetable entries.
 * Ensures every course has a corresponding timetable item,
 * with matching title, code, credits, instructor, room, and parsed schedule.
 */
export function syncCoursesToTimetable(
  courses: Course[],
  existingTimetable: TimetableEntry[]
): TimetableEntry[] {
  const result: TimetableEntry[] = [...existingTimetable];

  courses.forEach(course => {
    // Find matching item by courseId, or courseCode, or title
    const existingIndex = result.findIndex(
      t => t.courseId === course.id || (t.courseCode && t.courseCode === course.code) || t.name === course.title
    );

    const { day, time, session } = parseCourseSchedule(course.schedule);

    if (existingIndex >= 0) {
      const existing = result[existingIndex];
      // Update metadata to stay in sync
      result[existingIndex] = {
        ...existing,
        courseId: course.id,
        courseCode: course.code,
        name: course.title,
        instructor: course.instructor || existing.instructor,
        room: course.room || existing.room,
        credits: course.credits || existing.credits,
        color: mapCourseColor(course.color),
        // If course has an explicit schedule and existing item was unassigned or schedule was refreshed
        day: existing.day || day,
        session: existing.session || session,
        time: existing.day ? existing.time : (time || existing.time)
      };
    } else {
      // Create a brand new timetable item for this registered course
      const newItem: TimetableEntry = {
        id: `tt-${course.id}`,
        courseId: course.id,
        courseCode: course.code,
        name: course.title,
        instructor: course.instructor,
        room: course.room,
        credits: course.credits || 3,
        color: mapCourseColor(course.color),
        time: time || '07:30 - 09:45',
        day,
        session
      };
      result.push(newItem);
    }
  });

  return result;
}
