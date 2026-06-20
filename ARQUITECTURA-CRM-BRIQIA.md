# ARQUITECTURA CRM â€” Briqia

> Documento de referencia para desarrollo en Cursor.
> Contiene TODO el contexto necesario: schema DB, estructura del proyecto, reglas de negocio, diseÃ±o y conexiones con n8n.

---

## 1. RESUMEN DEL PROYECTO

CRM inmobiliario para AndrÃ©s Ali (RE/MAX Diagonal II â€” City Bell, La Plata).
El CRM refleja datos recopilados por un agente AI (Maga) que corre en n8n y atiende leads vÃ­a WhatsApp/Chatwoot.

**Stack:** Next.js 14 (App Router) + Tailwind CSS + PostgreSQL (Supabase) + Vercel

**Usuarios:**
- **Admin** â€” acceso total, incluye control del botÃ³n ON/OFF del agente AI
- **Usuario** â€” mismo acceso que admin EXCEPTO el botÃ³n ON/OFF del agente

**AutenticaciÃ³n:** usuario + contraseÃ±a (gestionada desde el CRM por el admin)

---

## 2. SCHEMA DE BASE DE DATOS (PostgreSQL / Supabase)

### 2.1. Tablas existentes (creadas por n8n)

```sql
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLA: leads (tabla principal)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
  propiedad_interes        TEXT,     -- direcciÃ³n de la propiedad consultada
  ultima_interaccion TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLA: agent_status (ON/OFF del agente AI)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE agent_status (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  is_active  BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Solo tiene 1 fila (id = 1). n8n consulta SELECT is_active FROM agent_status WHERE id = 1;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLA: cola_seguimientos (seguimientos automÃ¡ticos 24h)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLA: mensajes_pendientes (mensajes recibidos con agente OFF)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLA: kanban_columns (columnas configurables del Kanban)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
CREATE TABLE kanban_columns (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  orden      INTEGER NOT NULL,
  color      VARCHAR(50) DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valores iniciales:
INSERT INTO kanban_columns (nombre, orden, color) VALUES
  ('FrÃ­o', 1, '#6B7280'),
  ('Tibios', 2, '#F59E0B'),
  ('Visitas', 3, '#3B82F6'),
  ('Calientes', 4, '#EF4444'),
  ('Llamadas', 5, '#10B981');

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLA: users (autenticaciÃ³n del CRM)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
-- VALUES ('admin', '<bcrypt_hash>', 'admin', 'AndrÃ©s Ali');
```

### 2.3. Tabla existente: propiedades

> **NOTA:** El schema de esta tabla aÃºn no fue proporcionado. Solicitar al cliente antes de desarrollar la secciÃ³n Propiedades. Se sabe por las capturas que contiene: direcciÃ³n, tipo (departamento/casa/galpÃ³n/PH), zona, precio USD, dormitorios, baÃ±os, mÂ².

---

## 3. ESTRUCTURA DEL PROYECTO (Next.js App Router)

