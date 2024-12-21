-- Section table definition
CREATE TABLE IF NOT EXISTS Section (
    section_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id VARCHAR(10) NOT NULL,
    instructor_id INT UNSIGNED NOT NULL,
    semester ENUM('FALL', 'SPRING', 'SUMMER') NOT NULL,
    year YEAR NOT NULL,
    room_number VARCHAR(20),
    schedule JSON NOT NULL COMMENT 'Format: {
        "meetings": [
            {
                "days": ["MON", "THU"],
                "startTime": "12:15",
                "endTime": "13:40",
                "format": "IN_PERSON",
                "room": "CS-105"
            }
        ]
    }',
    max_capacity SMALLINT UNSIGNED NOT NULL DEFAULT 30,
    current_enrollment SMALLINT UNSIGNED DEFAULT 0,
    max_waitlist SMALLINT UNSIGNED DEFAULT 10,
    current_waitlist SMALLINT UNSIGNED DEFAULT 0,
    status ENUM('OPEN', 'CLOSED', 'WAITLIST_AVAILABLE', 'CANCELLED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_section_course FOREIGN KEY (course_id) 
        REFERENCES Course(course_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_section_instructor FOREIGN KEY (instructor_id) 
        REFERENCES Instructor(instructor_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_section_capacity CHECK (current_enrollment <= max_capacity),
    CONSTRAINT chk_section_waitlist CHECK (current_waitlist <= max_waitlist),
    CONSTRAINT chk_section_year CHECK (year BETWEEN 2000 AND 2100),
    CONSTRAINT chk_schedule_format CHECK (JSON_VALID(schedule)),
    
    -- Indexes
    INDEX idx_section_semester_year (semester, year),
    INDEX idx_section_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
