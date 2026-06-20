# 🔐 RESUMEN DE IMPLEMENTACIÓN — Autenticación JWT

## ¿Qué Se Creó?

Sistema completo de autenticación JWT para **Stragora Alliance CRM** siguiendo exactamente la arquitectura del `ARQUITECTURA-CRM-STRAGORA-ALLIANCE.md`.

---

## 📂 Carpeta de Archivos Importantes

```
📦 CRM/
├── 🔐 SEGURIDAD
│   ├── middleware.ts              ← Valida JWT en TODAS las rutas
│   ├── lib/auth.ts                ← Funciones JWT + bcrypt
│   └── lib/db.ts                  ← Conexión PostgreSQL
│
├── 🌐 API ROUTES
│   └── app/api/auth/
│       ├── login/route.ts         ← POST: username + password → JWT
│       └── me/route.ts            ← GET: obtener usuario actual
│
├── 💻 FRONTEND
│   ├── hooks/useAuth.tsx          ← Hook + Context
│   ├── components/layout/
│   │   └── AuthGuard.tsx          ← Protege rutas
│   ├── app/login/page.tsx         ← Página login
│   └── app/dashboard/page.tsx     ← Dashboard protegido
│
├── ⚙️ CONFIGURACIÓN
│   ├── package.json               ← Dependencias
│   ├── tsconfig.json              ← TypeScript
│   ├── tailwind.config.ts         ← Tailwind
│   ├── next.config.js             ← Next.js
│   ├── .env.local                 ← Variables secretas
│   └── .env.local.example         ← Template
│
├── 📊 BD
│   └── sql/init-auth.sql          ← Script de usuarios
│
└── 📚 DOCS
    ├── AUTH-SETUP.md              ← Guía completa
    ├── IMPLEMENTACION-JWT.md      ← Este archivo
    └── scripts/hash-password.js   ← Generador de hashes
```

---

## 🔄 Flujo de Autenticación

```
1. Usuario va a /login
                ↓
2. Ingresa username + password
                ↓
3. POST /api/auth/login
                ↓
4. Backend verifica en BD + hashPassword
                ↓
5. ✅ Correcto → Genera JWT (7 días)
                ↓
6. Devuelve: { token, user }
                ↓
7. Cliente guarda en localStorage
                ↓
8. Redirige a /dashboard
                ↓
9. Cada request envía:
   Authorization: Bearer <JWT>
                ↓
10. Middleware valida JWT
                ↓
11. ✅ Si válido → acceso permitido
❌ Si expirado → 401 Unauthorized → /login
```

---

## 🔑 Credenciales Incluidas

```javascript
// Después de ejecutar sql/init-auth.sql:

{
  "usuarios": [
    {
      "username": "admin",
      "password": "Admin@123",
      "rol": "Administrador (acceso total)"
    },
    {
      "username": "demo", 
      "password": "Demo@123",
      "rol": "Usuario (sin botón ON/OFF)"
    }
  ]
}

// ⚠️ CAMBIAR EN PRODUCCIÓN
```

---

## 🛡️ Seguridad Implementada

### ✅ Contraseñas
```
Algoritmo: bcrypt (10 rounds)
Ejemplo hash: $2a$10$aVKZ6VHQpHQr7MIlVNmzJOhFcVTGfWwFM.r9PW2eXPhXbKzVJBiZC
```

### ✅ Tokens JWT
```
Formato: HEADER.PAYLOAD.SIGNATURE
Algoritmo: HS256 (HMAC-SHA256)
Contenido payload:
  {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "nombre": "Andrés Ali",
    "exp": 1714867200,  // +7 días
    "iat": 1714262400
  }
```

### ✅ Middleware
- Valida JWT en TODAS las rutas privadas
- Status 401 si token inválido/expirado
- Rutas públicas: /login, /api/auth/login

### ✅ LocalStorage
- Token guardado como: `localStorage.auth_token`
- Enviado en header: `Authorization: Bearer <token>`

---

## 🚀 Inicio Rápido

### 1. Instalación
```bash
cd /path/to/CRM
npm install
```

### 2. Configurar .env.local
```env
DATABASE_URL=postgresql://...
JWT_SECRET=<generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

### 3. Inicializar BD
```bash
# Opción A: Supabase
# → SQL Editor > New Query > pegar sql/init-auth.sql

