import { Router, Request, Response } from 'express';
import { studentService } from '../services/studentService';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Get available sections - needs to be before /:studentId routes to avoid conflict
router.get('/available-sections', async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : null;

    const [sections] = await pool.execute<RowDataPacket[]>(`
      WITH enrollment_counts AS (
        SELECT 
          section_id, 
          SUM(CASE WHEN status = 'ENROLLED' THEN 1 ELSE 0 END) as enrolled_count,
          SUM(CASE WHEN status = 'WAITLISTED' THEN 1 ELSE 0 END) as waitlist_count
        FROM Enrollment
        GROUP BY section_id
      )
      SELECT 
        s.section_id,
        s.course_id,
        c.course_name,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name,
        s.schedule,
        s.max_capacity,
        s.max_waitlist,
        COALESCE(s.max_capacity - ec.enrolled_count, s.max_capacity) as available_seats,
        COALESCE(ec.waitlist_count, 0) as current_waitlist,
        s.status,
        CASE 
          WHEN e.status = 'ENROLLED' THEN 1 
          ELSE 0 
        END as is_enrolled,
        CASE 
          WHEN e.status = 'WAITLISTED' THEN 1 
          ELSE 0 
        END as is_waitlisted,
        c.prerequisite_id,
        pc.course_name as prerequisite_name
      FROM Section s
      JOIN Course c ON s.course_id = c.course_id
      LEFT JOIN Course pc ON c.prerequisite_id = pc.course_id
      JOIN Instructor i ON s.instructor_id = i.instructor_id
      LEFT JOIN enrollment_counts ec ON s.section_id = ec.section_id
      LEFT JOIN Enrollment e ON s.section_id = e.section_id 
        AND e.student_id = ?
        AND e.status IN ('ENROLLED', 'WAITLISTED')
      WHERE s.status != 'CANCELLED'
      ORDER BY s.course_id
    `, [studentId || null]);

    const mappedSections = sections.map(section => {
      let parsedSchedule;
      try {
        parsedSchedule = typeof section.schedule === 'string' 
          ? JSON.parse(section.schedule)
          : section.schedule;
      } catch (e) {
        console.error('Error parsing schedule:', e);
        parsedSchedule = section.schedule;
      }

      const result = {
        section_id: section.section_id,
        course_id: section.course_id,
        course_name: section.course_name,
        instructor_name: section.instructor_name,
        schedule: parsedSchedule,
        available_seats: Number(section.available_seats),
        max_capacity: Number(section.max_capacity),
        max_waitlist: Number(section.max_waitlist),
        current_waitlist: Number(section.current_waitlist),
        status: section.status,
        is_enrolled: Boolean(section.is_enrolled),
        is_waitlisted: Boolean(section.is_waitlisted),
        prerequisite: null as { course_id: string; course_name: string } | null
      };

      if (section.prerequisite_id && section.prerequisite_name) {
        result.prerequisite = {
          course_id: section.prerequisite_id,
          course_name: section.prerequisite_name
        };
      }

      return result;
    });

    res.json(mappedSections);
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
    const includeWaitlisted = req.query.includeWaitlisted === 'true';

    const [courses] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        c.course_id,
        c.course_name,
        c.credits,
        c.department,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name,
        s.section_id,
        s.schedule,
        e.status as enrollment_status
      FROM Enrollment e
      JOIN Section s ON e.section_id = s.section_id
      JOIN Course c ON s.course_id = c.course_id
      JOIN Instructor i ON s.instructor_id = i.instructor_id
      WHERE e.student_id = ?
      AND e.status IN (${includeWaitlisted ? "'ENROLLED', 'WAITLISTED'" : "'ENROLLED'"})
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

    const mappedCourses = courses.map(course => ({
      ...course,
      schedule: typeof course.schedule === 'string' ? JSON.parse(course.schedule) : course.schedule
    }));

    res.json(mappedCourses);
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

    // Start transaction
    await connection.beginTransaction();

    try {
      // Get section status and enrollment counts
      const [sectionInfo] = await connection.query<RowDataPacket[]>(`
        SELECT 
          s.*,
          COUNT(CASE WHEN e.status = 'ENROLLED' THEN 1 END) as enrolled_count,
          COUNT(CASE WHEN e.status = 'WAITLISTED' THEN 1 END) as waitlist_count
        FROM Section s
        LEFT JOIN Enrollment e ON s.section_id = e.section_id
        WHERE s.section_id = ?
        GROUP BY s.section_id
      `, [sectionId]);

      if (!sectionInfo[0]) {
        throw new Error('Section not found');
      }

      const section = sectionInfo[0];
      const enrollmentStatus = section.enrolled_count < section.max_capacity 
        ? 'ENROLLED' 
        : section.waitlist_count < section.max_waitlist 
          ? 'WAITLISTED' 
          : 'FULL';

      if (enrollmentStatus === 'FULL') {
        throw new Error('Section is full and waitlist is full');
      }

      // Check for existing dropped enrollment for this course
      const [droppedEnrollments] = await connection.query<RowDataPacket[]>(`
        SELECT e.enrollment_id
        FROM Enrollment e
        JOIN Section s1 ON e.section_id = s1.section_id
        JOIN Section s2 ON s2.course_id = s1.course_id
        WHERE e.student_id = ?
        AND s2.section_id = ?
        AND e.status = 'DROPPED'
        LIMIT 1
      `, [studentId, sectionId]);

      if (droppedEnrollments.length > 0) {
        // Update the existing dropped enrollment
        await connection.query(
          'UPDATE Enrollment SET status = ?, section_id = ? WHERE enrollment_id = ?',
          [enrollmentStatus, sectionId, droppedEnrollments[0].enrollment_id]
        );
      } else {
        // Create a new enrollment
        await connection.query(
          'INSERT INTO Enrollment (student_id, section_id, status, enrollment_date) VALUES (?, ?, ?, NOW())',
          [studentId, sectionId, enrollmentStatus]
        );
      }

      await connection.commit();
      console.log('Registration successful with status:', enrollmentStatus);
      res.status(201).json({ 
        message: enrollmentStatus === 'ENROLLED' 
          ? 'Successfully registered for course!' 
          : 'Successfully added to waitlist!'
      });
    } catch (error) {
      await connection.rollback();
      
      // Check for specific database errors
      if (error instanceof Error) {
        console.log('Registration error:', error.message);
        
        if (error.message.includes('Prerequisites not met')) {
          res.status(400).json({ message: error.message });
          return;
        }
        if (error.message.includes('Section is full')) {
          res.status(400).json({ message: error.message });
          return;
        }
        if (error.message.includes('Student is already enrolled')) {
          res.status(400).json({ message: error.message });
          return;
        }
        if (error.message.includes('Duplicate entry')) {
          res.status(400).json({ message: 'Already enrolled in this course!' });
          return;
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error registering for course:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } finally {
    connection.release();
  }
});

// Get student's instructors
router.get('/:studentId/instructors', async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = parseInt(req.params.studentId);
    const [instructors] = await pool.execute<RowDataPacket[]>(`
      SELECT DISTINCT
        i.instructor_id,
        i.first_name,
        i.last_name,
        i.email,
        i.office_hours,
        i.office_location,
        c.course_id,
        c.course_name
      FROM Enrollment e
      JOIN Section s ON e.section_id = s.section_id
      JOIN Instructor i ON s.instructor_id = i.instructor_id
      JOIN Course c ON s.course_id = c.course_id
      WHERE e.student_id = ?
      AND e.status = 'ENROLLED'
      ORDER BY c.course_id
    `, [studentId]);

    res.json(instructors);
  } catch (error) {
    console.error('Error fetching student instructors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Drop a course
router.put('/:studentId/courses/:sectionId/drop', async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const studentId = parseInt(req.params.studentId);
    const sectionId = parseInt(req.params.sectionId);

    console.log('Attempting to drop course:', { studentId, sectionId });

    // Start transaction
    await connection.beginTransaction();

    try {
      // Find the current enrollment and make sure it exists
      const [enrollments] = await connection.query<RowDataPacket[]>(
        `SELECT 
          e.enrollment_id, 
          e.status
        FROM Enrollment e
        WHERE e.student_id = ? 
        AND e.section_id = ? 
        AND e.status IN ('ENROLLED', 'WAITLISTED')`,
        [studentId, sectionId]
      );

      if (enrollments.length === 0) {
        await connection.rollback();
        res.status(404).json({ message: 'Enrollment not found' });
        return;
      }

      const enrollment = enrollments[0];

      // Update the enrollment status to DROPPED
      // The after_enrollment_update trigger will handle updating section counts
      await connection.query(
        'UPDATE Enrollment SET status = "DROPPED" WHERE enrollment_id = ?',
        [enrollment.enrollment_id]
      );

      await connection.commit();
      console.log('Successfully dropped course');
      res.json({ message: 'Course dropped successfully' });
    } catch (error) {
      console.error('Error in drop course transaction:', error);
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error dropping course:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } finally {
    connection.release();
  }
});

export default router; 