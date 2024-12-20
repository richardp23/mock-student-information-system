'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, TrendingUp, Calendar } from 'lucide-react';
import api, { Grade } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function GradesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gpa, setGpa] = useState<number>(0);
  const [student, setStudent] = useState<{ first_name: string; last_name: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentId = localStorage.getItem('studentId');
        
        if (!studentId) {
          router.push('/');
          return;
        }

        const [studentData, gradesData] = await Promise.all([
          api.getStudent(parseInt(studentId)),
          api.getStudentGrades(parseInt(studentId))
        ]);

        setStudent(studentData);
        setGrades(gradesData.grades);
        setGpa(gradesData.gpa);
      } catch (err) {
        setError('Failed to load grades data');
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

  // Calculate completed credits
  const completedCredits = grades.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Academic Record</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
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
                  <dd className="text-2xl font-semibold text-gray-900">
                    {gpa.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Credits Completed
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {completedCredits}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Term
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    Fall 2024
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Grade History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((course) => (
                <tr key={course.course_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {course.course_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.course_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.instructor_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${!course.grade || course.grade === 'In Progress' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : course.grade.startsWith('A') 
                        ? 'bg-green-100 text-green-800'
                        : course.grade.startsWith('B')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {course.grade || 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 