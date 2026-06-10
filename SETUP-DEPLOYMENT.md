# 🚀 SETUP Y DEPLOYMENT - CRM STRAGORA ALLIANCE

## Fase 1: Preparación del Entorno

### 1.1 Node.js y npm
```bash
# Verificar versiones (Node 18+ requerido)
node --version  # v18.0.0 o superior
npm --version   # v8.0.0 o superior
```

### 1.2 Variables de Entorno
```bash
# Copiar template
cp .env.local.example .env.local

# Editar .env.local con valores reales:
# - DATABASE_URL: connection string de PostgreSQL
# - JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
# - NODE_ENV: development o production
```

**⚠️ IMPORTANTE:** Guardar `.env.local` en `.gitignore` (nunca commitear secrets)

### 1.3 Base de Datos
```bash
# OPCIÓN A: Supabase Cloud (RECOMENDADO)
# 1. Crear proyecto en supabase.com
# 2. Settings → Database → Connection string (URI)
# 3. Copiar y pegar en DATABASE_URL

# OPCIÓN B: PostgreSQL Local
# 1. Instalar PostgreSQL 14+
# 2. Crear database:
#    createdb stragora_alliance_crm
# 3. Connection string:
#    postgresql://postgres:password@localhost:5432/stragora_alliance_crm
```

---

## Fase 2: Inicialización de BD

### 2.1 Crear Tablas
```bash
# BASH (Linux/Mac)
psql $DATABASE_URL < sql/init-auth.sql
psql $DATABASE_URL < sql/init-kanban.sql

# POWERSHELL (Windows)
$env:DATABASE_URL | psql -f sql/init-auth.sql
$env:DATABASE_URL | psql -f sql/init-kanban.sql

# O usar cliente Supabase UI directamente
```

### 2.2 Verificar Tablas
```sql
-- En cliente PostgreSQL
\dt  -- Listar tablas (debe mostrar: users, kanban_columns)

SELECT * FROM users;  -- Ver datos iniciales
SELECT * FROM kanban_columns;  -- Ver columnas Kanban
```

**Datos iniciales:**

| usuarios | roles |
|----------|-------|
| admin / Admin@123 | Administrador |
| demo / Demo@123 | Usuario |

| columnas Kanban | orden | color |
|---|---|---|
| Frío | 1 | #6B7280 |
| Tibios | 2 | #F59E0B |
| Visitas | 3 | #3B82F6 |
| Calientes | 4 | #EF4444 |
| Llamadas | 5 | #10B981 |

---

## Fase 3: Instalación de Dependencias

```bash
# Instalar todos los packages del package.json
npm install

# Verificar instalación
npm list react next

# Limpiar cache si hay problemas
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Packages principales:**
- next@14.0.0
- react@18.2.0
- typescript@5.0.0
- tailwindcss@3.4.0
- pg@8.9.0
- bcryptjs@2.4.3
- jsonwebtoken@9.0.0
- lucide-react@0.263.1

---

## Fase 4: Desarrollo Local

### 4.1 Iniciar servidor
```bash
npm run dev

# Output esperado:
# ▲ Next.js 14.0.0
# - Local:        http://localhost:3000
# - Environments: .env.local
```

### 4.2 Acceder a aplicación
```
http://localhost:3000
→ Auto-redirige a /login (si no autenticado)
```

### 4.3 Login
```
Usuario: admin
Password: Admin@123

→ Redirecciona a /dashboard
```

---

## Fase 5: Testing de Funcionalidades

### ✅ Test 1: Autenticación
- [ ] Login con admin/Admin@123
- [ ] Token aparece en localStorage.auth_token
- [ ] Dashboard muestra usuario "Administrador"
- [ ] Click "Cerrar Sesión" limpia token
- [ ] Redirecciona a /login

### ✅ Test 2: Dashboard
- [ ] Cargan estadísticas (Total, Últimos 7, Últimos 30 días)
- [ ] Info del usuario es correcta
- [ ] Links rápidos funcionales

### ✅ Test 3: Navegación (Sidebar)
- [ ] Todos los links del sidebar funcionan
- [ ] Indicador "activo" funciona
- [ ] Collapse/expand en mobile
- [ ] Logo y nombre visible

### ✅ Test 4: Kanban Board
- [ ] Se cargan todas las columnas
- [ ] Leads distribuidos por estado
- [ ] Contador de leads por columna correcto

### ✅ Test 5: Drag & Drop
- [ ] Seleccionar lead
- [ ] Arrastrar a otra columna
- [ ] Lead desaparece de columna origen
- [ ] Lead aparece en columna destino
- [ ] BD actualizada (verificar con SELECT)

### ✅ Test 6: Modal Edición
- [ ] Click en lead → abre modal
- [ ] Click "Editar" → campos se hacen inputs
- [ ] Cambiar campo (ej: zona)
- [ ] Click "Guardar"
- [ ] Modal se cierra
- [ ] Cambio visible en BD

### ✅ Test 7: Búsqueda y Filtros
- [ ] Escribir en search box → filtra por nombre/teléfono
- [ ] Seleccionar propiedad → filtra leads
- [ ] Clear filters → muestra todos

### ✅ Test 8: Crear Columna (Admin Only)
- [ ] Buscar botón "+" para nueva columna
- [ ] Click → abre modal
- [ ] Ingresar nombre
- [ ] Seleccionar color
- [ ] Click "Guardar"
- [ ] Nueva columna aparece
- [ ] BD actualizada

### ✅ Test 9: WhatsApp Integration
- [ ] Hover en lead card
- [ ] Click botón WhatsApp
- [ ] Abre wa.me con número

### ✅ Test 10: Agent ON/OFF (Admin Only)
- [ ] Botón visible solo si usuario es admin
- [ ] Click ON → cambio en `agent_status.is_active`
- [ ] n8n detecta cambio y ajusta comportamiento

---

## Fase 6: Build Production

### 6.1 Optimizar y compilar
```bash
# Crear build optimizado
npm run build

