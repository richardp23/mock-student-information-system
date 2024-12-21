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
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
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
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  course_id: string;
  course_name: string;
  credits: number;
  department: string;
  instructor_name: string;
  schedule: {
    meetings: Array<{
      day: string;
      start_time: string;
      end_time: string;
      location: string;
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

export interface Meeting {
  days: string[];
  room: string;
  startTime: string;
  endTime: string;
}

export interface Schedule {
  meetings: Meeting[];
}

export interface Section {
  section_id: number;
  course_id: string;
  course_name: string;
  instructor_name: string;
  schedule: Schedule;
  max_capacity: number;
  available_seats: number;
  status: string;
  is_enrolled: boolean;
  prerequisite?: {
    course_id: string;
    course_name: string;
  };
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
  getAvailableSections: async (): Promise<Section[]> => {
    const studentId = localStorage.getItem('studentId');
    const { data } = await axiosInstance.get<Section[]>(`/students/available-sections${studentId ? `?studentId=${studentId}` : ''}`);
    return data;
  },

  registerForCourse: async (studentId: number, sectionId: number): Promise<void> => {
    await axiosInstance.post(`/students/${studentId}/courses/${sectionId}`);
  },

  getStudentCourses: async (studentId: number): Promise<Course[]> => {
    const { data } = await axiosInstance.get<Course[]>(`/students/${studentId}/courses`);
    return data;
  },

  getStudentGrades: async (studentId: number): Promise<GradesResponse> => {
    const { data } = await axiosInstance.get<GradesResponse>(`/students/${studentId}/grades`);
    return data;
  },

  getStudentInstructors: async (studentId: number): Promise<Instructor[]> => {
    const { data } = await axiosInstance.get<Instructor[]>(`/students/${studentId}/instructors`);
    return data;
  },

  getStudent: async (studentId: number): Promise<Student> => {
    const { data } = await axiosInstance.get<Student>(`/students/${studentId}`);
    return data;
  }
};

export default api; 