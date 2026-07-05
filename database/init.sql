-- Create database if not exists
CREATE DATABASE IF NOT EXISTS edtech_db;
USE edtech_db;

-- Seed Roles
INSERT INTO roles (name) VALUES ('ROLE_STUDENT') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO roles (name) VALUES ('ROLE_INSTRUCTOR') ON DUPLICATE KEY UPDATE id=id;
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON DUPLICATE KEY UPDATE id=id;

-- Seed Categories
INSERT INTO categories (name, description, slug) VALUES 
('Web Development', 'Learn HTML, CSS, JavaScript, Angular, Spring Boot and more.', 'web-development'),
('Data Science & AI', 'Master Python, Machine Learning, Deep Learning, and SQL.', 'data-science-ai'),
('Business & Marketing', 'Digital Marketing, Entrepreneurship, and Financial Analytics.', 'business-marketing')
ON DUPLICATE KEY UPDATE id=id;
