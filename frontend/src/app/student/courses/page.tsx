'use client';

import { Book, Users, Clock } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
  enrolled: boolean;
  status: 'OPEN' | 'CLOSED' | 'WAITLIST';
}

const courses: Course[] = [
  {
    id: 'CS101',
    name: 'Introduction to Programming',
    instructor: 'Dr. Robert Anderson',
    schedule: 'MWF 9:00 AM - 10:15 AM',
    enrolled: true,
    status: 'OPEN'
  },
  {
    id: 'MATH201',
    name: 'Calculus I',
    instructor: 'Dr. Sarah Williams',
    schedule: 'TTH 11:00 AM - 12:15 PM',
    enrolled: true,
    status: 'CLOSED'
  },
  {
    id: 'CS201',
    name: 'Data Structures',
    instructor: 'Dr. David Brown',
    schedule: 'MW 2:00 PM - 3:15 PM',
    enrolled: false,
    status: 'WAITLIST'
  }
];

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Add Course
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {courses.map((course) => (
            <li key={course.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Book className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h2 className="text-sm font-medium text-gray-900">{course.id} - {course.name}</h2>
                        {course.enrolled && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Enrolled
                          </span>
                        )}
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {course.instructor}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {course.schedule}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    {!course.enrolled && (
                      <button
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white 
                          ${course.status === 'OPEN' 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : course.status === 'WAITLIST'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-gray-600 cursor-not-allowed'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        disabled={course.status === 'CLOSED'}
                      >
                        {course.status === 'OPEN' ? 'Enroll' : course.status === 'WAITLIST' ? 'Join Waitlist' : 'Closed'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 