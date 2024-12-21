USE student_db;

SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS check_prerequisites;
DROP TRIGGER IF EXISTS before_enrollment_insert;
DROP TRIGGER IF EXISTS after_enrollment_insert;
DROP TRIGGER IF EXISTS after_enrollment_update;
DROP TRIGGER IF EXISTS after_enrollment_delete;
DROP TRIGGER IF EXISTS after_section_update;

DELIMITER //

-- Create the main enrollment validation trigger
CREATE TRIGGER before_enrollment_insert
BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    DECLARE section_capacity INT;
    DECLARE current_enrollment INT;
    DECLARE max_waitlist INT;
    DECLARE current_waitlist INT;
    DECLARE course_id VARCHAR(10);
    DECLARE has_existing_enrollment BOOLEAN;
    DECLARE prerequisite_id VARCHAR(10);
    DECLARE has_completed_prerequisite BOOLEAN;
    DECLARE has_completed_course BOOLEAN;

    -- Get the course_id and section details for the section being enrolled in
    SELECT s.course_id, s.max_capacity, s.current_enrollment, s.max_waitlist, s.current_waitlist
    INTO course_id, section_capacity, current_enrollment, max_waitlist, current_waitlist
    FROM Section s 
    WHERE s.section_id = NEW.section_id;

    -- Check if student has completed this course with a passing grade
    SELECT EXISTS (
        SELECT 1 
        FROM Enrollment e 
        JOIN Section s ON e.section_id = s.section_id 
        WHERE e.student_id = NEW.student_id 
        AND s.course_id = course_id
        AND e.status = 'COMPLETED'
        AND e.grade NOT IN ('F', 'D', 'D+')
    ) INTO has_completed_course;

    IF has_completed_course THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot register for a course that has been successfully completed';
    END IF;

    -- Check if student is currently enrolled in or waitlisted for any section of this course
    -- Explicitly exclude DROPPED status
    SELECT EXISTS (
        SELECT 1 
        FROM Enrollment e 
        JOIN Section s ON e.section_id = s.section_id 
        WHERE e.student_id = NEW.student_id 
        AND s.course_id = course_id
        AND e.status IN ('ENROLLED', 'WAITLISTED')
    ) INTO has_existing_enrollment;

    IF has_existing_enrollment THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student is already enrolled in or waitlisted for another section of this course';
    END IF;

    -- Check prerequisites before allowing enrollment or waitlist
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

    -- If trying to enroll directly
    IF NEW.status = 'ENROLLED' THEN
        -- Check if section is full
        IF current_enrollment >= section_capacity THEN
            -- If waitlist is available and not full, automatically put them on waitlist
            IF current_waitlist < max_waitlist THEN
                SET NEW.status = 'WAITLISTED';
            ELSE
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Section is full and waitlist is full';
            END IF;
        END IF;
    -- If trying to join waitlist directly
    ELSEIF NEW.status = 'WAITLISTED' THEN
        -- Check if waitlist is full
        IF current_waitlist >= max_waitlist THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Waitlist is full';
        END IF;
        -- Check if there are actually open spots (shouldn't waitlist if spots available)
        IF current_enrollment < section_capacity THEN
            SET NEW.status = 'ENROLLED';
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
    ELSEIF NEW.status = 'WAITLISTED' THEN
        UPDATE Section 
        SET current_waitlist = current_waitlist + 1
        WHERE section_id = NEW.section_id;
    END IF;
END//

-- Create trigger to handle status changes and grade updates
CREATE TRIGGER after_enrollment_update
AFTER UPDATE ON Enrollment
FOR EACH ROW
BEGIN
    -- Handle enrollment count changes
    IF OLD.status != NEW.status THEN
        -- Handle decrements for old status
        IF OLD.status = 'ENROLLED' THEN
            UPDATE Section 
            SET current_enrollment = current_enrollment - 1
            WHERE section_id = NEW.section_id;
        ELSEIF OLD.status = 'WAITLISTED' THEN
            UPDATE Section 
            SET current_waitlist = current_waitlist - 1
            WHERE section_id = NEW.section_id;
        END IF;

        -- Handle increments for new status
        IF NEW.status = 'ENROLLED' THEN
            UPDATE Section 
            SET current_enrollment = current_enrollment + 1
            WHERE section_id = NEW.section_id;
        ELSEIF NEW.status = 'WAITLISTED' THEN
            UPDATE Section 
            SET current_waitlist = current_waitlist + 1
            WHERE section_id = NEW.section_id;
        END IF;
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
    ELSEIF OLD.status = 'WAITLISTED' THEN
        UPDATE Section 
        SET current_waitlist = current_waitlist - 1
        WHERE section_id = OLD.section_id;
    END IF;
END//

-- Create trigger to handle automatic waitlist promotion
CREATE TRIGGER after_section_update
AFTER UPDATE ON Section
FOR EACH ROW
BEGIN
    DECLARE student_to_promote INT;
    DECLARE section_to_update INT;

    -- If a spot opened up (enrollment decreased) and there are people on waitlist
    IF NEW.current_enrollment < OLD.current_enrollment 
       AND NEW.current_waitlist > 0 THEN
        -- Find the first student on the waitlist (by enrollment date)
        SELECT enrollment_id, student_id
        INTO student_to_promote
        FROM Enrollment
        WHERE section_id = NEW.section_id
        AND status = 'WAITLISTED'
        ORDER BY enrollment_date ASC
        LIMIT 1;

        -- If we found a student to promote
        IF student_to_promote IS NOT NULL THEN
            -- Update their status to enrolled
            UPDATE Enrollment
            SET status = 'ENROLLED'
            WHERE enrollment_id = student_to_promote;
        END IF;
    END IF;
END//

DELIMITER ; 