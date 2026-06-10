-- ═══════════════════════════════════════
-- INICIALIZACIÓN DE BASE DE DATOS
-- Stragora Alliance CRM - Autenticación JWT
-- ═══════════════════════════════════════

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  nombre VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índice para búsqueda rápida de usuarios
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Usuario admin de prueba
-- Password: Admin@123 (hash bcrypt)
-- Para cambiar: hacer hash con bcrypt de tu contraseña deseada
INSERT INTO users (username, password, role, nombre)
VALUES (
  'admin',
  '$2a$10$aVKZ6VHQpHQr7MIlVNmzJOhFcVTGfWwFM.r9PW2eXPhXbKzVJBiZC',
  'admin',
  'Andrés Ali'
) ON CONFLICT (username) DO NOTHING;

-- Usuario demo
-- Password: Demo@123
INSERT INTO users (username, password, role, nombre)
VALUES (
  'demo',
  '$2a$10$D/fWaJqaKIgHrfQdJb5/JO6pNPHJMnz2dS8.FMjKTNYqpj0lrWLu6',
  'user',
  'Usuario Demo'
) ON CONFLICT (username) DO NOTHING;

-- Verificar usuarios creados
SELECT id, username, role, nombre FROM users;

-- ═══════════════════════════════════════
-- NOTAS IMPORTANTES
-- ═══════════════════════════════════════

-- Los hashes de contraseña fueron generados con bcrypt (salt rounds: 10)
-- 
-- Para generar un nuevo hash en Node.js:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hashSync('TU_CONTRASEÑA', 10)
--
-- Usuarios de prueba:
-- admin / Admin@123
-- demo / Demo@123
--
-- Cambiar en producción INMEDIATAMENTE
