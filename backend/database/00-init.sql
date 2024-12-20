SELECT 'Starting initialization' as '';

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

SELECT 'Database created and selected' as '';

-- Set character encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

SELECT 'Character encoding set' as '';

-- Drop tables if they exist
DROP TABLE IF EXISTS Enrollment;
DROP TABLE IF EXISTS Section;
DROP TABLE IF EXISTS Course;
DROP TABLE IF EXISTS Student;
DROP TABLE IF EXISTS Instructor;

SELECT 'Tables dropped' as '';
