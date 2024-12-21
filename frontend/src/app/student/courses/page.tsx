'use client';

import { useEffect, useState } from 'react';
import { Book, Users, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

const formatSchedule = (schedule: Course['schedule']): string => {
  try {
    if (!schedule?.meetings || !Array.isArray(schedule.meetings)) {
      return 'Schedule not available';
    }

    return schedule.meetings.map(meeting => {
      if (!meeting?.days || !Array.isArray(meeting.days) || !meeting.startTime || !meeting.endTime) {
        return 'Invalid schedule';
      }
      const days = meeting.days.join(', ');
      const startTime = formatTime(meeting.startTime);
      const endTime = formatTime(meeting.endTime);
      return `${days} ${startTime} - ${endTime}`;
    }).join('; ');
  } catch (err) {
    console.error('Error formatting schedule:', err);
    return 'Schedule not available';
  }
};

const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch (err) {
    console.error('Error formatting time:', time);
    return time;
  }
};

export default function CoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentId = localStorage.getItem('studentId');
        
        if (!studentId) {
          router.push('/');
          return;
        }

        const coursesData = await api.getStudentCourses(parseInt(studentId));
        setCourses(coursesData);
      } catch (err) {
        setError('Failed to load courses data');
        console.error(err);
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

  const enrolledCourses = courses.filter(course => course.enrollment_status === 'ENROLLED');
  const waitlistedCourses = courses.filter(course => course.enrollment_status === 'WAITLISTED');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Current Courses</h1>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Enrolled Courses
          </h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {enrolledCourses.map((course) => (
            <li key={course.course_id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Book className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h2 className="text-sm font-medium text-gray-900">
                          {course.course_id} - {course.course_name}
                        </h2>
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {course.credits} Credits
                        </span>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {course.instructor_name}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {formatSchedule(course.schedule)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {enrolledCourses.length === 0 && (
            <li>
              <div className="px-4 py-4 sm:px-6 text-gray-500 text-sm">
                No enrolled courses
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Waitlisted Courses */}
      {waitlistedCourses.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Waitlisted Courses
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {waitlistedCourses.map((course) => (
              <li key={course.course_id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h2 className="text-sm font-medium text-gray-900">
                            {course.course_id} - {course.course_name}
                          </h2>
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Waitlisted
                          </span>
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {course.credits} Credits
                          </span>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {course.instructor_name}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {formatSchedule(course.schedule)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 