```
BRIQIA-alliance-crm/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ layout.tsx                # Layout principal + font + metadata
â”‚   â”œâ”€â”€ page.tsx                  # Redirect a /dashboard
â”‚   â”œâ”€â”€ login/
â”‚   â”‚   â””â”€â”€ page.tsx              # PÃ¡gina de login
â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â””â”€â”€ page.tsx              # Dashboard con mÃ©tricas
â”‚   â”œâ”€â”€ leads/
â”‚   â”‚   â””â”€â”€ page.tsx              # Kanban de leads
â”‚   â”œâ”€â”€ chats/
â”‚   â”‚   â””â”€â”€ page.tsx              # Centro de ComunicaciÃ³n
â”‚   â”œâ”€â”€ mensajes/
â”‚   â”‚   â””â”€â”€ page.tsx              # Mensajes Programados
â”‚   â”œâ”€â”€ propiedades/
â”‚   â”‚   â””â”€â”€ page.tsx              # Kanban de propiedades (fase 2)
â”‚   â”œâ”€â”€ busquedas/
â”‚   â”‚   â””â”€â”€ page.tsx              # BÃºsquedas (fase 2)
â”‚   â”œâ”€â”€ campanas/
â”‚   â”‚   â””â”€â”€ page.tsx              # CampaÃ±as (fase 2)
â”‚   â””â”€â”€ api/
â”‚       â”œâ”€â”€ auth/
â”‚       â”‚   â”œâ”€â”€ login/route.ts    # POST â€” login con JWT
â”‚       â”‚   â””â”€â”€ me/route.ts       # GET â€” datos del usuario actual
â”‚       â”œâ”€â”€ leads/
â”‚       â”‚   â”œâ”€â”€ route.ts          # GET (listar) / POST (crear)
â”‚       â”‚   â””â”€â”€ [id]/route.ts     # GET / PUT / DELETE lead individual
â”‚       â”œâ”€â”€ agent/
â”‚       â”‚   â””â”€â”€ route.ts          # GET / PUT â€” agent_status (is_active)
â”‚       â”œâ”€â”€ columns/
â”‚       â”‚   â”œâ”€â”€ route.ts          # GET / POST â€” kanban_columns
â”‚       â”‚   â””â”€â”€ [id]/route.ts     # PUT / DELETE columna individual
â”‚       â”œâ”€â”€ seguimientos/
â”‚       â”‚   â””â”€â”€ route.ts          # GET â€” cola_seguimientos
â”‚       â”œâ”€â”€ mensajes-pendientes/
â”‚       â”‚   â””â”€â”€ route.ts          # GET â€” mensajes_pendientes
â”‚       â””â”€â”€ users/
â”‚           â”œâ”€â”€ route.ts          # GET / POST â€” gestiÃ³n de usuarios (solo admin)
â”‚           â””â”€â”€ [id]/route.ts     # PUT / DELETE usuario
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ layout/
â”‚   â”‚   â”œâ”€â”€ Sidebar.tsx           # NavegaciÃ³n lateral colapsable
â”‚   â”‚   â”œâ”€â”€ Header.tsx            # Barra superior con bÃºsqueda y ON/OFF
â”‚   â”‚   â””â”€â”€ AuthGuard.tsx         # ProtecciÃ³n de rutas + verificaciÃ³n de rol
â”‚   â”œâ”€â”€ leads/
â”‚   â”‚   â”œâ”€â”€ KanbanBoard.tsx       # Tablero Kanban completo
â”‚   â”‚   â”œâ”€â”€ KanbanColumn.tsx      # Columna individual
â”‚   â”‚   â”œâ”€â”€ LeadCard.tsx          # Tarjeta de lead
â”‚   â”‚   â”œâ”€â”€ LeadModal.tsx         # Modal detalle/ediciÃ³n de lead
â”‚   â”‚   â””â”€â”€ AddColumnModal.tsx    # Modal para agregar columna
â”‚   â”œâ”€â”€ chats/
â”‚   â”‚   â”œâ”€â”€ ChatList.tsx          # Lista de conversaciones
â”‚   â”‚   â”œâ”€â”€ ChatWindow.tsx        # Ventana de mensajes
â”‚   â”‚   â””â”€â”€ ChatMessage.tsx       # Burbuja de mensaje individual
â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”œâ”€â”€ StatCard.tsx          # Tarjeta de mÃ©trica
â”‚   â”‚   â””â”€â”€ LeadsChart.tsx        # GrÃ¡fico de leads por perÃ­odo
â”‚   â”œâ”€â”€ mensajes/
â”‚   â”‚   â””â”€â”€ SeguimientoList.tsx   # Lista de seguimientos
â”‚   â””â”€â”€ ui/
â”‚       â”œâ”€â”€ Badge.tsx
â”‚       â”œâ”€â”€ Button.tsx
â”‚       â”œâ”€â”€ Modal.tsx
â”‚       â””â”€â”€ SearchInput.tsx
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ db.ts                     # ConexiÃ³n a PostgreSQL (pg o @vercel/postgres)
â”‚   â”œâ”€â”€ auth.ts                   # Funciones de JWT + bcrypt
â”‚   â””â”€â”€ utils.ts                  # Helpers (formatCurrency, etc.)
â”œâ”€â”€ middleware.ts                  # VerificaciÃ³n de JWT en rutas protegidas
â”œâ”€â”€ tailwind.config.ts
â”œâ”€â”€ next.config.js
â”œâ”€â”€ package.json
â””â”€â”€ .env.local                    # Variables de entorno
```

---

## 4. VARIABLES DE ENTORNO (.env.local)

```env
# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# JWT
JWT_SECRET=un_secreto_seguro_de_al_menos_32_caracteres

# App
NEXT_PUBLIC_APP_NAME=Briqia
```

---

## 5. API ROUTES â€” ESPECIFICACIÃ“N

### 5.1. Auth

| MÃ©todo | Ruta | Body | Respuesta | Notas |
|--------|------|------|-----------|-------|
| POST | `/api/auth/login` | `{ username, password }` | `{ token, user: { id, username, role, nombre } }` | JWT con expiraciÃ³n 7d |
| GET | `/api/auth/me` | â€” | `{ id, username, role, nombre }` | Requiere header `Authorization: Bearer <token>` |

### 5.2. Leads

