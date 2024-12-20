import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create a custom axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

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

const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  throw new Error('An error occurred with the API request');
};

const api = {
  // Student details
  getStudent: async (studentId: number): Promise<Student> => {
    try {
      const { data } = await axiosInstance.get<Student>(`/students/${studentId}`);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Student's courses
  getStudentCourses: async (studentId: number): Promise<Course[]> => {
    try {
      const { data } = await axiosInstance.get<Course[]>(`/students/${studentId}/courses`);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Student's grades
  getStudentGrades: async (studentId: number): Promise<GradesResponse> => {
    try {
      const { data } = await axiosInstance.get<GradesResponse>(`/students/${studentId}/grades`);
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default api; 