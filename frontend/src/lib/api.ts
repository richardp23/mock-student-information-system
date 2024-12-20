import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create a custom axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    }
    throw error;
  }
);

export interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  major: string;
  gpa: string;
  enrollment_date: string;
}

export interface Course {
  course_id: string;
  course_name: string;
  credits: number;
  department: string;
  instructor_name: string;
  schedule: {
    meetings: Array<{
      days: string[];
      startTime: string;
      endTime: string;
      room: string;
    }>;
  };
}

export interface Grade {
  course_id: string;
  course_name: string;
  credits: number;
  grade: string;
  instructor_name: string;
}

export interface GradesResponse {
  grades: Grade[];
  gpa: number;
}

export interface AvailableSection {
  section_id: number;
  course_id: string;
  course_name: string;
  instructor_name: string;
  schedule: {
    meetings: Array<{
      days: string[];
      startTime: string;
      endTime: string;
      room: string;
    }>;
  };
  max_capacity: number;
  available_seats: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
}

export interface Instructor {
  instructor_id: number;
  first_name: string;
  last_name: string;
  email: string;
  office_hours: string;
  office_location: string;
  course_id: string;
  course_name: string;
}

const api = {
  // Student details
  getStudent: async (studentId: number): Promise<Student> => {
    const { data } = await axiosInstance.get<Student>(`/students/${studentId}`);
    return data;
  },

  // Student's courses
  getStudentCourses: async (studentId: number): Promise<Course[]> => {
    const { data } = await axiosInstance.get<Course[]>(`/students/${studentId}/courses`);
    return data;
  },

  // Student's grades
  getStudentGrades: async (studentId: number): Promise<GradesResponse> => {
    const { data } = await axiosInstance.get<GradesResponse>(`/students/${studentId}/grades`);
    return data;
  },

  // Get available courses for registration
  getAvailableCourses: async (): Promise<AvailableSection[]> => {
    const { data } = await axiosInstance.get<AvailableSection[]>('/students/available-sections');
    return data;
  },

  // Register for a course
  registerForCourse: async (studentId: number, sectionId: number): Promise<void> => {
    try {
      await axiosInstance.post(`/students/${studentId}/courses/${sectionId}`);
    } catch (error: any) {
      // Check for response data in a type-safe way
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to register for course');
    }
  },

  // Get student's instructors
  getStudentInstructors: async (studentId: number): Promise<Instructor[]> => {
    const { data } = await axiosInstance.get<Instructor[]>(`/students/${studentId}/instructors`);
    return data;
  }
};

export default api; 