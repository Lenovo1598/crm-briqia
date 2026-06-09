# ARQUITECTURA CRM — TEAM ALI

> Documento de referencia para desarrollo en Cursor.
> Contiene TODO el contexto necesario: schema DB, estructura del proyecto, reglas de negocio, diseño y conexiones con n8n.

---

## 1. RESUMEN DEL PROYECTO

CRM inmobiliario para Andrés Ali (RE/MAX Diagonal II — City Bell, La Plata).
El CRM refleja datos recopilados por un agente AI (Maga) que corre en n8n y atiende leads vía WhatsApp/Chatwoot.

**Stack:** Next.js 14 (App Router) + Tailwind CSS + PostgreSQL (Supabase) + Vercel

**Usuarios:**
- **Admin** — acceso total, incluye control del botón ON/OFF del agente AI
- **Usuario** — mismo acceso que admin EXCEPTO el botón ON/OFF del agente

**Autenticación:** usuario + contraseña (gestionada desde el CRM por el admin)

---

## 2. SCHEMA DE BASE DE DATOS (PostgreSQL / Supabase)

### 2.1. Tablas existentes (creadas por n8n)

```sql
-- ═══════════════════════════════════════
-- TABLA: leads (tabla principal)
-- ═══════════════════════════════════════
CREATE TABLE leads (
  id              BIGSERIAL PRIMARY KEY,
  whatsapp_id     TEXT UNIQUE,
  nombre          TEXT,
  estado_chat     INTEGER,           -- 1 = activo (usado por n8n)
  estado          TEXT,              -- 'frio','tibio','visita','caliente','llamada','busqueda'
  presupuesto     NUMERIC,
  zona            TEXT,
  tipo_propiedad  TEXT,              -- 'departamento','casa','ph','terreno','local','oficina','cochera'
  forma_pago      TEXT,              -- 'contado','financiado','hipotecario','mixto'
  intencion       TEXT,              -- 'comprar','vender'
  caracteristicas_buscadas TEXT,
  caracteristicas_venta    TEXT,
  propiedad_interes        TEXT,     -- dirección de la propiedad consultada
  ultima_interaccion TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- TABLA: agent_status (ON/OFF del agente AI)
-- ═══════════════════════════════════════
CREATE TABLE agent_status (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  is_active  BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Solo tiene 1 fila (id = 1). n8n consulta SELECT is_active FROM agent_status WHERE id = 1;

-- ═══════════════════════════════════════
-- TABLA: cola_seguimientos (seguimientos automáticos 24h)
-- ═══════════════════════════════════════
CREATE TABLE cola_seguimientos (
  id                        BIGSERIAL PRIMARY KEY,
  remote_jid                TEXT,
  session_id                TEXT,
  chatwoot_conversation_id  TEXT,
  fecha_programada          TIMESTAMPTZ,
  estado                    TEXT,     -- 'pendiente','enviado'
  fecha_ultima_interaccion  TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- TABLA: mensajes_pendientes (mensajes recibidos con agente OFF)
-- ═══════════════════════════════════════
CREATE TABLE mensajes_pendientes (
  id                        BIGSERIAL PRIMARY KEY,
  remote_jid                TEXT,
  mensaje                   TEXT,
  push_name                 TEXT,
  chatwoot_conversation_id  INTEGER,
  fecha_recibido            TIMESTAMPTZ,
  estado                    TEXT,     -- 'pendiente','procesado'
  intentos_procesamiento    INTEGER DEFAULT 0
);
```

### 2.2. Tablas nuevas (a crear para el CRM)

```sql
-- ═══════════════════════════════════════
-- TABLA: kanban_columns (columnas configurables del Kanban)
-- ═══════════════════════════════════════
CREATE TABLE kanban_columns (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  orden      INTEGER NOT NULL,
  color      VARCHAR(50) DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valores iniciales:
INSERT INTO kanban_columns (nombre, orden, color) VALUES
  ('Frío', 1, '#6B7280'),
  ('Tibios', 2, '#F59E0B'),
  ('Visitas', 3, '#3B82F6'),
  ('Calientes', 4, '#EF4444'),
  ('Llamadas', 5, '#10B981');

-- ═══════════════════════════════════════
-- TABLA: users (autenticación del CRM)
-- ═══════════════════════════════════════
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(100) UNIQUE NOT NULL,
  password   TEXT NOT NULL,           -- hash con bcrypt
  role       VARCHAR(20) DEFAULT 'user',  -- 'admin' o 'user'
  nombre     VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usuario admin inicial (password se hashea en la app):
-- INSERT INTO users (username, password, role, nombre)
-- VALUES ('admin', '<bcrypt_hash>', 'admin', 'Andrés Ali');
```

