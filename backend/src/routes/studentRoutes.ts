import { Router, Request, Response } from 'express';
import { studentService } from '../services/studentService';
import pool from '../config/database';

const router = Router();

// Get student details
router.get('/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = parseInt(req.params.studentId);
    const student = await studentService.getStudentById(studentId);
    
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student's courses
router.get('/:studentId/courses', async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = parseInt(req.params.studentId);
    const courses = await studentService.getStudentCourses(studentId);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student's grades
router.get('/:studentId/grades', async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = parseInt(req.params.studentId);
    const grades = await studentService.getStudentGrades(studentId);
    const gpa = await studentService.calculateGPA(studentId);
    
    res.json({
      grades,
      gpa
    });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update student's grade
router.put('/:studentId/grades/:enrollmentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = parseInt(req.params.studentId);
    const enrollmentId = parseInt(req.params.enrollmentId);
    const { grade } = req.body;

    // Update the grade
    await pool.execute(
      'UPDATE Enrollment SET grade = ? WHERE enrollment_id = ? AND student_id = ?',
      [grade, enrollmentId, studentId]
    );

    // Recalculate and update GPA
    const gpa = await studentService.calculateGPA(studentId);
    
    res.json({ message: 'Grade updated successfully', gpa });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 