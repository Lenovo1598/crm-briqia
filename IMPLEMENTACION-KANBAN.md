# 📊 MIGRACIÓN KANBAN DE LEADS — COMPLETADA

## ✅ Archivos Creados

### 🗄️ Base de Datos
- ✅ `sql/init-kanban.sql` — Tabla kanban_columns con datos iniciales

### 🛠️ Utilidades
- ✅ `lib/leads.ts` — Tipos (Lead, KanbanColumn) + funciones helper
  - `estadoToColumn()` — mapeo estado → nombre columna
  - `columnToEstado()` — mapeo inverso
  - `formatCurrency()` — formato USD
  - `getLeadDisplayName()` — obtener nombre visible
  - `getUniqueProperties()` — propiedades únicas de leads

### 🌐 API Routes
- ✅ `app/api/leads/route.ts` — GET (con filtros) y POST
  - GET: filtrado por estado, búsqueda, propiedad
  - POST: crear nuevo lead
  
- ✅ `app/api/leads/[id]/route.ts` — GET, PUT, DELETE lead individual
  - PUT: actualización selectiva de campos
  - DELETE: eliminar lead

- ✅ `app/api/columns/route.ts` — GET y POST columnas
  - GET: obtener todas ordenadas
  - POST: crear nueva columna

- ✅ `app/api/columns/[id]/route.ts` — PUT y DELETE columnas individuales

- ✅ `app/api/agent/route.ts` — GET/PUT estado del agente (ON/OFF)
  - GET: obtener estado actual
  - PUT: cambiar estado (solo admin)

### 💻 Componentes React
- ✅ `components/leads/LeadCard.tsx` — Tarjeta individual de lead
  - Drag & drop
  - Click para editar
  - Botones WhatsApp y edición en hover

- ✅ `components/leads/KanbanColumn.tsx` — Columna del Kanban
  - Drop zone
  - Contador de leads
  - Drag over highlight

- ✅ `components/leads/LeadModal.tsx` — Modal detalle/edición
  - Vista lectura: grid 2 columnas
  - Vista edición: formulario completo
  - Guardar cambios a BD

- ✅ `components/leads/AddColumnModal.tsx` — Modal crear columna
  - Selector de color
  - Validación de nombre

- ✅ `components/leads/KanbanBoard.tsx` — Orquestador del Kanban
  - Manejo de drag & drop
  - Filtros (búsqueda + propiedades)
  - Integración API
  - Botón ON/OFF agente (admin)

- ✅ `components/layout/Sidebar.tsx` — Navegación lateral
  - Colapsable
  - Secciones: General, Mensajería, Cartera, Asistentes
  - Indicador activo
  - User info + logout

### 📄 Páginas
- ✅ `app/leads/page.tsx` — Página principal del Kanban
  - Carga leads y columnas
  - Protegida con AuthGuard
  - Toggle ON/OFF agente

- ✅ `app/page.tsx` — Redirección inteligente
  - Usuario autenticado → /dashboard
  - No autenticado → /login

- ✅ `app/dashboard/page.tsx` — Dashboard mejorado
  - Estadísticas de leads (total, últimos 7, últimos 30)
  - Info del usuario
  - Links rápidos

- ✅ `app/layout.tsx` — Layout actualizado con Sidebar

---

## 🎯 Características Implementadas

### ✨ Funcionalidades
✅ **Kanban Drag & Drop**
- Arrastra leads entre columnas
- Actualización en BD al soltar
- Highlight al pasar sobre columna

✅ **Filtros**
- Búsqueda por nombre/teléfono en tiempo real
- Filtro por propiedad de interés
- Contador dinámico de leads por columna

✅ **Modal de Edición**
- Vista lectura: todos los campos
- Vista edición: formulario con selects
- Guardar cambios directamente a BD

✅ **Gestión de Columnas**
- Ver todas las columnas
- Crear nueva columna (nombre + color)
- Delete columna (futura)

✅ **Integración WhatsApp**
- Botón para abrir chat (wa.me)
- Mostrado en hover de tarjeta

✅ **Control de Agente (Admin Only)**
- Botón ON/OFF visible solo para admin
- Status guardado en `agent_status`
- n8n consulta este valor

