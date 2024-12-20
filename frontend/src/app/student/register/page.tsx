'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, AlertCircle } from 'lucide-react';
import api, { AvailableSection } from '@/lib/api';

export default function CourseRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<AvailableSection[]>([]);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentId = localStorage.getItem('studentId');
        
        if (!studentId) {
          router.push('/');
          return;
        }

        const availableSections = await api.getAvailableCourses();
        setSections(availableSections);
      } catch (err) {
        setError('Failed to load available courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleRegister = async (sectionId: number) => {
    try {
      setRegistering(true);
      setMessage(null);
      const studentId = localStorage.getItem('studentId');
      
      if (!studentId) {
        router.push('/');
        return;
      }

      await api.registerForCourse(parseInt(studentId), sectionId);
      setMessage({ type: 'success', text: 'Successfully registered for course!' });
      
      // Refresh the available sections
      const availableSections = await api.getAvailableCourses();
      setSections(availableSections);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to register for course'
      });
      console.error('Registration error:', err);
    } finally {
      setRegistering(false);
    }
  };

  const formatSchedule = (schedule: AvailableSection['schedule']): string => {
    return schedule.meetings.map(meeting => {
      const days = meeting.days.join(', ');
      return `${days} ${meeting.startTime} - ${meeting.endTime}`;
    }).join('; ');
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
        <h1 className="text-2xl font-semibold text-gray-900">Course Registration</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sections.map((section) => (
            <li key={section.section_id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {section.course_id} - {section.course_name}
                        </h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>{section.instructor_name}</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>{formatSchedule(section.schedule)}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          section.available_seats <= 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {section.available_seats} / {section.max_capacity} seats available
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <button
                      onClick={() => handleRegister(section.section_id)}
                      disabled={registering || section.available_seats <= 0}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                        ${registering 
                          ? 'bg-gray-400 cursor-not-allowed'
                          : section.available_seats <= 0
                            ? 'bg-red-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                    >
                      {registering ? 'Registering...' : section.available_seats <= 0 ? 'Full' : 'Register'}
                    </button>
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