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
    ('Bob', 'Johnson', 'bob.johnson23@my.johndoe.edu', '2005-11-30', 'Physics', '2023-09-01', 3.50),
    ('Alice', 'Brown', 'alice.brown23@my.johndoe.edu', '2005-07-14', 'Computer Science', '2023-09-01', 3.20),
    ('Charlie', 'Wilson', 'charlie.wilson23@my.johndoe.edu', '2005-09-08', 'Mathematics', '2023-09-01', 3.80),
    ('Diana', 'Miller', 'diana.miller23@my.johndoe.edu', '2005-04-25', 'Computer Science', '2023-09-01', 3.90),
    ('Eva', 'Garcia', 'eva.garcia23@my.johndoe.edu', '2005-06-18', 'Computer Science', '2023-09-01', 3.85),
    ('Frank', 'Lee', 'frank.lee23@my.johndoe.edu', '2005-08-30', 'Mathematics', '2023-09-01', 3.70),
    ('Grace', 'Wang', 'grace.wang23@my.johndoe.edu', '2005-02-14', 'Physics', '2023-09-01', 3.95),
    ('Henry', 'Kim', 'henry.kim23@my.johndoe.edu', '2005-12-05', 'Computer Science', '2023-09-01', 3.60);

-- Seed Instructors
INSERT INTO Instructor (first_name, last_name, email, department, office_location, office_hours, hire_date) VALUES
    ('Alice', 'Williams', 'williama@johndoe.edu', 'Computer Science', 'TECH 401', 'Monday/Wednesday: 11:00 AM - 12:30 PM\nFriday: 2:00 PM - 4:00 PM', '2020-01-15'),
    ('Andrew', 'Williams', 'williama2@johndoe.edu', 'Computer Science', 'TECH 402', 'Tuesday/Thursday: 2:30 PM - 4:00 PM\nWednesday: 1:00 PM - 3:00 PM', '2021-08-15'),
    ('David', 'Brown', 'brownbrd@johndoe.edu', 'Mathematics', 'MATH 301', 'Monday/Wednesday: 2:30 PM - 4:00 PM\nFriday: 10:00 AM - 12:00 PM', '2019-08-20'),
    ('Emily', 'Davis', 'davisdae@johndoe.edu', 'Physics', 'PHYS 201', 'Tuesday/Thursday: 10:00 AM - 11:30 AM\nFriday: 1:00 PM - 3:00 PM', '2021-03-10'),
    ('Michael', 'Johnson', 'johnsonm@johndoe.edu', 'Computer Science', 'TECH 301', 'Monday/Wednesday: 1:00 PM - 2:30 PM\nThursday: 10:00 AM - 12:00 PM', '2018-06-15');

-- Seed Courses (with prerequisites)
INSERT INTO Course (course_id, course_name, department, credits, description, prerequisite_id, level) VALUES
    ('CS101', 'Introduction to Programming', 'Computer Science', 3, 'Basic programming concepts', NULL, 'FRESHMAN'),
    ('CS201', 'Data Structures', 'Computer Science', 3, 'Fundamental data structures and algorithms', 'CS101', 'SOPHOMORE'),
    ('CS301', 'Database Systems', 'Computer Science', 3, 'Database design and SQL', 'CS201', 'JUNIOR'),
    ('MATH201', 'Calculus I', 'Mathematics', 4, 'Limits, derivatives, and integrals', NULL, 'FRESHMAN'),
    ('MATH202', 'Calculus II', 'Mathematics', 4, 'Integration techniques and series', 'MATH201', 'SOPHOMORE'),
    ('PHYS301', 'Classical Mechanics', 'Physics', 4, 'Newtonian mechanics and applications', 'MATH201', 'JUNIOR');

