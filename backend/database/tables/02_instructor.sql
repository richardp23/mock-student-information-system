-- Instructor table definition
CREATE TABLE IF NOT EXISTS Instructor (
    instructor_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    office_location VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_instructor_email_format 
        CHECK (email REGEXP '^[a-z]{7}[a-z]([0-9]+)?@johndoe\.edu$'),
    CONSTRAINT chk_phone_format 
        CHECK (phone REGEXP '^[0-9]{3}-[0-9]{3}-[0-9]{4}$'),
    
    -- Indexes
    INDEX idx_instructor_name (last_name, first_name),
    INDEX idx_instructor_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