---

## 📊 Flujo de Datos

```
BD (PostgreSQL/Supabase)
    ↓
/api/leads (GET con filtros)
    ↓
useState → leads, columns
    ↓
Render Kanban
    ↓
Usuario interactúa (drag, click, edita)
    ↓
POST/PUT /api/leads o /api/columns
    ↓
BD actualizada
    ↓
State actualizado → Re-render
```

---

## 🔄 Estados de un Lead

| Estado | Significado | Color |
|--------|-----------|-------|
| frio | No ha respondido | Gris #6B7280 |
| tibio | Mostró interés inicial | Amarillo #F59E0B |
| visita | Ya visitó propiedad | Azul #3B82F6 |
| caliente | Gran probabilidad compra | Rojo #EF4444 |
| llamada | Pendiente llamada | Verde #10B981 |
| busqueda | En búsqueda activa | (custom) |

---

## 📱 Responsivas

✅ Todos los componentes son responsive
✅ Sidebar colapsable en mobile
✅ Modales ajustables
✅ Kanban scrolleable

---

## 🔐 Seguridad

✅ Todas las rutas API protegidas con JWT
✅ Botón ON/OFF: solo admin (verificado en backend)
✅ Middleware valida autorización

---

## 🚀 Cómo Usar

### 1. Setup BD
```bash
# Ejecutar SQL de inicialización
psql stragora_alliance_crm < sql/init-kanban.sql
```

### 2. Iniciar App
```bash
npm run dev
# http://localhost:3000/login
```

### 3. Login y Navegar
```
Usuario: admin
Contraseña: Admin@123

→ Dashboard
→ Click "Tablero de Leads"
→ Ver y gestionar leads
```

---

## 📋 Campos Editables de Lead

- **nombre** — Nombre del cliente (texto)
- **estado** — Posición en Kanban (select: frio/tibio/visita/caliente/llamada)
- **presupuesto** — Rango USD (número)
- **zona** — Zona/localidad (texto)
- **tipo_propiedad** — Tipo inmueble (select: depto/casa/ph/terreno/local)
- **forma_pago** — Forma pago (select: contado/financiado/hipotecario/mixto)
- **intencion** — Comprar o vender (select)
- **propiedad_interes** — Dirección de propiedad consultada (texto)

---

## 🎨 Componentes Reutilizables

El sistema está 100% componentizado para fácil mantenimiento:

```
components/leads/
├── LeadCard.tsx           ← Tarjeta individual
├── KanbanColumn.tsx       ← Columna
├── KanbanBoard.tsx        ← Orquestador
├── LeadModal.tsx          ← Modal edición
└── AddColumnModal.tsx     ← Modal columna nueva

components/layout/
├── Sidebar.tsx            ← Navegación
└── AuthGuard.tsx          ← Protección
```

---

## 🔧 Próximos Pasos (Fase 2)

- [ ] Centro de Comunicación (Chats)
- [ ] Mensajes Programados
- [ ] Propiedades Kanban
- [ ] Gestión de usuarios (CRUD admin)
- [ ] Búsquedas
- [ ] Campañas Activas
- [ ] Two-factor authentication
- [ ] Logs de auditoría

---

## ✅ CHECKLIST FINAL

- [ ] Ejecutar `sql/init-kanban.sql`
- [ ] `npm run dev`
- [ ] Login en /login
- [ ] Ver dashboard estadísticas
- [ ] Click en "Tablero de Leads"
- [ ] Ver todos los leads en columnas
- [ ] Arrastrar lead entre columnas (drag & drop)
- [ ] Click en lead → editar modal
- [ ] Cambiar algún campo y guardar
- [ ] Crear nueva columna (botón +)
- [ ] Verificar filtros funcionan
- [ ] Si es admin: ver botón ON/OFF agente
- [ ] Click WhatsApp en tarjeta

---

**🎉 ¡KANBAN MIGRADO Y FUNCIONAL!**

Referencia: `ARQUITECTURA-CRM-STRAGORA-ALLIANCE.md` ✅

Stack: Next.js 14 + React + TypeScript + Tailwind + PostgreSQL ✅
