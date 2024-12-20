'use client';

import { GraduationCap, TrendingUp, Calendar } from 'lucide-react';

interface CourseGrade {
  courseId: string;
  courseName: string;
  credits: number;
  grade: string;
  term: string;
  instructor: string;
}

const grades: CourseGrade[] = [
  {
    courseId: 'CS101',
    courseName: 'Introduction to Programming',
    credits: 3,
    grade: 'A',
    term: 'Fall 2023',
    instructor: 'Dr. Robert Anderson'
  },
  {
    courseId: 'MATH201',
    courseName: 'Calculus I',
    credits: 4,
    grade: 'A-',
    term: 'Fall 2023',
    instructor: 'Dr. Sarah Williams'
  },
  {
    courseId: 'CS201',
    courseName: 'Data Structures',
    credits: 3,
    grade: 'In Progress',
    term: 'Spring 2024',
    instructor: 'Dr. David Brown'
  }
];

const calculateGPA = (grades: CourseGrade[]) => {
  const gradePoints: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  const completedCourses = grades.filter(g => gradePoints[g.grade]);
  const totalPoints = completedCourses.reduce((sum, course) => 
    sum + (gradePoints[course.grade] * course.credits), 0);
  const totalCredits = completedCourses.reduce((sum, course) => 
    sum + course.credits, 0);

  return (totalPoints / totalCredits).toFixed(2);
};

export default function GradesPage() {
  const currentGPA = calculateGPA(grades);
  const totalCredits = grades.reduce((sum, course) => sum + course.credits, 0);
  const completedCredits = grades
    .filter(g => g.grade !== 'In Progress')
    .reduce((sum, course) => sum + course.credits, 0);

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
                    {currentGPA}
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
                    {completedCredits}/{totalCredits}
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
                    Spring 2024
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
                  Term
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
                <tr key={`${course.courseId}-${course.term}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {course.courseId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.courseName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.term}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${course.grade === 'In Progress' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : course.grade.startsWith('A') 
                        ? 'bg-green-100 text-green-800'
                        : course.grade.startsWith('B')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {course.grade}
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