### 2.3. Tabla existente: propiedades

> **NOTA:** El schema de esta tabla aún no fue proporcionado. Solicitar al cliente antes de desarrollar la sección Propiedades. Se sabe por las capturas que contiene: dirección, tipo (departamento/casa/galpón/PH), zona, precio USD, dormitorios, baños, m².

---

## 3. ESTRUCTURA DEL PROYECTO (Next.js App Router)

```
team-ali-crm/
├── app/
│   ├── layout.tsx                # Layout principal + font + metadata
│   ├── page.tsx                  # Redirect a /dashboard
│   ├── login/
│   │   └── page.tsx              # Página de login
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard con métricas
│   ├── leads/
│   │   └── page.tsx              # Kanban de leads
│   ├── chats/
│   │   └── page.tsx              # Centro de Comunicación
│   ├── mensajes/
│   │   └── page.tsx              # Mensajes Programados
│   ├── propiedades/
│   │   └── page.tsx              # Kanban de propiedades (fase 2)
│   ├── busquedas/
│   │   └── page.tsx              # Búsquedas (fase 2)
│   ├── campanas/
│   │   └── page.tsx              # Campañas (fase 2)
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts    # POST — login con JWT
│       │   └── me/route.ts       # GET — datos del usuario actual
│       ├── leads/
│       │   ├── route.ts          # GET (listar) / POST (crear)
│       │   └── [id]/route.ts     # GET / PUT / DELETE lead individual
│       ├── agent/
│       │   └── route.ts          # GET / PUT — agent_status (is_active)
│       ├── columns/
│       │   ├── route.ts          # GET / POST — kanban_columns
│       │   └── [id]/route.ts     # PUT / DELETE columna individual
│       ├── seguimientos/
│       │   └── route.ts          # GET — cola_seguimientos
│       ├── mensajes-pendientes/
│       │   └── route.ts          # GET — mensajes_pendientes
│       └── users/
│           ├── route.ts          # GET / POST — gestión de usuarios (solo admin)
│           └── [id]/route.ts     # PUT / DELETE usuario
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Navegación lateral colapsable
│   │   ├── Header.tsx            # Barra superior con búsqueda y ON/OFF
│   │   └── AuthGuard.tsx         # Protección de rutas + verificación de rol
│   ├── leads/
│   │   ├── KanbanBoard.tsx       # Tablero Kanban completo
│   │   ├── KanbanColumn.tsx      # Columna individual
│   │   ├── LeadCard.tsx          # Tarjeta de lead
│   │   ├── LeadModal.tsx         # Modal detalle/edición de lead
│   │   └── AddColumnModal.tsx    # Modal para agregar columna
│   ├── chats/
│   │   ├── ChatList.tsx          # Lista de conversaciones
│   │   ├── ChatWindow.tsx        # Ventana de mensajes
│   │   └── ChatMessage.tsx       # Burbuja de mensaje individual
│   ├── dashboard/
│   │   ├── StatCard.tsx          # Tarjeta de métrica
│   │   └── LeadsChart.tsx        # Gráfico de leads por período
│   ├── mensajes/
│   │   └── SeguimientoList.tsx   # Lista de seguimientos
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── SearchInput.tsx
├── lib/
│   ├── db.ts                     # Conexión a PostgreSQL (pg o @vercel/postgres)
│   ├── auth.ts                   # Funciones de JWT + bcrypt
│   └── utils.ts                  # Helpers (formatCurrency, etc.)
├── middleware.ts                  # Verificación de JWT en rutas protegidas
├── tailwind.config.ts
├── next.config.js
├── package.json
└── .env.local                    # Variables de entorno
```

---

## 4. VARIABLES DE ENTORNO (.env.local)

```env
# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# JWT
JWT_SECRET=un_secreto_seguro_de_al_menos_32_caracteres

# App
NEXT_PUBLIC_APP_NAME=Team Ali
```

---

## 5. API ROUTES — ESPECIFICACIÓN

### 5.1. Auth

| Método | Ruta | Body | Respuesta | Notas |
|--------|------|------|-----------|-------|
| POST | `/api/auth/login` | `{ username, password }` | `{ token, user: { id, username, role, nombre } }` | JWT con expiración 7d |
| GET | `/api/auth/me` | — | `{ id, username, role, nombre }` | Requiere header `Authorization: Bearer <token>` |

### 5.2. Leads

