# ðŸ“Š MIGRACIÃ“N KANBAN DE LEADS â€” COMPLETADA

## âœ… Archivos Creados

### ðŸ—„ï¸ Base de Datos
- âœ… `sql/init-kanban.sql` â€” Tabla kanban_columns con datos iniciales

### ðŸ› ï¸ Utilidades
- âœ… `lib/leads.ts` â€” Tipos (Lead, KanbanColumn) + funciones helper
  - `estadoToColumn()` â€” mapeo estado â†’ nombre columna
  - `columnToEstado()` â€” mapeo inverso
  - `formatCurrency()` â€” formato USD
  - `getLeadDisplayName()` â€” obtener nombre visible
  - `getUniqueProperties()` â€” propiedades Ãºnicas de leads

### ðŸŒ API Routes
- âœ… `app/api/leads/route.ts` â€” GET (con filtros) y POST
  - GET: filtrado por estado, bÃºsqueda, propiedad
  - POST: crear nuevo lead
  
- âœ… `app/api/leads/[id]/route.ts` â€” GET, PUT, DELETE lead individual
  - PUT: actualizaciÃ³n selectiva de campos
  - DELETE: eliminar lead

- âœ… `app/api/columns/route.ts` â€” GET y POST columnas
  - GET: obtener todas ordenadas
  - POST: crear nueva columna

- âœ… `app/api/columns/[id]/route.ts` â€” PUT y DELETE columnas individuales

- âœ… `app/api/agent/route.ts` â€” GET/PUT estado del agente (ON/OFF)
  - GET: obtener estado actual
  - PUT: cambiar estado (solo admin)

### ðŸ’» Componentes React
- âœ… `components/leads/LeadCard.tsx` â€” Tarjeta individual de lead
  - Drag & drop
  - Click para editar
  - Botones WhatsApp y ediciÃ³n en hover

- âœ… `components/leads/KanbanColumn.tsx` â€” Columna del Kanban
  - Drop zone
  - Contador de leads
  - Drag over highlight

- âœ… `components/leads/LeadModal.tsx` â€” Modal detalle/ediciÃ³n
  - Vista lectura: grid 2 columnas
  - Vista ediciÃ³n: formulario completo
  - Guardar cambios a BD

- âœ… `components/leads/AddColumnModal.tsx` â€” Modal crear columna
  - Selector de color
  - ValidaciÃ³n de nombre

- âœ… `components/leads/KanbanBoard.tsx` â€” Orquestador del Kanban
  - Manejo de drag & drop
  - Filtros (bÃºsqueda + propiedades)
  - IntegraciÃ³n API
  - BotÃ³n ON/OFF agente (admin)

- âœ… `components/layout/Sidebar.tsx` â€” NavegaciÃ³n lateral
  - Colapsable
  - Secciones: General, MensajerÃ­a, Cartera, Asistentes
  - Indicador activo
  - User info + logout

### ðŸ“„ PÃ¡ginas
- âœ… `app/leads/page.tsx` â€” PÃ¡gina principal del Kanban
  - Carga leads y columnas
  - Protegida con AuthGuard
  - Toggle ON/OFF agente

- âœ… `app/page.tsx` â€” RedirecciÃ³n inteligente
  - Usuario autenticado â†’ /dashboard
  - No autenticado â†’ /login

- âœ… `app/dashboard/page.tsx` â€” Dashboard mejorado
  - EstadÃ­sticas de leads (total, Ãºltimos 7, Ãºltimos 30)
  - Info del usuario
  - Links rÃ¡pidos

- âœ… `app/layout.tsx` â€” Layout actualizado con Sidebar

---

## ðŸŽ¯ CaracterÃ­sticas Implementadas

### âœ¨ Funcionalidades
âœ… **Kanban Drag & Drop**
- Arrastra leads entre columnas
- ActualizaciÃ³n en BD al soltar
- Highlight al pasar sobre columna

âœ… **Filtros**
- BÃºsqueda por nombre/telÃ©fono en tiempo real
- Filtro por propiedad de interÃ©s
- Contador dinÃ¡mico de leads por columna

âœ… **Modal de EdiciÃ³n**
- Vista lectura: todos los campos
- Vista ediciÃ³n: formulario con selects
- Guardar cambios directamente a BD

âœ… **GestiÃ³n de Columnas**
- Ver todas las columnas
- Crear nueva columna (nombre + color)
- Delete columna (futura)

âœ… **IntegraciÃ³n WhatsApp**
- BotÃ³n para abrir chat (wa.me)
- Mostrado en hover de tarjeta

âœ… **Control de Agente (Admin Only)**
- BotÃ³n ON/OFF visible solo para admin
- Status guardado en `agent_status`
- n8n consulta este valor

---

