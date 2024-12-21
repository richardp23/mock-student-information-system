-- Course table definition
CREATE TABLE IF NOT EXISTS Course (
    course_id VARCHAR(10) PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    description TEXT,
    credits TINYINT UNSIGNED NOT NULL,
    department VARCHAR(50) NOT NULL,
    prerequisite_id VARCHAR(10),
    level ENUM('FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR', 'GRADUATE') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_course_credits CHECK (credits > 0 AND credits <= 6),
    CONSTRAINT fk_course_prerequisite FOREIGN KEY (prerequisite_id) 
        REFERENCES Course(course_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_course_department (department),
    FULLTEXT INDEX idx_course_description (description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
