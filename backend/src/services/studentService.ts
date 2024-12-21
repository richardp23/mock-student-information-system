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

  // Get student's courses
  async getStudentCourses(studentId: number): Promise<Course[]> {
    const [rows] = await pool.execute<Course[]>(`
      SELECT 
        c.course_id,
        c.course_name,
        c.credits,
        c.department,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name,
        s.schedule,
        e.status as enrollment_status
      FROM Enrollment e
      JOIN Section s ON e.section_id = s.section_id
      JOIN Course c ON s.course_id = c.course_id
      JOIN Instructor i ON s.instructor_id = i.instructor_id
      WHERE e.student_id = ?
      AND e.status IN ('ENROLLED', 'WAITLISTED')
      AND s.semester = 'FALL'
      AND s.year = 2024
      ORDER BY 
        CASE e.status
          WHEN 'ENROLLED' THEN 1
          WHEN 'WAITLISTED' THEN 2
          ELSE 3
        END,
        c.course_id
    `, [studentId]);
    return rows;
  },

  // Get student's grades
  async getStudentGrades(studentId: number): Promise<Grade[]> {
    const [rows] = await pool.execute<Grade[]>(`
      SELECT 
        c.course_id,
        c.course_name,
        c.credits,
        e.grade,
        e.status,
        s.semester,
        s.year,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name
      FROM Enrollment e
      JOIN Section s ON e.section_id = s.section_id
      JOIN Course c ON s.course_id = c.course_id
      JOIN Instructor i ON s.instructor_id = i.instructor_id
      WHERE e.student_id = ?
      AND e.status IN ('ENROLLED', 'COMPLETED')
      ORDER BY s.year DESC, 
               FIELD(s.semester, 'FALL', 'SUMMER', 'SPRING') DESC,
               e.enrollment_date DESC
    `, [studentId]);
    
    // Transform the rows to handle in-progress courses
    const transformedRows = rows.map(row => ({
      ...row,
      grade: row.status === 'ENROLLED' ? 'In Progress' : row.grade
    }));
    
    console.log('Grades query result:', JSON.stringify(transformedRows, null, 2));
    return transformedRows;
  },

  // Calculate GPA
  async calculateGPA(studentId: number): Promise<number> {
    const [rows] = await pool.execute<Grade[]>(`
      SELECT 
        e.grade,
        c.credits
      FROM Enrollment e
      JOIN Section s ON e.section_id = s.section_id
      JOIN Course c ON s.course_id = c.course_id
      WHERE e.student_id = ?
      AND e.status = 'COMPLETED'
      AND e.grade IS NOT NULL
    `, [studentId]);

    const gradePoints: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    let totalPoints = 0;
    let totalCredits = 0;

    rows.forEach(row => {
      if (gradePoints[row.grade]) {
        totalPoints += gradePoints[row.grade] * row.credits;
        totalCredits += row.credits;
      }
    });

    const calculatedGpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
    
    // Update the stored GPA in the Student table
    await this.updateStoredGPA(studentId, calculatedGpa);
    
    return calculatedGpa;
  },

  // Update stored GPA
  async updateStoredGPA(studentId: number, gpa: number): Promise<void> {
    await pool.execute(
      'UPDATE Student SET gpa = ? WHERE student_id = ?',
      [gpa, studentId]
    );
  }
}; 