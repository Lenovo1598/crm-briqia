-- Nuevos usuarios con rol admin (acceso total al CRM)
-- Contraseñas en texto plano: ver mensaje del chat (no quedan guardadas en este archivo)

INSERT INTO users (username, password, role, nombre)
VALUES
  ('marketing', '$2a$10$5uFRhYOM3jI.1J4D3ZvDB..UAukTHn.xci6mzjWtJykHuFh2FoYFS', 'admin', 'Marketing'),
  ('sergio',    '$2a$10$0bcPp1zlEOas5GiX.9oKvu0qeAjIer/I87EkDHr6A0on9nbe6hzYG', 'admin', 'Sergio'),
  ('karina',    '$2a$10$IxQje0Oddp1ykgY/0.l8rOQYEqmYepemvVbrMLp7urURcupEH6pRW', 'admin', 'Karina')
ON CONFLICT (username) DO NOTHING;

SELECT id, username, role, nombre FROM users;
