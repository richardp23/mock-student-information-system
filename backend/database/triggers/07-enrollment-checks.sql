USE student_db;

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Drop existing triggers
DROP TRIGGER IF EXISTS check_prerequisites;
DROP TRIGGER IF EXISTS after_enrollment_insert;
DROP TRIGGER IF EXISTS after_enrollment_delete;
DROP TRIGGER IF EXISTS after_enrollment_update;

DELIMITER //

-- Create enrollment prerequisites trigger
CREATE TRIGGER check_prerequisites
BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    DECLARE prereq_id VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    DECLARE has_completed_prereq BOOLEAN;
    DECLARE current_enrollment INT;
    DECLARE max_capacity INT;
    DECLARE course_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    
    -- Get the prerequisite and course info
    SELECT c.prerequisite_id, c.course_name, s.current_enrollment, s.max_capacity 
    INTO prereq_id, course_name, current_enrollment, max_capacity
    FROM Section s
    JOIN Course c ON s.course_id = c.course_id
    WHERE s.section_id = NEW.section_id;
    
    -- Check section capacity
    IF current_enrollment >= max_capacity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Section is full';
    END IF;
    
    -- If there's a prerequisite, check if it's been completed
    IF prereq_id IS NOT NULL THEN
        SELECT COUNT(*) > 0 INTO has_completed_prereq
        FROM Enrollment e
        JOIN Section s ON e.section_id = s.section_id
        WHERE e.student_id = NEW.student_id
        AND s.course_id = prereq_id
        AND e.status = 'ENROLLED'
        AND e.grade IS NOT NULL
        AND e.grade != 'F'
        AND e.grade != 'W'
        AND e.grade != 'I';
        
        IF NOT has_completed_prereq THEN
            SELECT CONCAT('Prerequisites not met: Must complete ', prereq_id, ' before enrolling in ', course_name)
            INTO @error_message;
            
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = @error_message;
        END IF;
    END IF;
END //

-- Create trigger to increment enrollment count after successful enrollment
CREATE TRIGGER after_enrollment_insert
AFTER INSERT ON Enrollment
FOR EACH ROW
BEGIN
    IF NEW.status = 'ENROLLED' THEN
        UPDATE Section 
        SET current_enrollment = current_enrollment + 1
        WHERE section_id = NEW.section_id;
    END IF;
END //

-- Create trigger to decrement enrollment count after dropping
CREATE TRIGGER after_enrollment_delete
AFTER DELETE ON Enrollment
FOR EACH ROW
BEGIN
    IF OLD.status = 'ENROLLED' THEN
        UPDATE Section 
        SET current_enrollment = current_enrollment - 1
        WHERE section_id = OLD.section_id;
    END IF;
END //

-- Create trigger to handle enrollment status changes
CREATE TRIGGER after_enrollment_update
AFTER UPDATE ON Enrollment
FOR EACH ROW
BEGIN
    IF OLD.status = 'ENROLLED' AND NEW.status != 'ENROLLED' THEN
        -- Student dropped the course
        UPDATE Section 
        SET current_enrollment = current_enrollment - 1
        WHERE section_id = NEW.section_id;
    ELSEIF OLD.status != 'ENROLLED' AND NEW.status = 'ENROLLED' THEN
        -- Student enrolled in the course
        UPDATE Section 
        SET current_enrollment = current_enrollment + 1
        WHERE section_id = NEW.section_id;
    END IF;
END //

DELIMITER ; 