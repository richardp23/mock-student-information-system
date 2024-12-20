'use client';

import { Clock, MapPin } from 'lucide-react';

interface ClassSession {
  courseId: string;
  courseName: string;
  room: string;
  startTime: string;
  endTime: string;
  days: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI')[];
}

const schedule: ClassSession[] = [
  {
    courseId: 'CS101',
    courseName: 'Introduction to Programming',
    room: 'CS-105',
    startTime: '9:00 AM',
    endTime: '10:15 AM',
    days: ['MON', 'WED', 'FRI']
  },
  {
    courseId: 'MATH201',
    courseName: 'Calculus I',
    room: 'MATH-101',
    startTime: '11:00 AM',
    endTime: '12:15 PM',
    days: ['TUE', 'THU']
  },
  {
    courseId: 'CS201',
    courseName: 'Data Structures',
    room: 'CS-203',
    startTime: '2:00 PM',
    endTime: '3:15 PM',
    days: ['MON', 'WED']
  }
];

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;
const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export default function SchedulePage() {
  const getClassForTimeSlot = (day: typeof weekDays[number], time: string) => {
    return schedule.find(session => 
      session.days.includes(day) &&
      session.startTime <= time &&
      session.endTime > time
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Schedule</h1>
        <div className="text-sm text-gray-500">Spring 2024</div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 divide-x divide-gray-200">
          {/* Time column */}
          <div className="col-span-1">
            <div className="h-12 bg-gray-50 border-b border-gray-200"></div>
            {timeSlots.map((time) => (
              <div key={time} className="h-24 border-b border-gray-200 p-2">
                <span className="text-xs font-medium text-gray-500">{time}</span>
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDays.map((day) => (
            <div key={day} className="col-span-1">
              <div className="h-12 bg-gray-50 border-b border-gray-200 p-2">
                <span className="text-sm font-medium text-gray-900">{day}</span>
              </div>
              {timeSlots.map((time) => {
                const classSession = getClassForTimeSlot(day, time);
                return (
                  <div key={`${day}-${time}`} className="h-24 border-b border-gray-200 p-1">
                    {classSession && (
                      <div className="h-full rounded bg-blue-50 p-2 text-xs">
                        <div className="font-medium text-blue-700">
                          {classSession.courseId}
                        </div>
                        <div className="mt-1 text-blue-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {classSession.startTime} - {classSession.endTime}
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {classSession.room}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* List View for Mobile */}
      <div className="block sm:hidden space-y-4">
        {schedule.map((session) => (
          <div key={`${session.courseId}-list`} className="bg-white shadow rounded-lg p-4">
            <div className="font-medium text-gray-900">
              {session.courseId} - {session.courseName}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {session.startTime} - {session.endTime}
              </div>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-2" />
                {session.room}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              {session.days.map((day) => (
                <span
                  key={day}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 