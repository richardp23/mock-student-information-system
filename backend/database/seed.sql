USE student_db;

-- Clear existing data (if any)
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE Enrollment;
TRUNCATE TABLE Section;
TRUNCATE TABLE Course;
TRUNCATE TABLE Student;
TRUNCATE TABLE Instructor;
SET FOREIGN_KEY_CHECKS=1;

-- Seed Students
INSERT INTO Student (first_name, last_name, email, date_of_birth, major, enrollment_date, gpa) VALUES
    ('John', 'Smith', 'john.smith23@my.johndoe.edu', '2005-05-15', 'Computer Science', '2023-09-01', 3.75),
    ('Jane', 'Doe', 'jane.doe23@my.johndoe.edu', '2005-03-22', 'Mathematics', '2023-09-01', 4.00),
    ('Bob', 'Johnson', 'bob.johnson23@my.johndoe.edu', '2005-11-30', 'Physics', '2023-09-01', 3.50);

-- Seed Instructors
INSERT INTO Instructor (first_name, last_name, email, department, hire_date) VALUES
    ('Alice', 'Williams', 'williama@johndoe.edu', 'Computer Science', '2020-01-15'),
    ('Andrew', 'Williams', 'williama2@johndoe.edu', 'Computer Science', '2021-08-15'),
    ('David', 'Brown', 'brownbrd@johndoe.edu', 'Mathematics', '2019-08-20'),
    ('Emily', 'Davis', 'davisdae@johndoe.edu', 'Physics', '2021-03-10');

-- Seed Courses
INSERT INTO Course (course_id, course_name, department, credits, description) VALUES
    ('CS101', 'Introduction to Programming', 'Computer Science', 3, 'Basic programming concepts'),
    ('MATH201', 'Calculus I', 'Mathematics', 4, 'Limits, derivatives, and integrals'),
    ('PHYS301', 'Classical Mechanics', 'Physics', 4, 'Newtonian mechanics and applications');

-- Seed Sections
INSERT INTO Section (course_id, instructor_id, semester, year, schedule, room_number, max_capacity) VALUES
    ('CS101', 1, 'FALL', 2024, 
    '{
        "meetings": [
            {
                "days": ["MON", "WED", "FRI"],
                "startTime": "10:00",
                "endTime": "10:50",
                "room": "TECH 101"
            }
        ]
    }', 'TECH 101', 30),
    ('MATH201', 3, 'FALL', 2024,
    '{
        "meetings": [
            {
                "days": ["TUE", "THU"],
                "startTime": "13:00",
                "endTime": "14:20",
                "room": "MATH 201"
            }
        ]
    }', 'MATH 201', 25),
    ('PHYS301', 4, 'FALL', 2024,
    '{
        "meetings": [
            {
                "days": ["MON", "WED", "FRI"],
                "startTime": "14:00",
                "endTime": "14:50",
                "room": "PHYS 301"
            }
        ]
    }', 'PHYS 301', 20);

-- Seed Enrollments
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (1, 1, '2023-08-15', 'ENROLLED', 'A'),
    (1, 2, '2023-08-15', 'ENROLLED', 'B+'),
    (2, 2, '2023-08-16', 'ENROLLED', 'A-'),
    (3, 3, '2023-08-17', 'ENROLLED', 'B');
