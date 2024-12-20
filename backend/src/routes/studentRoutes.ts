import { Router, Request, Response } from 'express';
import { studentService } from '../services/studentService';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Get available sections - needs to be before /:studentId routes to avoid conflict
router.get('/available-sections', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [sections] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        s.section_id,
        s.course_id,
        c.course_name,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name,
        s.schedule,
        s.max_capacity,
        (s.max_capacity - (
          SELECT COUNT(*) 
          FROM Enrollment e 
          WHERE e.section_id = s.section_id 
          AND e.status = 'ENROLLED'
        )) as available_seats,
        s.status
      FROM Section s
      JOIN Course c ON s.course_id = c.course_id
      JOIN Instructor i ON s.instructor_id = i.instructor_id
      WHERE s.status = 'OPEN'
      ORDER BY s.course_id
    `);

    console.log('Available sections:', sections);
    res.json(sections.map(section => ({
      ...section,
      available_seats: section.available_seats,
      max_capacity: section.max_capacity
    })));
  } catch (error) {
    console.error('Error fetching available sections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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

// Register for a course
router.post('/:studentId/courses/:sectionId', async (req: Request, res: Response): Promise<void> => {
  // Get a connection from the pool
  const connection = await pool.getConnection();
  
  try {
    const studentId = parseInt(req.params.studentId);
    const sectionId = parseInt(req.params.sectionId);

    console.log('Attempting registration:', { studentId, sectionId });

    // Check if student exists
    const student = await studentService.getStudentById(studentId);
    if (!student) {
      console.log('Student not found:', studentId);
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Check if section exists and has space
    const [sections] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM Section WHERE section_id = ? AND current_enrollment < max_capacity AND status = "OPEN"',
      [sectionId]
    );

    const section = sections[0];
    console.log('Section found:', section);

    if (!section) {
      res.status(400).json({ message: 'Section is not available for registration' });
      return;
    }

    // Check if student is already enrolled
    const [enrollments] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM Enrollment WHERE student_id = ? AND section_id = ? AND status = "ENROLLED"',
      [studentId, sectionId]
    );

    console.log('Existing enrollment:', enrollments[0]);

    if (enrollments.length > 0) {
      res.status(400).json({ message: 'Already enrolled in this course' });
      return;
    }

    console.log('Starting enrollment transaction');
    
    // Start transaction
    await connection.beginTransaction();

    try {
      // Create enrollment
      await connection.query(
        'INSERT INTO Enrollment (student_id, section_id, status, enrollment_date) VALUES (?, ?, "ENROLLED", NOW())',
        [studentId, sectionId]
      );

      // Update section enrollment count
      await connection.query(
        'UPDATE Section SET current_enrollment = current_enrollment + 1 WHERE section_id = ?',
        [sectionId]
      );

      await connection.commit();
      console.log('Registration successful');
      res.status(201).json({ message: 'Successfully registered for course' });
    } catch (error) {
      console.error('Transaction error:', error);
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error registering for course:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
});

export default router; 