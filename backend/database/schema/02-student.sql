-- Student table definition
CREATE TABLE IF NOT EXISTS Student (
    student_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    major VARCHAR(50),
    enrollment_date DATE NOT NULL,
    gpa DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_student_gpa CHECK (gpa >= 0.00 AND gpa <= 4.00),
    CONSTRAINT chk_student_email_format 
        CHECK (email REGEXP '^[a-z]+\.[a-z]+[0-9]{2}(\.[0-9]+)?@my\.johndoe\.edu$'),
    
    -- Indexes
    INDEX idx_student_name (last_name, first_name),
    UNIQUE INDEX idx_student_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
