USE logisticsdb;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'USER'
);

INSERT INTO users (name, email, password, role) VALUES
('Admin Uno', 'admin@demo.com', '$2a$10$F7CrK4.TFT046OHu3p3Q6OIG9fh1AjGMbmSLoH7wUqGPYtdNwVQ1W', 'ADMIN'),
('Angie', 'Angie@gmail.com', '$2a$10$9UOab1BguBDTHNlLj.YM/eGg6UQn/HB6anEhrngzaH30uu3ZC7ZdS', 'USER'),
('Angie', 'AngieVanegas@gmail.com', '$2a$10$ipAkuv3O/ESy5hgEsdmnLejNoeXyKfwTbIi2OkcsChydnbIpADCkG', 'ADMIN');


