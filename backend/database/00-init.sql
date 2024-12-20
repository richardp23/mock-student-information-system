-- Drop tables if they exist
DROP TABLE IF EXISTS Enrollment;
DROP TABLE IF EXISTS Section;
DROP TABLE IF EXISTS Course;
DROP TABLE IF EXISTS Student;
DROP TABLE IF EXISTS Instructor;

-- Source the table creation files
source tables/01_student.sql
source tables/02_instructor.sql
source tables/03_course.sql
source tables/04_section.sql
source tables/05_enrollment.sql

-- Source the seed data
source seed.sql 