#!/usr/bin/env node

/**
 * Generador de hashes bcrypt para contraseñas
 * Uso: node scripts/hash-password.js "tu_contraseña"
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Debes proporcionar una contraseña');
  console.error('Uso: node scripts/hash-password.js "tu_contraseña"');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('\n✅ Hash generado:\n');
console.log(hash);
console.log('\n💡 Usar este valor en la columna "password" de la tabla users\n');

// Ejemplo SQL
console.log('📋 Ejemplo SQL:\n');
console.log(`INSERT INTO users (username, password, role, nombre)`);
console.log(`VALUES ('nuevo_usuario', '${hash}', 'user', 'Nombre Completo');\n`);