| Método | Ruta | Query params | Body | Respuesta |
|--------|------|--------------|------|-----------|
| GET | `/api/leads` | `?estado=frio&propiedad=116+e/+34+y+35&search=nombre` | — | `Lead[]` |
| POST | `/api/leads` | — | `{ whatsapp_id, nombre, estado, ... }` | `Lead` |
| GET | `/api/leads/[id]` | — | — | `Lead` |
| PUT | `/api/leads/[id]` | — | `{ campo: valor }` | `Lead` (actualizado) |
| DELETE | `/api/leads/[id]` | — | — | `{ success: true }` |

### 5.3. Agent Status

| Método | Ruta | Body | Respuesta | Notas |
|--------|------|------|-----------|-------|
| GET | `/api/agent` | — | `{ is_active: boolean }` | — |
| PUT | `/api/agent` | `{ is_active: boolean }` | `{ is_active }` | **Solo admin** |

### 5.4. Kanban Columns

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| GET | `/api/columns` | — | `Column[]` ordenadas por `orden` |
| POST | `/api/columns` | `{ nombre, color }` | `Column` |
| PUT | `/api/columns/[id]` | `{ nombre?, color?, orden? }` | `Column` |
| DELETE | `/api/columns/[id]` | — | `{ success: true }` |

### 5.5. Seguimientos

| Método | Ruta | Query params | Respuesta |
|--------|------|--------------|-----------|
| GET | `/api/seguimientos` | `?estado=pendiente` | `Seguimiento[]` agrupados por fecha |

### 5.6. Mensajes Pendientes

| Método | Ruta | Query params | Respuesta |
|--------|------|--------------|-----------|
| GET | `/api/mensajes-pendientes` | `?estado=pendiente` | `MensajePendiente[]` |

### 5.7. Users (solo admin)

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| GET | `/api/users` | — | `User[]` (sin password) |
| POST | `/api/users` | `{ username, password, role, nombre }` | `User` |
| PUT | `/api/users/[id]` | `{ nombre?, password?, role? }` | `User` |
| DELETE | `/api/users/[id]` | — | `{ success: true }` |

---

## 6. DISEÑO Y UI

### 6.1. Paleta de colores

```
Verde primario:     #166534 (botones, sidebar active, ON)
Verde claro:        #F0FDF4 (hover, selected background)
Verde WhatsApp:     #25D366 (avatares de chat)
Verde burbuja:      #DCF8C6 (mensajes outgoing)
Gris fondo:         #F9FAFB (body background)
Gris borde:         #E5E7EB (borders)
Gris texto:         #6B7280 (secondary text)
Negro texto:        #111827 (primary text)
Rojo:               #EF4444 (Calientes, alertas)
Amarillo:           #F59E0B (Tibios, pendientes)
Azul:               #3B82F6 (Visitas, badges)
Verde estado:       #10B981 (Llamadas, enviados)
```

### 6.2. Tipografía

- **Font principal:** DM Sans (Google Fonts)
- **Títulos:** DM Sans 700/800
- **Body:** DM Sans 400/500
- **Tamaños:** títulos 20-22px, subtítulos 15px, body 13-14px, labels 11-12px

### 6.3. Componentes clave

**Sidebar:**
- Ancho expandido: 220px, colapsado: 60px
- Secciones: GENERAL, MENSAJERÍA, CARTERA, ASISTENTES
- Indicador activo: borde derecho verde + fondo verde claro
- Footer: avatar + nombre + rol + settings

**Kanban de Leads:**
- Columnas scrolleables horizontalmente
- Tarjetas con drag & drop entre columnas
- Header de columna: dot de color + nombre + contador
- Filtros: por propiedad (botones toggle) + buscador
- Botón ON/OFF solo visible para admin

**Tarjeta de Lead:**
- Nombre (o whatsapp_id si no tiene nombre)
- Badge de estado con color de la columna
- Info: zona, tipo_propiedad, presupuesto, whatsapp_id
- Hover: shadow + lift
- Click: abre modal de detalle

**Modal de Lead:**
- Vista lectura: grid 2 columnas con todos los campos
- Vista edición: formulario con inputs y selects
- Botones: Editar, WhatsApp (abre wa.me), Cerrar
- Campos editables: nombre, estado, presupuesto, zona, tipo_propiedad, forma_pago, intencion, propiedad_interes

**Centro de Comunicación (Chats):**
- Panel izquierdo (320px): lista de chats con avatar, nombre, último mensaje, badges (unread, propiedad)
- Panel derecho: header con nombre + teléfono + botón ON/OFF, área de mensajes estilo WhatsApp, input con adjunto y send
- Este centro lee mensajes de Chatwoot vía API

**Dashboard:**
- 3 stat cards: Total, últimos 7 días, últimos 30 días
- Gráfico de área con líneas para total/tibios/fríos
- Selector de período: 7/30/90 días + rango custom

