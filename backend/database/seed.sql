-- Seed data for Student Information System

-- Clear existing data (if any)
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE Enrollment;
TRUNCATE TABLE Section;
TRUNCATE TABLE Course;
TRUNCATE TABLE Student;
TRUNCATE TABLE Instructor;
SET FOREIGN_KEY_CHECKS=1;

-- Seed Students
INSERT INTO Student (first_name, last_name, email, date_of_birth, major, gpa) VALUES
    ('John', 'Smith', 'john.smith23@my.johndoe.edu', '2005-05-15', 'Computer Science', 3.75),
    ('Jane', 'Doe', 'jane.doe23@my.johndoe.edu', '2005-03-22', 'Mathematics', 4.00),
    ('John', 'Smith', 'john.smith23.2@my.johndoe.edu', '2005-11-30', 'Physics', 3.50),  -- Note the .2 suffix for duplicate name
    ('Maria', 'Garcia', 'maria.garcia24@my.johndoe.edu', '2006-01-10', 'Computer Science', 3.90),
    ('James', 'Wilson', 'james.wilson24@my.johndoe.edu', '2006-07-20', 'Mathematics', 3.85);

-- Seed Instructors
INSERT INTO Instructor (first_name, last_name, email, department, office_location, phone) VALUES
    ('Robert', 'Anderson', 'andersor@johndoe.edu', 'Computer Science', 'CS-410', '123-456-7890'),
    ('Sarah', 'Williams', 'williams@johndoe.edu', 'Mathematics', 'MATH-220', '123-456-7891'),
    ('Michael', 'Johnson', 'johnsonm@johndoe.edu', 'Physics', 'PHY-310', '123-456-7892'),
    ('Emily', 'Williams', 'william2@johndoe.edu', 'Mathematics', 'MATH-225', '123-456-7893'),  -- Note the 2 suffix for duplicate last name
    ('David', 'Brown', 'brownd@johndoe.edu', 'Computer Science', 'CS-415', '123-456-7894');

-- Seed Courses (with prerequisites)
INSERT INTO Course (course_id, course_name, description, credits, department, level) VALUES
    ('CS101', 'Introduction to Programming', 'Basic programming concepts using Python', 3, 'Computer Science', 'FRESHMAN'),
    ('MATH201', 'Calculus I', 'Limits, derivatives, and basic integration', 4, 'Mathematics', 'FRESHMAN'),
    ('CS201', 'Data Structures', 'Fundamental data structures and algorithms', 3, 'Computer Science', 'SOPHOMORE'),
    ('MATH301', 'Linear Algebra', 'Vector spaces, matrices, and linear transformations', 3, 'Mathematics', 'JUNIOR'),
    ('PHY201', 'Classical Mechanics', 'Newtonian mechanics and applications', 4, 'Physics', 'SOPHOMORE');

-- Update prerequisites (after courses exist)
UPDATE Course SET prerequisite_id = 'CS101' WHERE course_id = 'CS201';
UPDATE Course SET prerequisite_id = 'MATH201' WHERE course_id = 'MATH301';

-- Seed Sections with JSON schedules
INSERT INTO Section (course_id, instructor_id, semester, year, room_number, schedule, max_capacity) VALUES
    ('CS101', 1, 'FALL', 2024, 'CS-105', 
    '{
        "meetings": [
            {
                "days": ["MON", "WED"],
                "startTime": "09:00",
                "endTime": "10:15",
                "format": "IN_PERSON",
                "room": "CS-105"
            },
            {
                "days": ["FRI"],
                "startTime": "09:00",
                "endTime": "10:15",
                "format": "LAB",
                "room": "CS-LAB-1"
            }
        ]
    }', 30),
    ('MATH201', 2, 'FALL', 2024, 'MATH-101',
    '{
        "meetings": [
            {
                "days": ["TUE", "THU"],
                "startTime": "11:00",
                "endTime": "12:15",
                "format": "IN_PERSON",
                "room": "MATH-101"
            }
        ]
    }', 35),
    ('CS201', 5, 'SPRING', 2024, 'CS-203',
    '{
        "meetings": [
            {
                "days": ["MON", "WED"],
                "startTime": "14:00",
                "endTime": "15:15",
                "format": "HYBRID",
                "room": "CS-203"
            }
        ]
    }', 25);

-- Seed Enrollments (including waitlist scenario)
INSERT INTO Enrollment (student_id, section_id, status, grade) VALUES
    (1, 1, 'ENROLLED', NULL),
    (2, 1, 'ENROLLED', NULL),
    (3, 2, 'ENROLLED', NULL),
    (4, 1, 'WAITLISTED', NULL),
    (5, 3, 'COMPLETED', 'A');

-- Update section enrollment counts
UPDATE Section 
SET current_enrollment = (
    SELECT COUNT(*) 
    FROM Enrollment 
    WHERE Enrollment.section_id = Section.section_id 
    AND status = 'ENROLLED'
);

-- Update section status based on enrollment
UPDATE Section 
SET status = CASE 
    WHEN current_enrollment >= max_capacity THEN 'CLOSED'
    ELSE 'OPEN'
END;
