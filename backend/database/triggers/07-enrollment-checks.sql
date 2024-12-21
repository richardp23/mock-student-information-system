USE student_db;

SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS check_prerequisites;
DROP TRIGGER IF EXISTS before_enrollment_insert;
DROP TRIGGER IF EXISTS after_enrollment_insert;
DROP TRIGGER IF EXISTS after_enrollment_update;
DROP TRIGGER IF EXISTS after_enrollment_delete;

DELIMITER //

-- Create the main enrollment validation trigger
CREATE TRIGGER before_enrollment_insert
BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    DECLARE section_capacity INT;
    DECLARE current_enrollment INT;
    DECLARE course_id VARCHAR(10);
    DECLARE has_existing_enrollment BOOLEAN;
    DECLARE prerequisite_id VARCHAR(10);
    DECLARE has_completed_prerequisite BOOLEAN;

    -- Get the course_id for the section being enrolled in
    SELECT s.course_id, s.max_capacity, s.current_enrollment 
    INTO course_id, section_capacity, current_enrollment
    FROM Section s 
    WHERE s.section_id = NEW.section_id;

    -- Check if student is already enrolled in or has completed this course
    SELECT EXISTS (
        SELECT 1 
        FROM Enrollment e 
        JOIN Section s ON e.section_id = s.section_id 
        WHERE e.student_id = NEW.student_id 
        AND s.course_id = course_id
        AND e.status IN ('ENROLLED', 'COMPLETED')
    ) INTO has_existing_enrollment;

    IF has_existing_enrollment THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student is already enrolled in or has completed this course';
    END IF;

    -- Check section capacity
    IF current_enrollment >= section_capacity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Section is full';
    END IF;

    -- Get prerequisite course if exists
    SELECT c.prerequisite_id 
    INTO prerequisite_id
    FROM Course c
    WHERE c.course_id = course_id;

    IF prerequisite_id IS NOT NULL THEN
        -- Check if student has completed the prerequisite
        SELECT EXISTS (
            SELECT 1 
            FROM Enrollment e 
            JOIN Section s ON e.section_id = s.section_id 
            WHERE e.student_id = NEW.student_id 
            AND s.course_id = prerequisite_id 
            AND e.status = 'COMPLETED'
            AND e.grade NOT IN ('F', 'D', 'D+')
        ) INTO has_completed_prerequisite;

        IF NOT has_completed_prerequisite THEN
            SET @message = CONCAT('Prerequisites not met: Must complete ', prerequisite_id, ' first');
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = @message;
        END IF;
    END IF;
END//

-- Create trigger to handle enrollment count updates
CREATE TRIGGER after_enrollment_insert
AFTER INSERT ON Enrollment
FOR EACH ROW
BEGIN
    IF NEW.status = 'ENROLLED' THEN
        UPDATE Section 
        SET current_enrollment = current_enrollment + 1
        WHERE section_id = NEW.section_id;
    END IF;
END//

-- Create trigger to handle status changes and grade updates
CREATE TRIGGER after_enrollment_update
AFTER UPDATE ON Enrollment
FOR EACH ROW
BEGIN
    -- Handle enrollment count changes
    IF OLD.status = 'ENROLLED' AND NEW.status != 'ENROLLED' THEN
        -- Student dropped or completed the course
        UPDATE Section 
        SET current_enrollment = current_enrollment - 1
        WHERE section_id = NEW.section_id;
    ELSEIF OLD.status != 'ENROLLED' AND NEW.status = 'ENROLLED' THEN
        -- Student enrolled in the course
        UPDATE Section 
        SET current_enrollment = current_enrollment + 1
        WHERE section_id = NEW.section_id;
    END IF;

    -- Handle grade updates
    IF NEW.grade IS NOT NULL 
       AND NEW.grade != 'W' 
       AND NEW.grade != 'I' 
       AND NEW.status != 'COMPLETED' THEN
        -- Update status to COMPLETED when a final grade is assigned
        UPDATE Enrollment
        SET status = 'COMPLETED'
        WHERE enrollment_id = NEW.enrollment_id;
    END IF;
END//

-- Create trigger to handle enrollment deletions
CREATE TRIGGER after_enrollment_delete
AFTER DELETE ON Enrollment
FOR EACH ROW
BEGIN
    IF OLD.status = 'ENROLLED' THEN
        UPDATE Section 
        SET current_enrollment = current_enrollment - 1
        WHERE section_id = OLD.section_id;
    END IF;
END//

DELIMITER ; 