| MÃ©todo | Ruta | Query params | Body | Respuesta |
|--------|------|--------------|------|-----------|
| GET | `/api/leads` | `?estado=frio&propiedad=116+e/+34+y+35&search=nombre` | â€” | `Lead[]` |
| POST | `/api/leads` | â€” | `{ whatsapp_id, nombre, estado, ... }` | `Lead` |
| GET | `/api/leads/[id]` | â€” | â€” | `Lead` |
| PUT | `/api/leads/[id]` | â€” | `{ campo: valor }` | `Lead` (actualizado) |
| DELETE | `/api/leads/[id]` | â€” | â€” | `{ success: true }` |

### 5.3. Agent Status

| MÃ©todo | Ruta | Body | Respuesta | Notas |
|--------|------|------|-----------|-------|
| GET | `/api/agent` | â€” | `{ is_active: boolean }` | â€” |
| PUT | `/api/agent` | `{ is_active: boolean }` | `{ is_active }` | **Solo admin** |

### 5.4. Kanban Columns

| MÃ©todo | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| GET | `/api/columns` | â€” | `Column[]` ordenadas por `orden` |
| POST | `/api/columns` | `{ nombre, color }` | `Column` |
| PUT | `/api/columns/[id]` | `{ nombre?, color?, orden? }` | `Column` |
| DELETE | `/api/columns/[id]` | â€” | `{ success: true }` |

### 5.5. Seguimientos

| MÃ©todo | Ruta | Query params | Respuesta |
|--------|------|--------------|-----------|
| GET | `/api/seguimientos` | `?estado=pendiente` | `Seguimiento[]` agrupados por fecha |

### 5.6. Mensajes Pendientes

| MÃ©todo | Ruta | Query params | Respuesta |
|--------|------|--------------|-----------|
| GET | `/api/mensajes-pendientes` | `?estado=pendiente` | `MensajePendiente[]` |

### 5.7. Users (solo admin)

| MÃ©todo | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| GET | `/api/users` | â€” | `User[]` (sin password) |
| POST | `/api/users` | `{ username, password, role, nombre }` | `User` |
| PUT | `/api/users/[id]` | `{ nombre?, password?, role? }` | `User` |
| DELETE | `/api/users/[id]` | â€” | `{ success: true }` |

---

## 6. DISEÃ‘O Y UI

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

### 6.2. TipografÃ­a

- **Font principal:** DM Sans (Google Fonts)
- **TÃ­tulos:** DM Sans 700/800
- **Body:** DM Sans 400/500
- **TamaÃ±os:** tÃ­tulos 20-22px, subtÃ­tulos 15px, body 13-14px, labels 11-12px

### 6.3. Componentes clave

**Sidebar:**
- Ancho expandido: 220px, colapsado: 60px
- Secciones: GENERAL, MENSAJERÃA, CARTERA, ASISTENTES
- Indicador activo: borde derecho verde + fondo verde claro
- Footer: avatar + nombre + rol + settings

**Kanban de Leads:**
- Columnas scrolleables horizontalmente
- Tarjetas con drag & drop entre columnas
- Header de columna: dot de color + nombre + contador
- Filtros: por propiedad (botones toggle) + buscador
- BotÃ³n ON/OFF solo visible para admin

**Tarjeta de Lead:**
- Nombre (o whatsapp_id si no tiene nombre)
- Badge de estado con color de la columna
- Info: zona, tipo_propiedad, presupuesto, whatsapp_id
- Hover: shadow + lift
- Click: abre modal de detalle

**Modal de Lead:**
- Vista lectura: grid 2 columnas con todos los campos
- Vista ediciÃ³n: formulario con inputs y selects
- Botones: Editar, WhatsApp (abre wa.me), Cerrar
- Campos editables: nombre, estado, presupuesto, zona, tipo_propiedad, forma_pago, intencion, propiedad_interes

**Centro de ComunicaciÃ³n (Chats):**
- Panel izquierdo (320px): lista de chats con avatar, nombre, Ãºltimo mensaje, badges (unread, propiedad)
- Panel derecho: header con nombre + telÃ©fono + botÃ³n ON/OFF, Ã¡rea de mensajes estilo WhatsApp, input con adjunto y send
- Este centro lee mensajes de Chatwoot vÃ­a API

**Dashboard:**
- 3 stat cards: Total, Ãºltimos 7 dÃ­as, Ãºltimos 30 dÃ­as
- GrÃ¡fico de Ã¡rea con lÃ­neas para total/tibios/frÃ­os
- Selector de perÃ­odo: 7/30/90 dÃ­as + rango custom

**Mensajes Programados:**
- SecciÃ³n "Seguimiento orgÃ¡nico": cards por dÃ­a (Hoy, MaÃ±ana, fechas) con badge pendiente/enviado
- SecciÃ³n "Enviados": lista expandible por fecha

