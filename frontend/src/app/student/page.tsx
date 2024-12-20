'use client';

import Link from 'next/link';
import { Book, GraduationCap, Clock } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
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
                      4
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
                    Current GPA
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      3.75
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
                    <div className="text-sm font-medium text-gray-900">
                      CS101 - Introduction to Programming
                    </div>
                    <div className="text-sm text-gray-500">
                      Today at 2:00 PM
                    </div>
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