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
    ('Diana', 'Miller', 'diana.miller23@my.johndoe.edu', '2005-04-25', 'Computer Science', '2023-09-01', 3.90);

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

-- Seed Sections with actual capacities
INSERT INTO Section (course_id, instructor_id, semester, year, schedule, room_number, max_capacity, current_enrollment, status) VALUES
    -- CS101 Sections (one with 3 seats, one with 30 seats)
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
    }', 'TECH 101', 3, 0, 'OPEN'),
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
    }', 'TECH 102', 30, 0, 'OPEN'),
    
    -- CS201 (25 seats)
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
    }', 'TECH 201', 25, 0, 'OPEN'),
    
    -- CS301 (20 seats)
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
    }', 'TECH 301', 20, 0, 'OPEN'),
    
    -- MATH201 Sections (one with 2 seats, one with 25 seats)
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
    }', 'MATH 101', 2, 0, 'OPEN'),
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
    }', 'MATH 102', 25, 0, 'OPEN'),
    
    -- MATH202 (25 seats)
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
    }', 'MATH 201', 25, 0, 'OPEN'),
    
    -- PHYS301 (20 seats)
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
    }', 'PHYS 301', 20, 0, 'OPEN');

-- Seed Enrollments (trigger will automatically update current_enrollment)
INSERT INTO Enrollment (student_id, section_id, enrollment_date, status, grade) VALUES
    -- CS101 Section 1 (will fill up the 3-seat section)
    (1, 1, '2023-08-15', 'ENROLLED', 'A'),
    (2, 1, '2023-08-15', 'ENROLLED', 'A-'),
    (3, 1, '2023-08-15', 'ENROLLED', 'B+'),
    
    -- MATH201 Section 1 (will fill up the 2-seat section)
    (4, 5, '2023-08-16', 'ENROLLED', 'A'),
    (5, 5, '2023-08-16', 'ENROLLED', 'A-');