---

## 7. RELACIÃ“N CON n8n

### 7.1. CÃ³mo n8n usa las tablas

| Tabla | n8n lee | n8n escribe | CRM lee | CRM escribe |
|-------|---------|-------------|---------|-------------|
| leads | âœ… (estado_chat) | âœ… (upsert por whatsapp_id) | âœ… | âœ… (editar estado, datos) |
| agent_status | âœ… (is_active) | âŒ | âœ… | âœ… (botÃ³n ON/OFF, solo admin) |
| cola_seguimientos | âœ… | âœ… (inserta tras cada respuesta) | âœ… | âŒ |
| mensajes_pendientes | âœ… | âœ… (inserta cuando agente OFF) | âœ… | âŒ |
| kanban_columns | âŒ | âŒ | âœ… | âœ… |
| users | âŒ | âŒ | âœ… | âœ… |

### 7.2. Mapeo estado â†” columna Kanban

| Campo `estado` en DB | Columna Kanban |
|----------------------|----------------|
| `frio` | FrÃ­o |
| `tibio` | Tibios |
| `visita` | Visitas |
| `caliente` | Calientes |
| `llamada` | Llamadas |
| `busqueda` | (puede mapearse a columna custom) |

### 7.3. Flujo de datos

```
Cliente envÃ­a WhatsApp
    â†“
Chatwoot recibe â†’ Webhook a n8n
    â†“
n8n verifica agent_status.is_active
    â†“ (si true)
n8n procesa con RAG Agent (Claude/GPT)
    â†“
n8n hace UPSERT en leads (extrae nombre, presupuesto, zona, etc.)
n8n inserta en cola_seguimientos (seguimiento 24h)
n8n responde al cliente vÃ­a Chatwoot
    â†“
CRM muestra todo en tiempo real consultando PostgreSQL
```

### 7.4. Campo estado_chat (crÃ­tico)

- `estado_chat = 1` â†’ agente AI puede responder
- `estado_chat = 0 (o null)` â†’ agente AI no responde (conversaciÃ³n pausada por humano)
- n8n consulta este campo antes de procesar cada mensaje
- El CRM NO deberÃ­a modificar `estado_chat` directamente â€” eso lo controla n8n con comandos como `..` y `...`

---

## 8. FASES DE DESARROLLO

### Fase 1 (MVP)
- [ ] Setup Next.js + Tailwind + conexiÃ³n Supabase
- [ ] AutenticaciÃ³n (login, JWT, middleware)
- [ ] Sidebar + layout
- [ ] Dashboard (mÃ©tricas + grÃ¡fico)
- [ ] Leads Kanban (CRUD, drag & drop, filtros, modal)
- [ ] BotÃ³n ON/OFF agente (solo admin)
- [ ] Crear tablas nuevas (kanban_columns, users)
- [ ] Deploy en Vercel

### Fase 2
- [ ] Centro de ComunicaciÃ³n (Chats) â€” requiere API de Chatwoot
- [ ] Mensajes Programados
- [ ] Propiedades Kanban â€” requiere schema de tabla propiedades
- [ ] GestiÃ³n de usuarios (CRUD admin)

### Fase 3
- [ ] BÃºsquedas
- [ ] CampaÃ±as Activas
- [ ] Cotizaciones
- [ ] DocumentaciÃ³n

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

1. **ConexiÃ³n DB:** usar `pg` con pool. La URL de conexiÃ³n va en `DATABASE_URL` (`.env.local`). Nunca exponer credenciales al cliente.

2. **Auth:** JWT simple con `jsonwebtoken`. El token se guarda en localStorage y se envÃ­a en header `Authorization: Bearer <token>`. El middleware protege todas las rutas excepto `/login` y `/api/auth/login`.

3. **Drag & drop:** al soltar un lead en otra columna, hacer PUT a `/api/leads/[id]` con `{ estado: 'nuevo_estado' }`. Actualizar UI optimistamente.

4. **ON/OFF:** al hacer toggle, PUT a `/api/agent` con `{ is_active: !current }`. n8n lee este valor en cada mensaje entrante.

5. **Propiedades filter:** los botones de filtro por propiedad se generan dinÃ¡micamente haciendo `SELECT DISTINCT propiedad_interes FROM leads WHERE propiedad_interes IS NOT NULL`.

6. **Tiempo real (opcional):** para refrescar datos sin recargar, usar polling cada 30s o Supabase Realtime en fase futura.

7. **El CRM NO envÃ­a mensajes de WhatsApp.** Solo muestra datos. Los mensajes los envÃ­a n8n vÃ­a Chatwoot.
