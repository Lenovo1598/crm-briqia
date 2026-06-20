# ðŸ” Briqia CRM â€” AutenticaciÃ³n JWT

## GuÃ­a de ConfiguraciÃ³n

### 1ï¸âƒ£ Requisitos Previos
- Node.js 18+ 
- PostgreSQL 12+
- npm o pnpm

### 2ï¸âƒ£ InstalaciÃ³n

```bash
# Instalar dependencias
npm install

# Crear archivo .env.local (copiar de .env.local.example si existe)
cp .env.local.example .env.local
```

### 3ï¸âƒ£ Configurar Base de Datos

#### OpciÃ³n A: Supabase (Recomendado)
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar connection string a `DATABASE_URL` en `.env.local`
3. Ejecutar SQL de inicializaciÃ³n en editor SQL de Supabase:
   ```sql
   -- Ir a SQL Editor > New Query
   -- Pegar contenido de sql/init-auth.sql
   ```

#### OpciÃ³n B: PostgreSQL Local
```bash
# Crear base de datos
createdb BRIQIA_alliance_crm

# Conectar y ejecutar SQL
psql BRIQIA_alliance_crm < sql/init-auth.sql

# Actualizar .env.local
DATABASE_URL=postgresql://usuario:password@localhost:5432/BRIQIA_alliance_crm
```

### 4ï¸âƒ£ Configurar JWT_SECRET

```bash
# Generar secreto seguro (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar output a JWT_SECRET en .env.local
# MÃ­nimo 32 caracteres
```

### 5ï¸âƒ£ Iniciar Desarrollo

```bash
npm run dev
```

Acceder a: http://localhost:3000/login

### 6ï¸âƒ£ Credenciales de Prueba

| Usuario | ContraseÃ±a | Rol |
|---------|-----------|-----|
| `admin` | `Admin@123` | Administrador |
| `demo` | `Demo@123` | Usuario |

âš ï¸ **CAMBIAR en producciÃ³n inmediatamente**

---

## ðŸ“‹ Estructura de AutenticaciÃ³n

### Rutas PÃºblicas
- `GET /login` â€” PÃ¡gina de login
- `POST /api/auth/login` â€” AutenticaciÃ³n (sin protecciÃ³n)

### Rutas Protegidas
Todas las demÃ¡s rutas requieren header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints de Auth
- `POST /api/auth/login` â€” { username, password } â†’ { token, user }
- `GET /api/auth/me` â€” Obtener usuario actual (requiere JWT)

### Almacenamiento de Token
- Cliente: `localStorage.auth_token`
- Servidor: Header `Authorization: Bearer <token>`
- ExpiraciÃ³n: 7 dÃ­as

---

## ðŸ”‘ Crear Nuevo Usuario (Admin)

### OpciÃ³n 1: SQL Directo
```sql
-- Generar hash de contraseÃ±a con bcrypt en Node.js primero
-- node -e "console.log(require('bcryptjs').hashSync('CONTRASEÃ‘A', 10))"

INSERT INTO users (username, password, role, nombre)
VALUES ('nuevo_usuario', '<hash_bcrypt>', 'user', 'Nombre Completo');
```

### OpciÃ³n 2: API Route (Fase 2)
Por implementar: `POST /api/users` (solo admin)

---

## ðŸ›¡ï¸ Seguridad

âœ… ContraseÃ±as hasheadas con bcrypt (10 rounds)  
âœ… JWT con HMAC-SHA256  
âœ… Tokens con expiraciÃ³n de 7 dÃ­as  
âœ… Middleware verifica JWT en todas las rutas  
âœ… Roles: admin vs user (control de permisos)  
âœ… HTTPS recomendado en producciÃ³n  

---

## ðŸ› Troubleshooting

### Error: "DATABASE_URL no estÃ¡ definido"
- Verificar `.env.local` existe
- Restart servidor: `npm run dev`

### Error: "JWT_SECRET no estÃ¡ definido"
- Idem: verificar `.env.local` y restart

### Login rechazado
- Verificar usuario existe: `SELECT * FROM users WHERE username = 'admin';`
- Verificar hash de contraseÃ±a es correcto
- Ver logs de servidor para errores

### Token expirado
- Hacer login nuevamente
- El cliente automÃ¡ticamente redirige a `/login`

---

## ðŸ“š Siguiente Fase

- [ ] CRUD de usuarios (admin only)
- [ ] RecuperaciÃ³n de contraseÃ±a
- [ ] Two-factor authentication (opcional)
- [ ] Sesiones: logout en todas las pestaÃ±as
- [ ] Rate limiting en login

---

**Referencia:** `ARQUITECTURA-CRM-BRIQIA-ALLIANCE.md` â†’ SecciÃ³n 5: API Routes
