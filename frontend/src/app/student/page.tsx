'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book, GraduationCap, Clock } from 'lucide-react';
import api, { Student, Course, Grade } from '@/lib/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [calculatedGpa, setCalculatedGpa] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentId = localStorage.getItem('studentId');
        
        if (!studentId) {
          router.push('/');
          return;
        }

        const [studentData, coursesData, gradesData] = await Promise.all([
          api.getStudent(parseInt(studentId)),
          api.getStudentCourses(parseInt(studentId)),
          api.getStudentGrades(parseInt(studentId))
        ]);

        setStudent(studentData);
        setCourses(coursesData);
        setCalculatedGpa(gradesData.gpa);
      } catch (err) {
        setError('Failed to load student data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('studentId');
    router.push('/');
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {student?.first_name} {student?.last_name}
        </h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign Out
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Current Courses */}
        <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Book className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Courses
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {courses.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/student/courses"
                className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center space-x-1"
              >
                <span>View all courses</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* GPA */}
        <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cumulative GPA
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {calculatedGpa ? calculatedGpa.toFixed(2) : '-'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/student/grades"
                className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center space-x-1"
              >
                <span>View transcript</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Next Class */}
        <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Next Class
                  </dt>
                  <dd className="mt-1">
                    {courses[0] ? (
                      <>
                        <div className="text-sm font-medium text-gray-900">
                          {courses[0].course_id} - {courses[0].course_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {/* We'll need to parse the schedule JSON to show the next class time */}
                          Check schedule for details
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No upcoming classes
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/student/schedule"
                className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center space-x-1"
              >
                <span>View schedule</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 