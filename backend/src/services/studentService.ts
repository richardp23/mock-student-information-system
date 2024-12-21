import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface Student extends RowDataPacket {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  major: string;
  gpa: number;
}

export interface Course extends RowDataPacket {
  course_id: string;
  course_name: string;
  credits: number;
  department: string;
  instructor_name: string;
  enrollment_status: 'ENROLLED' | 'WAITLISTED' | 'COMPLETED';
  schedule: {
    meetings: Array<{
      days: string[];
      startTime: string;
      endTime: string;
      room: string;
    }>;
  };
}

export interface Grade extends RowDataPacket {
  course_id: string;
  course_name: string;
  credits: number;
  grade: string;
  instructor_name: string;
}

export const studentService = {
  // Get student details
  async getStudentById(studentId: number): Promise<Student | null> {
    const [rows] = await pool.execute<Student[]>(
      'SELECT * FROM Student WHERE student_id = ?',
      [studentId]
    );
    return rows[0] || null;
  },

  // Get student's grades
  async getStudentGrades(studentId: number): Promise<Grade[]> {
    const [rows] = await pool.execute<Grade[]>(`
      SELECT 
        c.course_id,
        c.course_name,
        c.credits,
        e.grade,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name
      FROM Enrollment e
      JOIN Section s ON e.section_id = s.section_id
      JOIN Course c ON s.course_id = c.course_id
      JOIN Instructor i ON s.instructor_id = i.instructor_id
      WHERE e.student_id = ?
      AND e.status = 'COMPLETED'
      AND e.grade IS NOT NULL
      ORDER BY s.year DESC, s.semester DESC, c.course_id
    `, [studentId]);
    return rows;
  },

  // Calculate student's GPA
  async calculateGPA(studentId: number): Promise<number> {
    const [result] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        SUM(
          CASE 
            WHEN e.grade = 'A+' THEN 4.0
            WHEN e.grade = 'A' THEN 4.0
            WHEN e.grade = 'A-' THEN 3.7
            WHEN e.grade = 'B+' THEN 3.3
            WHEN e.grade = 'B' THEN 3.0
            WHEN e.grade = 'B-' THEN 2.7
            WHEN e.grade = 'C+' THEN 2.3
            WHEN e.grade = 'C' THEN 2.0
            WHEN e.grade = 'C-' THEN 1.7
            WHEN e.grade = 'D+' THEN 1.3
            WHEN e.grade = 'D' THEN 1.0
            WHEN e.grade = 'F' THEN 0.0
            ELSE NULL
          END * c.credits
        ) as total_points,
        SUM(
          CASE 
            WHEN e.grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F')
            THEN c.credits
            ELSE 0
          END
        ) as total_credits
      FROM Enrollment e
      JOIN Section s ON e.section_id = s.section_id
      JOIN Course c ON s.course_id = c.course_id
      WHERE e.student_id = ?
      AND e.status = 'COMPLETED'
      AND e.grade IS NOT NULL
    `, [studentId]);

    const { total_points, total_credits } = result[0];
    return total_credits > 0 ? Number((total_points / total_credits).toFixed(2)) : 0.0;
  }
}; 