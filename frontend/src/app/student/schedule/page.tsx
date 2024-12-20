'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar } from 'lucide-react';
import api, { Course } from '@/lib/api';

interface Meeting {
  days: string[];
  startTime: string;
  endTime: string;
  room: string;
  format?: string;
}

interface ScheduleData {
  meetings: Meeting[];
}

interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  course: Course;
}

const dayAbbreviationToFull: { [key: string]: string } = {
  'MON': 'MON',
  'TUE': 'TUE',
  'WED': 'WED',
  'THU': 'THU',
  'FRI': 'FRI'
};

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;

const parseSchedule = (course: Course): ScheduleItem[] => {
  try {
    console.log('Parsing schedule for course:', course.course_id);
    console.log('Schedule data:', course.schedule);
    
    if (!course.schedule?.meetings || !Array.isArray(course.schedule.meetings)) {
      console.error('Invalid schedule format for course:', course.course_id);
      return [];
    }
    
    const items = course.schedule.meetings.flatMap(meeting => {
      console.log('Processing meeting:', meeting);
      
      if (!meeting?.days || !Array.isArray(meeting.days)) {
        console.error('Invalid meeting format for course:', course.course_id);
        return [];
      }
      
      return meeting.days.map(day => {
        const fullDay = dayAbbreviationToFull[day] || day;
        console.log('Converting day:', day, 'to:', fullDay);
        
        return {
          day: fullDay,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          room: meeting.room,
          course
        };
      });
    });

    console.log('Generated schedule items for course:', course.course_id, items);
    return items;
  } catch (err) {
    console.error('Error parsing schedule for course:', course.course_id);
    console.error('Error details:', err);
    console.error('Schedule data:', course.schedule);
    return [];
  }
};

const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch (err) {
    console.error('Error formatting time:', time, err);
    return time;
  }
};

const TIME_SLOTS = [
  '8:00', '9:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const HOUR_HEIGHT = 80; // pixels per hour

const getPositionAndHeight = (startTime: string, endTime: string): { top: number, height: number } => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Calculate decimal hours from 8:00 AM
  const startDecimal = (startHour + startMinute / 60) - 8;
  const endDecimal = (endHour + endMinute / 60) - 8;
  
  // Ensure minimum height for visibility
  const duration = endDecimal - startDecimal;
  const minHeight = 60; // minimum height in pixels
  
  return {
    top: Math.round(startDecimal * HOUR_HEIGHT),
    height: Math.max(Math.round(duration * HOUR_HEIGHT), minHeight)
  };
};

export default function SchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentId = localStorage.getItem('studentId');
        
        if (!studentId) {
          console.log('No student ID found, redirecting to login');
          router.push('/');
          return;
        }

        console.log('Fetching courses for student:', studentId);
        const courses = await api.getStudentCourses(parseInt(studentId));
        console.log('Fetched courses:', JSON.stringify(courses, null, 2));
        
        const items: ScheduleItem[] = courses.flatMap(course => {
          const scheduleItems = parseSchedule(course);
          console.log('Parsed schedule items for course:', course.course_id, scheduleItems);
          return scheduleItems;
        });

        // Sort by day and time
        items.sort((a, b) => {
          const dayOrder = WEEKDAYS.indexOf(a.day as typeof WEEKDAYS[number]) - 
                         WEEKDAYS.indexOf(b.day as typeof WEEKDAYS[number]);
          if (dayOrder !== 0) return dayOrder;
          return a.startTime.localeCompare(b.startTime);
        });

        console.log('Final sorted schedule items:', JSON.stringify(items, null, 2));
        setScheduleItems(items);
      } catch (err) {
        console.error('Failed to load schedule data:', err);
        if (err instanceof Error) {
          setError(`Failed to load schedule data: ${err.message}`);
        } else {
          setError('Failed to load schedule data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (scheduleItems.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Weekly Schedule</h1>
        <div className="text-center text-gray-500">
          No scheduled classes found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Schedule</h1>
        <div className="text-gray-500">Spring 2024</div>
      </div>

      {/* Desktop view - Calendar grid with time slots */}
      <div className="hidden md:block">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] divide-x divide-gray-200">
            {/* Time column */}
            <div className="bg-gray-50">
              <div className="h-12 border-b border-gray-200"></div>
              {TIME_SLOTS.map((time) => (
                <div key={time} className="h-20 px-3 py-1 text-sm text-gray-500 border-b border-gray-200 text-right">
                  {formatTime(time)}
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            {WEEKDAYS.map((day) => (
              <div key={day}>
                {/* Day header */}
                <div className="bg-gray-50 h-12 px-4 py-3 text-sm font-semibold text-center text-gray-900 border-b border-gray-200">
                  {day}
                </div>
                
                {/* Container for all time slots */}
                <div className="relative" style={{ height: `${TIME_SLOTS.length * HOUR_HEIGHT}px` }}>
                  {/* Time slot grid lines */}
                  {TIME_SLOTS.map((time, index) => (
                    <div 
                      key={time} 
                      className="absolute w-full border-b border-gray-100" 
                      style={{ top: `${index * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                    />
                  ))}
                  
                  {/* Class blocks */}
                  {scheduleItems
                    .filter(item => item.day === day)
                    .map((item, index) => {
                      const { top, height } = getPositionAndHeight(item.startTime, item.endTime);
                      return (
                        <div
                          key={`${item.course.course_id}-${index}`}
                          className="absolute inset-x-2 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            zIndex: 10
                          }}
                        >
                          <div className="p-2 h-full flex flex-col">
                            <div className="font-medium text-blue-900">
                              {item.course.course_id}
                            </div>
                            <div className="text-sm text-blue-800 font-medium line-clamp-2">
                              {item.course.course_name}
                            </div>
                            <div className="text-xs text-blue-700 mt-auto">
                              {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </div>
                            <div className="text-xs text-blue-600 line-clamp-1">
                              {item.course.instructor_name}
                            </div>
                            <div className="text-xs text-gray-600">
                              Room {item.room}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile view - List */}
      <div className="md:hidden">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {WEEKDAYS.map((day) => {
              const dayItems = scheduleItems.filter(item => item.day === day);
              if (dayItems.length === 0) return null;
              
              return (
                <li key={day}>
                  <div className="px-4 py-5">
                    <div className="flex items-center mb-4">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">{day}</h3>
                    </div>
                    <div className="space-y-4">
                      {dayItems.map((item, index) => (
                        <div 
                          key={`${item.course.course_id}-${index}`} 
                          className="bg-blue-50 p-4 rounded-lg shadow-sm"
                        >
                          <div className="font-semibold text-blue-900">
                            {item.course.course_id} - {item.course.course_name}
                          </div>
                          <div className="text-sm text-blue-700 mt-2 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                          </div>
                          <div className="text-sm text-blue-600 mt-1">
                            {item.course.instructor_name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Room:</span> {item.room}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
} 