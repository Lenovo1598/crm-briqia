# 🔐 Team Ali CRM — Autenticación JWT

## Guía de Configuración

### 1️⃣ Requisitos Previos
- Node.js 18+ 
- PostgreSQL 12+
- npm o pnpm

### 2️⃣ Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local (copiar de .env.local.example si existe)
cp .env.local.example .env.local
```

### 3️⃣ Configurar Base de Datos

#### Opción A: Supabase (Recomendado)
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar connection string a `DATABASE_URL` en `.env.local`
3. Ejecutar SQL de inicialización en editor SQL de Supabase:
   ```sql
   -- Ir a SQL Editor > New Query
   -- Pegar contenido de sql/init-auth.sql
   ```

#### Opción B: PostgreSQL Local
```bash
# Crear base de datos
createdb team_ali_crm

# Conectar y ejecutar SQL
psql team_ali_crm < sql/init-auth.sql

# Actualizar .env.local
DATABASE_URL=postgresql://usuario:password@localhost:5432/team_ali_crm
```

### 4️⃣ Configurar JWT_SECRET

```bash
# Generar secreto seguro (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar output a JWT_SECRET en .env.local
# Mínimo 32 caracteres
```

### 5️⃣ Iniciar Desarrollo

```bash
npm run dev
```

Acceder a: http://localhost:3000/login

### 6️⃣ Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `Admin@123` | Administrador |
| `demo` | `Demo@123` | Usuario |

⚠️ **CAMBIAR en producción inmediatamente**

---

## 📋 Estructura de Autenticación

### Rutas Públicas
- `GET /login` — Página de login
- `POST /api/auth/login` — Autenticación (sin protección)

### Rutas Protegidas
Todas las demás rutas requieren header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints de Auth
- `POST /api/auth/login` — { username, password } → { token, user }
- `GET /api/auth/me` — Obtener usuario actual (requiere JWT)

### Almacenamiento de Token
- Cliente: `localStorage.auth_token`
- Servidor: Header `Authorization: Bearer <token>`
- Expiración: 7 días

---

## 🔑 Crear Nuevo Usuario (Admin)

### Opción 1: SQL Directo
```sql
-- Generar hash de contraseña con bcrypt en Node.js primero
-- node -e "console.log(require('bcryptjs').hashSync('CONTRASEÑA', 10))"

INSERT INTO users (username, password, role, nombre)
VALUES ('nuevo_usuario', '<hash_bcrypt>', 'user', 'Nombre Completo');
```

### Opción 2: API Route (Fase 2)
Por implementar: `POST /api/users` (solo admin)

---

## 🛡️ Seguridad

✅ Contraseñas hasheadas con bcrypt (10 rounds)  
✅ JWT con HMAC-SHA256  
✅ Tokens con expiración de 7 días  
✅ Middleware verifica JWT en todas las rutas  
✅ Roles: admin vs user (control de permisos)  
✅ HTTPS recomendado en producción  

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL no está definido"
- Verificar `.env.local` existe
- Restart servidor: `npm run dev`

### Error: "JWT_SECRET no está definido"
- Idem: verificar `.env.local` y restart

### Login rechazado
- Verificar usuario existe: `SELECT * FROM users WHERE username = 'admin';`
- Verificar hash de contraseña es correcto
- Ver logs de servidor para errores

### Token expirado
- Hacer login nuevamente
- El cliente automáticamente redirige a `/login`

---

## 📚 Siguiente Fase

- [ ] CRUD de usuarios (admin only)
- [ ] Recuperación de contraseña
- [ ] Two-factor authentication (opcional)
- [ ] Sesiones: logout en todas las pestañas
- [ ] Rate limiting en login

---

**Referencia:** `ARQUITECTURA-CRM-TEAM-ALI.md` → Sección 5: API Routes