# Opción B: PostgreSQL local
psql stragora_alliance_crm < sql/init-auth.sql
```

### 4. Desarrollo
```bash
npm run dev
# http://localhost:3000/login
```

### 5. Loguear
```
Usuario: admin
Contraseña: Admin@123
```

---

## 📋 API Endpoints

| Método | Ruta | Headers | Body | Respuesta | Status |
|--------|------|---------|------|-----------|--------|
| POST | `/api/auth/login` | — | `{ username, password }` | `{ token, user }` | 200 ✅ / 401 ❌ |
| GET | `/api/auth/me` | `Authorization: Bearer <JWT>` | — | `{ id, username, role, nombre }` | 200 ✅ / 401 ❌ |

---

## 🔧 Crear Nuevo Usuario (Después de Setup)

### Opción A: SQL Directo
```javascript
// 1. Generar hash
node scripts/hash-password.js "MiContraseña123"

// 2. Copiar hash (output del comando)
// 3. Ejecutar SQL:
```

```sql
INSERT INTO users (username, password, role, nombre)
VALUES ('nuevo_usuario', '<hash_copiado>', 'user', 'Nombre Completo');
```

### Opción B: Crear API route de CRUD (Fase 2)
- Implementar `POST /api/users` (solo admin)
- Validar datos
- Hashear contraseña automáticamente

---

## 🧪 Testing

### Login correcto
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@123"}'

# Respuesta esperada:
# {
#   "token": "eyJhbGc...",
#   "user": {
#     "id": 1,
#     "username": "admin",
#     "role": "admin",
#     "nombre": "Andrés Ali"
#   }
# }
```

### Obtener usuario actual (con JWT)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..."

# Respuesta esperada:
# {
#   "id": 1,
#   "username": "admin",
#   "role": "admin",
#   "nombre": "Andrés Ali"
# }
```

### Login incorrecto
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "WrongPassword"}'

# Respuesta esperada (401):
# {"error": "Usuario o contraseña incorrectos"}
```

---

## ⚠️ Variables de Entorno

**OBLIGATORIAS:**
- `DATABASE_URL` — Conexión PostgreSQL
- `JWT_SECRET` — Secreto para firmar JWT (mín 32 chars)

**OPCIONALES:**
- `NEXT_PUBLIC_APP_NAME` — Nombre app (default: "Stragora Alliance")
- `NODE_ENV` — "development" o "production"

---

## 📊 Tabla Users (Schema)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,                    -- Hash bcrypt
  role VARCHAR(20) DEFAULT 'user',           -- 'admin' o 'user'
  nombre VARCHAR(200),                       -- Nombre completo
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔍 Troubleshooting

| Problema | Solución |
|----------|----------|
| Login rechazado | Verificar usuario en BD: `SELECT * FROM users WHERE username='admin';` |
| 401 Unauthorized | Verificar JWT en header Authorization |
| Token expirado (7d) | Hacer login nuevamente |
| DATABASE_URL error | Verificar `.env.local` y restart servidor |
| JWT_SECRET error | Generar secreto e ingresar en `.env.local` |

---

## 📚 Archivos Clave para Modificar Luego

1. **Agregar roles personalizados:**
   - `lib/auth.ts` → expandir `type User`
   - `sql/init-auth.sql` → nuevos valores en CHECK

2. **Cambiar expiración JWT:**
   - `lib/auth.ts` → función `createToken()` → `expiresIn: '30d'`

3. **Agregar 2FA (futuro):**
   - `app/api/auth/login/route.ts` → validación extra
   - `app/login/page.tsx` → formulario 2FA

4. **Rate limiting:**
   - `app/api/auth/login/route.ts` → agregar middleware de rate limit

---

## ✅ CHECKLIST FINAL

- [ ] `npm install` ejecutado
- [ ] `.env.local` con DATABASE_URL y JWT_SECRET
- [ ] `sql/init-auth.sql` ejecutado en BD
- [ ] `npm run dev` corriendo
- [ ] `/login` cargando sin errores
- [ ] Logueo con admin/Admin@123 funciona
- [ ] Dashboard muestra nombre del usuario
- [ ] Logout funciona y redirige a /login
- [ ] Token se guarda en localStorage
- [ ] `curl /api/auth/me` con JWT funciona

---

**🎉 ¡AUTENTICACIÓN JWT LISTA!**

Siguiente: Migrar Kanban de leads + integración con BD

Referencia: `ARQUITECTURA-CRM-STRAGORA-ALLIANCE.md` ✅