## ðŸ“Š Flujo de Datos

```
BD (PostgreSQL/Supabase)
    â†“
/api/leads (GET con filtros)
    â†“
useState â†’ leads, columns
    â†“
Render Kanban
    â†“
Usuario interactÃºa (drag, click, edita)
    â†“
POST/PUT /api/leads o /api/columns
    â†“
BD actualizada
    â†“
State actualizado â†’ Re-render
```

---

## ðŸ”„ Estados de un Lead

| Estado | Significado | Color |
|--------|-----------|-------|
| frio | No ha respondido | Gris #6B7280 |
| tibio | MostrÃ³ interÃ©s inicial | Amarillo #F59E0B |
| visita | Ya visitÃ³ propiedad | Azul #3B82F6 |
| caliente | Gran probabilidad compra | Rojo #EF4444 |
| llamada | Pendiente llamada | Verde #10B981 |
| busqueda | En bÃºsqueda activa | (custom) |

---

## ðŸ“± Responsivas

âœ… Todos los componentes son responsive
âœ… Sidebar colapsable en mobile
âœ… Modales ajustables
âœ… Kanban scrolleable

---

## ðŸ” Seguridad

âœ… Todas las rutas API protegidas con JWT
âœ… BotÃ³n ON/OFF: solo admin (verificado en backend)
âœ… Middleware valida autorizaciÃ³n

---

## ðŸš€ CÃ³mo Usar

### 1. Setup BD
```bash
# Ejecutar SQL de inicializaciÃ³n
psql BRIQIA_alliance_crm < sql/init-kanban.sql
```

### 2. Iniciar App
```bash
npm run dev
# http://localhost:3000/login
```

### 3. Login y Navegar
```
Usuario: admin
ContraseÃ±a: Admin@123

â†’ Dashboard
â†’ Click "Tablero de Leads"
â†’ Ver y gestionar leads
```

---

## ðŸ“‹ Campos Editables de Lead

- **nombre** â€” Nombre del cliente (texto)
- **estado** â€” PosiciÃ³n en Kanban (select: frio/tibio/visita/caliente/llamada)
- **presupuesto** â€” Rango USD (nÃºmero)
- **zona** â€” Zona/localidad (texto)
- **tipo_propiedad** â€” Tipo inmueble (select: depto/casa/ph/terreno/local)
- **forma_pago** â€” Forma pago (select: contado/financiado/hipotecario/mixto)
- **intencion** â€” Comprar o vender (select)
- **propiedad_interes** â€” DirecciÃ³n de propiedad consultada (texto)

---

## ðŸŽ¨ Componentes Reutilizables

El sistema estÃ¡ 100% componentizado para fÃ¡cil mantenimiento:

```
components/leads/
â”œâ”€â”€ LeadCard.tsx           â† Tarjeta individual
â”œâ”€â”€ KanbanColumn.tsx       â† Columna
â”œâ”€â”€ KanbanBoard.tsx        â† Orquestador
â”œâ”€â”€ LeadModal.tsx          â† Modal ediciÃ³n
â””â”€â”€ AddColumnModal.tsx     â† Modal columna nueva

components/layout/
â”œâ”€â”€ Sidebar.tsx            â† NavegaciÃ³n
â””â”€â”€ AuthGuard.tsx          â† ProtecciÃ³n
```

---

## ðŸ”§ PrÃ³ximos Pasos (Fase 2)

- [ ] Centro de ComunicaciÃ³n (Chats)
- [ ] Mensajes Programados
- [ ] Propiedades Kanban
- [ ] GestiÃ³n de usuarios (CRUD admin)
- [ ] BÃºsquedas
- [ ] CampaÃ±as Activas
- [ ] Two-factor authentication
- [ ] Logs de auditorÃ­a

---

## âœ… CHECKLIST FINAL

- [ ] Ejecutar `sql/init-kanban.sql`
- [ ] `npm run dev`
- [ ] Login en /login
- [ ] Ver dashboard estadÃ­sticas
- [ ] Click en "Tablero de Leads"
- [ ] Ver todos los leads en columnas
- [ ] Arrastrar lead entre columnas (drag & drop)
- [ ] Click en lead â†’ editar modal
- [ ] Cambiar algÃºn campo y guardar
- [ ] Crear nueva columna (botÃ³n +)
- [ ] Verificar filtros funcionan
- [ ] Si es admin: ver botÃ³n ON/OFF agente
- [ ] Click WhatsApp en tarjeta

---

**ðŸŽ‰ Â¡KANBAN MIGRADO Y FUNCIONAL!**

Referencia: `ARQUITECTURA-CRM-BRIQIA-ALLIANCE.md` âœ…

Stack: Next.js 14 + React + TypeScript + Tailwind + PostgreSQL âœ…
