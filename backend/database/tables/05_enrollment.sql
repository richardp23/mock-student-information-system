-- Enrollment table definition
CREATE TABLE IF NOT EXISTS Enrollment (
    student_id INT UNSIGNED,
    section_id INT UNSIGNED,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade ENUM('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F') DEFAULT NULL,
    status ENUM('ENROLLED', 'DROPPED', 'COMPLETED', 'WAITLISTED') DEFAULT 'ENROLLED',
    waitlist_position SMALLINT UNSIGNED DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Primary Key
    PRIMARY KEY (student_id, section_id),
    
    -- Constraints
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) 
        REFERENCES Student(student_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_enrollment_section FOREIGN KEY (section_id) 
        REFERENCES Section(section_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_waitlist_position CHECK (
        (status = 'WAITLISTED' AND waitlist_position IS NOT NULL) OR
        (status != 'WAITLISTED' AND waitlist_position IS NULL)
    ),
    
    -- Indexes
    INDEX idx_enrollment_status (status),
    INDEX idx_enrollment_grade (grade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
