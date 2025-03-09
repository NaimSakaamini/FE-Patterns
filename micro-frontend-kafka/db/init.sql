-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create todos table (for main app)
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table (for feature app)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO users (username, email, password_hash) VALUES
('user1', 'user1@example.com', '$2b$10$1234567890123456789012'), -- In a real app, use proper password hashing
('user2', 'user2@example.com', '$2b$10$1234567890123456789012');

INSERT INTO todos (user_id, title, completed) VALUES
(1, 'Learn Kafka', false),
(1, 'Build Micro Frontend', false),
(2, 'Setup PostgreSQL', true);

INSERT INTO categories (user_id, name) VALUES
(1, 'Work'),
(1, 'Personal'),
(2, 'Shopping'); 