Tarrot-related DB schema

If you need to create the reviews table manually, run this SQL against your MySQL database:

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  rating INT DEFAULT 5,
  comment TEXT,
  product VARCHAR(100) DEFAULT 'tarrot',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

The server's init script will create this table automatically when it starts if it doesn't exist.