-- Seed Sections with waitlist scenarios
INSERT INTO Section (course_id, instructor_id, semester, year, schedule, room_number, max_capacity, current_enrollment, max_waitlist, current_waitlist, status) VALUES
    -- Previous semester sections (Spring 2024)
    ('CS101', 1, 'SPRING', 2024, 
    '{
        "meetings": [
            {
                "days": ["MON", "WED", "FRI"],
                "startTime": "10:00",
                "endTime": "10:50",
                "room": "TECH 101"
            }
        ]
    }', 'TECH 101', 30, 3, 10, 0, 'CLOSED'),
    ('MATH201', 3, 'SPRING', 2024,
    '{
        "meetings": [
            {
                "days": ["MON", "WED", "FRI"],
                "startTime": "11:00",
                "endTime": "11:50",
                "room": "MATH 101"
            }
        ]
    }', 'MATH 101', 30, 2, 10, 0, 'CLOSED'),
    ('CS201', 1, 'SPRING', 2024,
    '{
        "meetings": [
            {
                "days": ["MON", "WED"],
                "startTime": "13:00",
                "endTime": "14:20",
                "room": "TECH 201"
            }
        ]
    }', 'TECH 201', 30, 3, 10, 0, 'CLOSED'),

    -- Current semester sections (Fall 2024)
    -- CS101 Section 1 (Small section, full with waitlist)
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
    }', 'TECH 101', 3, 3, 5, 2, 'WAITLIST_AVAILABLE'),
    
    -- CS101 Section 2 (Regular section)
    ('CS101', 2, 'FALL', 2024,
    '{
        "meetings": [
            {
                "days": ["TUE", "THU"],
                "startTime": "14:00",
                "endTime": "15:20",
                "room": "TECH 102"
            }
        ]
    }', 'TECH 102', 30, 0, 10, 0, 'OPEN'),
    
    -- CS201 (Almost full)
    ('CS201', 1, 'FALL', 2024,
    '{
        "meetings": [
            {
                "days": ["MON", "WED"],
                "startTime": "13:00",
                "endTime": "14:20",
                "room": "TECH 201"
            }
        ]
    }', 'TECH 201', 25, 1, 10, 0, 'OPEN'),
    
    -- CS301 (full with waitlist)
    ('CS301', 5, 'FALL', 2024,
    '{
        "meetings": [
            {
                "days": ["TUE", "THU"],
                "startTime": "15:30",
                "endTime": "16:50",
                "room": "TECH 301"
            }
        ]
    }', 'TECH 301', 3, 3, 5, 0, 'WAITLIST_AVAILABLE'),
    
    -- MATH201 Sections
    ('MATH201', 3, 'FALL', 2024,
    '{
        "meetings": [
            {
                "days": ["MON", "WED", "FRI"],
                "startTime": "11:00",
                "endTime": "11:50",
                "room": "MATH 101"
            }
        ]
    }', 'MATH 101', 2, 2, 3, 1, 'WAITLIST_AVAILABLE'),
    ('MATH201', 3, 'FALL', 2024,
    '{
        "meetings": [
            {
                "days": ["MON", "WED", "FRI"],
                "startTime": "13:00",
                "endTime": "13:50",
                "room": "MATH 102"
            }
        ]
    }', 'MATH 102', 25, 0, 10, 0, 'OPEN'),
    
    -- MATH202 (Nearly full)
    ('MATH202', 3, 'FALL', 2024,
    '{
        "meetings": [
            {
                "days": ["TUE", "THU"],
                "startTime": "13:00",
                "endTime": "14:20",
                "room": "MATH 201"
            }
        ]
    }', 'MATH 201', 25, 0, 10, 0, 'OPEN'),
    
    -- PHYS301 (Full with full waitlist)
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
    }', 'PHYS 301', 20, 0, 5, 0, 'OPEN');

-- Seed Enrollments - Split into groups for debugging
-- Group 1: Spring 2024 CS101 completions
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (1, 1, '2024-01-15', 'COMPLETED', 'A'),
    (2, 1, '2024-01-15', 'COMPLETED', 'A-'),
    (3, 1, '2024-01-15', 'COMPLETED', 'B+');

-- Group 2: Spring 2024 MATH201 completions
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (4, 2, '2024-01-16', 'COMPLETED', 'A'),
    (5, 2, '2024-01-16', 'COMPLETED', 'A-');

-- Group 3: Spring 2024 CS201 completions
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (1, 3, '2024-01-15', 'COMPLETED', 'B+'),
    (2, 3, '2024-01-15', 'COMPLETED', 'A-'),
    (3, 3, '2024-01-15', 'COMPLETED', 'B');

-- Group 4: Fall 2024 CS101 Section 1 enrollments
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (6, 4, '2024-08-15', 'ENROLLED', NULL),
    (7, 4, '2024-08-15', 'ENROLLED', NULL),
    (8, 4, '2024-08-15', 'ENROLLED', NULL);

-- Group 5: Fall 2024 CS201 enrollments
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (2, 6, '2024-08-15', 'ENROLLED', NULL);

-- Group 6: Fall 2024 MATH201 section 1 enrollments
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (6, 8, '2024-08-15', 'ENROLLED', NULL),
    (7, 8, '2024-08-15', 'ENROLLED', NULL);

-- Group 7: Fall 2024 CS301 enrollments
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (1, 7, '2024-08-15', 'ENROLLED', NULL),
    (2, 7, '2024-08-15', 'ENROLLED', NULL),
    (3, 7, '2024-08-15', 'ENROLLED', NULL);

-- Group 8: Fall 2024 CS101 Section 1 waitlist
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (9, 4, '2024-08-16', 'WAITLISTED', NULL),
    (10, 4, '2024-08-17', 'WAITLISTED', NULL);

-- Group 9: Fall 2024 MATH201 section 1 waitlist
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    (8, 8, '2024-08-16', 'WAITLISTED', NULL);
