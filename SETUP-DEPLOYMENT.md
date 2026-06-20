# ðŸš€ SETUP Y DEPLOYMENT - CRM Briqia

## Fase 1: PreparaciÃ³n del Entorno

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

**âš ï¸ IMPORTANTE:** Guardar `.env.local` en `.gitignore` (nunca commitear secrets)

### 1.3 Base de Datos
```bash
# OPCIÃ“N A: Supabase Cloud (RECOMENDADO)
# 1. Crear proyecto en supabase.com
# 2. Settings â†’ Database â†’ Connection string (URI)
# 3. Copiar y pegar en DATABASE_URL

# OPCIÃ“N B: PostgreSQL Local
# 1. Instalar PostgreSQL 14+
# 2. Crear database:
#    createdb BRIQIA_alliance_crm
# 3. Connection string:
#    postgresql://postgres:password@localhost:5432/BRIQIA_alliance_crm
```

---

## Fase 2: InicializaciÃ³n de BD

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
| FrÃ­o | 1 | #6B7280 |
| Tibios | 2 | #F59E0B |
| Visitas | 3 | #3B82F6 |
| Calientes | 4 | #EF4444 |
| Llamadas | 5 | #10B981 |

---

## Fase 3: InstalaciÃ³n de Dependencias

```bash
# Instalar todos los packages del package.json
npm install

# Verificar instalaciÃ³n
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
# â–² Next.js 14.0.0
# - Local:        http://localhost:3000
# - Environments: .env.local
```

### 4.2 Acceder a aplicaciÃ³n
```
http://localhost:3000
â†’ Auto-redirige a /login (si no autenticado)
```

### 4.3 Login
```
Usuario: admin
Password: Admin@123

â†’ Redirecciona a /dashboard
```

---

## Fase 5: Testing de Funcionalidades

### âœ… Test 1: AutenticaciÃ³n
- [ ] Login con admin/Admin@123
- [ ] Token aparece en localStorage.auth_token
- [ ] Dashboard muestra usuario "Administrador"
- [ ] Click "Cerrar SesiÃ³n" limpia token
- [ ] Redirecciona a /login

### âœ… Test 2: Dashboard
- [ ] Cargan estadÃ­sticas (Total, Ãšltimos 7, Ãšltimos 30 dÃ­as)
- [ ] Info del usuario es correcta
- [ ] Links rÃ¡pidos funcionales

### âœ… Test 3: NavegaciÃ³n (Sidebar)
- [ ] Todos los links del sidebar funcionan
- [ ] Indicador "activo" funciona
- [ ] Collapse/expand en mobile
- [ ] Logo y nombre visible

### âœ… Test 4: Kanban Board
- [ ] Se cargan todas las columnas
- [ ] Leads distribuidos por estado
- [ ] Contador de leads por columna correcto

### âœ… Test 5: Drag & Drop
- [ ] Seleccionar lead
- [ ] Arrastrar a otra columna
- [ ] Lead desaparece de columna origen
- [ ] Lead aparece en columna destino
- [ ] BD actualizada (verificar con SELECT)

### âœ… Test 6: Modal EdiciÃ³n
- [ ] Click en lead â†’ abre modal
- [ ] Click "Editar" â†’ campos se hacen inputs
- [ ] Cambiar campo (ej: zona)
- [ ] Click "Guardar"
- [ ] Modal se cierra
- [ ] Cambio visible en BD

### âœ… Test 7: BÃºsqueda y Filtros
- [ ] Escribir en search box â†’ filtra por nombre/telÃ©fono
- [ ] Seleccionar propiedad â†’ filtra leads
- [ ] Clear filters â†’ muestra todos

### âœ… Test 8: Crear Columna (Admin Only)
- [ ] Buscar botÃ³n "+" para nueva columna
- [ ] Click â†’ abre modal
- [ ] Ingresar nombre
- [ ] Seleccionar color
- [ ] Click "Guardar"
- [ ] Nueva columna aparece
- [ ] BD actualizada

### âœ… Test 9: WhatsApp Integration
- [ ] Hover en lead card
- [ ] Click botÃ³n WhatsApp
- [ ] Abre wa.me con nÃºmero