**Mensajes Programados:**
- Sección "Seguimiento orgánico": cards por día (Hoy, Mañana, fechas) con badge pendiente/enviado
- Sección "Enviados": lista expandible por fecha

---

## 7. RELACIÓN CON n8n

### 7.1. Cómo n8n usa las tablas

| Tabla | n8n lee | n8n escribe | CRM lee | CRM escribe |
|-------|---------|-------------|---------|-------------|
| leads | ✅ (estado_chat) | ✅ (upsert por whatsapp_id) | ✅ | ✅ (editar estado, datos) |
| agent_status | ✅ (is_active) | ❌ | ✅ | ✅ (botón ON/OFF, solo admin) |
| cola_seguimientos | ✅ | ✅ (inserta tras cada respuesta) | ✅ | ❌ |
| mensajes_pendientes | ✅ | ✅ (inserta cuando agente OFF) | ✅ | ❌ |
| kanban_columns | ❌ | ❌ | ✅ | ✅ |
| users | ❌ | ❌ | ✅ | ✅ |

### 7.2. Mapeo estado ↔ columna Kanban

| Campo `estado` en DB | Columna Kanban |
|----------------------|----------------|
| `frio` | Frío |
| `tibio` | Tibios |
| `visita` | Visitas |
| `caliente` | Calientes |
| `llamada` | Llamadas |
| `busqueda` | (puede mapearse a columna custom) |

### 7.3. Flujo de datos

```
Cliente envía WhatsApp
    ↓
Chatwoot recibe → Webhook a n8n
    ↓
n8n verifica agent_status.is_active
    ↓ (si true)
n8n procesa con RAG Agent (Claude/GPT)
    ↓
n8n hace UPSERT en leads (extrae nombre, presupuesto, zona, etc.)
n8n inserta en cola_seguimientos (seguimiento 24h)
n8n responde al cliente vía Chatwoot
    ↓
CRM muestra todo en tiempo real consultando PostgreSQL
```

### 7.4. Campo estado_chat (crítico)

- `estado_chat = 1` → agente AI puede responder
- `estado_chat = 0 (o null)` → agente AI no responde (conversación pausada por humano)
- n8n consulta este campo antes de procesar cada mensaje
- El CRM NO debería modificar `estado_chat` directamente — eso lo controla n8n con comandos como `..` y `...`

---

## 8. FASES DE DESARROLLO

### Fase 1 (MVP)
- [ ] Setup Next.js + Tailwind + conexión Supabase
- [ ] Autenticación (login, JWT, middleware)
- [ ] Sidebar + layout
- [ ] Dashboard (métricas + gráfico)
- [ ] Leads Kanban (CRUD, drag & drop, filtros, modal)
- [ ] Botón ON/OFF agente (solo admin)
- [ ] Crear tablas nuevas (kanban_columns, users)
- [ ] Deploy en Vercel

### Fase 2
- [ ] Centro de Comunicación (Chats) — requiere API de Chatwoot
- [ ] Mensajes Programados
- [ ] Propiedades Kanban — requiere schema de tabla propiedades
- [ ] Gestión de usuarios (CRUD admin)

### Fase 3
- [ ] Búsquedas
- [ ] Campañas Activas
- [ ] Cotizaciones
- [ ] Documentación

---

## 9. DEPENDENCIAS (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "pg": "^8.12.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 10. NOTAS PARA CURSOR

1. **Conexión DB:** usar `pg` con pool. La URL de conexión va en `DATABASE_URL` (`.env.local`). Nunca exponer credenciales al cliente.

2. **Auth:** JWT simple con `jsonwebtoken`. El token se guarda en localStorage y se envía en header `Authorization: Bearer <token>`. El middleware protege todas las rutas excepto `/login` y `/api/auth/login`.

3. **Drag & drop:** al soltar un lead en otra columna, hacer PUT a `/api/leads/[id]` con `{ estado: 'nuevo_estado' }`. Actualizar UI optimistamente.

4. **ON/OFF:** al hacer toggle, PUT a `/api/agent` con `{ is_active: !current }`. n8n lee este valor en cada mensaje entrante.

5. **Propiedades filter:** los botones de filtro por propiedad se generan dinámicamente haciendo `SELECT DISTINCT propiedad_interes FROM leads WHERE propiedad_interes IS NOT NULL`.

6. **Tiempo real (opcional):** para refrescar datos sin recargar, usar polling cada 30s o Supabase Realtime en fase futura.

7. **El CRM NO envía mensajes de WhatsApp.** Solo muestra datos. Los mensajes los envía n8n vía Chatwoot.
