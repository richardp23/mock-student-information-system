'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Clock, MapPin } from 'lucide-react';
import api, { Instructor } from '@/lib/api';

export default function InstructorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentId = localStorage.getItem('studentId');
        
        if (!studentId) {
          router.push('/');
          return;
        }

        const instructorsData = await api.getStudentInstructors(parseInt(studentId));
        setInstructors(instructorsData);
      } catch (err) {
        setError('Failed to load instructor data');
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Course Instructors</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {instructors.map((instructor) => (
          <div 
            key={`${instructor.instructor_id}-${instructor.course_id}`}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {instructor.first_name} {instructor.last_name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {instructor.course_name} ({instructor.course_id})
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <a 
                      href={`mailto:${instructor.email}`}
                      className="text-blue-600 hover:text-blue-500"
                    >
                      {instructor.email}
                    </a>
                  </div>

                  <div className="flex items-start text-sm">
                    <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="text-gray-700 font-medium">Office Hours:</span>
                      <p className="text-gray-600 whitespace-pre-line">
                        {instructor.office_hours}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start text-sm">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="text-gray-700 font-medium">Office Location:</span>
                      <p className="text-gray-600">
                        {instructor.office_location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 