### âœ… Test 10: Agent ON/OFF (Admin Only)
- [ ] BotÃ³n visible solo si usuario es admin
- [ ] Click ON â†’ cambio en `agent_status.is_active`
- [ ] n8n detecta cambio y ajusta comportamiento

---

## Fase 6: Build Production

### 6.1 Optimizar y compilar
```bash
# Crear build optimizado
npm run build

# Output esperado:
# âœ“ Built in 45.2s
# Compiled successfully
```

### 6.2 Testing de build
```bash
# Testear build localmente
npm run start

# Acceder a http://localhost:3000
```

### 6.3 Verificar producciÃ³n
```bash
# Verificar que no hay errores
npm run lint

# Si usa testing
npm run test
```

---

## Fase 7: Deployment

### OpciÃ³n A: Vercel (RECOMENDADO)
```bash
# 1. Conectar repo de GitHub a vercel.com
# 2. Seleccionar Next.js en framework
# 3. Agregar variables de entorno (Settings)
# 4. Deploy automÃ¡tico en push a main
```

### OpciÃ³n B: Docker
```bash
# Construir imagen
docker build -t BRIQIA-alliance-crm .

# Ejecutar
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  BRIQIA-alliance-crm
```

### OpciÃ³n C: Self-hosted (Ubuntu/Debian)
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

### âŒ Error: "DATABASE_URL no estÃ¡ definida"
```
SoluciÃ³n:
1. Verificar .env.local existe
2. npm run dev (reiniciar)
3. Verificar DATABASE_URL en .env.local
```

### âŒ Error: "Cannot connect to PostgreSQL"
```
SoluciÃ³n:
1. Verificar credentials en DATABASE_URL
2. psql $DATABASE_URL para testear
3. Verificar puerto (default 5432)
4. En Supabase: verificar IP whitelist
```

### âŒ Error: "Module not found: pg"
```
SoluciÃ³n:
npm install pg --save
```

### âŒ Error: "Leads no cargan"
```
SoluciÃ³n:
1. Verificar sql/init-auth.sql ejecutado
2. Verificar n8n estÃ¡ agregando leads
3. Verificar rol tiene acceso (jwt valid)
4. Revisar browser console para errores
```

### âŒ Error: "Drag & drop no funciona"
```
SoluciÃ³n:
1. Limpiar cache: F12 â†’ Application â†’ Clear
2. Verificar onDragStart/Over/Leave/Drop en KanbanBoard
3. Verificar estado `draggedLead` estÃ¡ actualizando
```

### âŒ Error: "Login da 401"
```
SoluciÃ³n:
1. Verificar sql/init-auth.sql ejecutado
2. Verificar usuario existe en BD
3. Verificar password es correcta (Admin@123)
4. Verificar JWT_SECRET en .env.local
```

---

## Monitoreo en ProducciÃ³n

### Logs
```bash
# PM2 logs
pm2 logs crm

# Docker logs
docker logs -f BRIQIA-alliance-crm
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

# Supabase: Settings â†’ Backups â†’ Automated
```

---

## ðŸ“‹ Checklist Final

- [ ] Node 18+ instalado
- [ ] .env.local creado con DATABASE_URL y JWT_SECRET
- [ ] sql/init-auth.sql ejecutado
- [ ] sql/init-kanban.sql ejecutado
- [ ] npm install ejecutado
- [ ] npm run dev inicia sin errores
- [ ] Login funciona (admin/Admin@123)
- [ ] Kanban carga y display leads
- [ ] Drag & drop funciona
- [ ] Modal de ediciÃ³n funciona
- [ ] WhatsApp link funciona
- [ ] Sidebar navega correctamente
- [ ] Admin ve botÃ³n ON/OFF agente
- [ ] npm run build completa exitosamente
- [ ] Todo listo para production

---

**ðŸŽ‰ Â¡LISTO PARA PRODUCCIÃ“N!**

Para soporte: [documentaciÃ³n completa en ARQUITECTURA-CRM-BRIQIA-ALLIANCE.md]