# Output esperado:
# ✓ Built in 45.2s
# Compiled successfully
```

### 6.2 Testing de build
```bash
# Testear build localmente
npm run start

# Acceder a http://localhost:3000
```

### 6.3 Verificar producción
```bash
# Verificar que no hay errores
npm run lint

# Si usa testing
npm run test
```

---

## Fase 7: Deployment

### Opción A: Vercel (RECOMENDADO)
```bash
# 1. Conectar repo de GitHub a vercel.com
# 2. Seleccionar Next.js en framework
# 3. Agregar variables de entorno (Settings)
# 4. Deploy automático en push a main
```

### Opción B: Docker
```bash
# Construir imagen
docker build -t stragora-alliance-crm .

# Ejecutar
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  stragora-alliance-crm
```

### Opción C: Self-hosted (Ubuntu/Debian)
```bash
# 1. SSH a servidor
ssh root@tu-server.com

# 2. Clonar repo
git clone <repo-url>
cd crm

# 3. Instalar Node
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Instalar dependencias
npm install

# 5. Build
npm run build

# 6. PM2 para mantener vivo
npm install -g pm2
pm2 start "npm run start" --name "crm"
pm2 startup
pm2 save

# 7. Nginx proxy
# (ver nginx-config.example)
```

---

## Troubleshooting

### ❌ Error: "DATABASE_URL no está definida"
```
Solución:
1. Verificar .env.local existe
2. npm run dev (reiniciar)
3. Verificar DATABASE_URL en .env.local
```

### ❌ Error: "Cannot connect to PostgreSQL"
```
Solución:
1. Verificar credentials en DATABASE_URL
2. psql $DATABASE_URL para testear
3. Verificar puerto (default 5432)
4. En Supabase: verificar IP whitelist
```

### ❌ Error: "Module not found: pg"
```
Solución:
npm install pg --save
```

### ❌ Error: "Leads no cargan"
```
Solución:
1. Verificar sql/init-auth.sql ejecutado
2. Verificar n8n está agregando leads
3. Verificar rol tiene acceso (jwt valid)
4. Revisar browser console para errores
```

### ❌ Error: "Drag & drop no funciona"
```
Solución:
1. Limpiar cache: F12 → Application → Clear
2. Verificar onDragStart/Over/Leave/Drop en KanbanBoard
3. Verificar estado `draggedLead` está actualizando
```

### ❌ Error: "Login da 401"
```
Solución:
1. Verificar sql/init-auth.sql ejecutado
2. Verificar usuario existe en BD
3. Verificar password es correcta (Admin@123)
4. Verificar JWT_SECRET en .env.local
```

---

## Monitoreo en Producción

### Logs
```bash
# PM2 logs
pm2 logs crm

# Docker logs
docker logs -f stragora-alliance-crm
```

### Performance
```bash
# Next.js analytics
# https://nextjs.org/analytics

# Verificar build size
npm run build && npm ls
```

### Backups BD
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20240101.sql

# Supabase: Settings → Backups → Automated
```

---

## 📋 Checklist Final

- [ ] Node 18+ instalado
- [ ] .env.local creado con DATABASE_URL y JWT_SECRET
- [ ] sql/init-auth.sql ejecutado
- [ ] sql/init-kanban.sql ejecutado
- [ ] npm install ejecutado
- [ ] npm run dev inicia sin errores
- [ ] Login funciona (admin/Admin@123)
- [ ] Kanban carga y display leads
- [ ] Drag & drop funciona
- [ ] Modal de edición funciona
- [ ] WhatsApp link funciona
- [ ] Sidebar navega correctamente
- [ ] Admin ve botón ON/OFF agente
- [ ] npm run build completa exitosamente
- [ ] Todo listo para production

---

**🎉 ¡LISTO PARA PRODUCCIÓN!**

Para soporte: [documentación completa en ARQUITECTURA-CRM-STRAGORA-ALLIANCE.md]
