import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Plus, GripVertical, ChevronDown, ChevronRight, LayoutDashboard, Users, MessageSquare, Calendar, Building2, Compass, Megaphone, FileText, BookOpen, Settings, LogOut, X, Edit3, Phone, ExternalLink, MoreVertical, Filter, List, Columns3, TrendingUp, TrendingDown, Clock, ChevronLeft, Send, Paperclip, Star, Eye, Trash2, Power, Menu, UserCircle, Shield } from "lucide-react";

// ═══════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════

const INITIAL_COLUMNS = [
  { id: 1, nombre: "Frío", orden: 1, color: "#6B7280" },
  { id: 2, nombre: "Tibios", orden: 2, color: "#F59E0B" },
  { id: 3, nombre: "Visitas", orden: 3, color: "#3B82F6" },
  { id: 4, nombre: "Calientes", orden: 4, color: "#EF4444" },
  { id: 5, nombre: "Llamadas", orden: 5, color: "#10B981" },
];

const PROPERTIES = [
  "116 e/ 34 y 35", "122 e/ 47 y 48", "134 e/ 417 y 418",
  "139 e/ 64 y 65", "151 esq 531"
];

const INITIAL_LEADS = [
  { id: 1, whatsapp_id: "5492216198542", nombre: "Luis Marinelli", estado: "frio", presupuesto: 63, zona: "Algun", tipo_propiedad: "ph", forma_pago: null, intencion: "comprar", propiedad_interes: "116 e/ 34 y 35", created_at: "2026-03-15", updated_at: "2026-04-28" },
  { id: 2, whatsapp_id: "5492216792320", nombre: "Pablo", estado: "frio", presupuesto: 0, zona: null, tipo_propiedad: "departamento", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-03-20", updated_at: "2026-04-25" },
  { id: 3, whatsapp_id: "5492215939469", nombre: "Fabian Vittola", estado: "frio", presupuesto: 0, zona: "Algun", tipo_propiedad: "departamento", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-04-01", updated_at: "2026-04-20" },
  { id: 4, whatsapp_id: "5492216546805", nombre: null, estado: "frio", presupuesto: 0, zona: null, tipo_propiedad: "casa", forma_pago: "busqueda", intencion: null, propiedad_interes: null, created_at: "2026-04-05", updated_at: "2026-04-22" },
  { id: 5, whatsapp_id: "5492215052784", nombre: null, estado: "frio", presupuesto: 0, zona: null, tipo_propiedad: null, forma_pago: "comunicarte", intencion: null, propiedad_interes: null, created_at: "2026-04-10", updated_at: "2026-04-18" },
  { id: 6, whatsapp_id: "5492353496432", nombre: null, estado: "tibio", presupuesto: 10, zona: "La plata", tipo_propiedad: "casa", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-03-10", updated_at: "2026-04-27" },
  { id: 7, whatsapp_id: "5492215733471", nombre: "Maria", estado: "tibio", presupuesto: 65, zona: "Venta", tipo_propiedad: "casa", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-03-22", updated_at: "2026-04-26" },
  { id: 8, whatsapp_id: "5492215733471b", nombre: "quiquemariano", estado: "tibio", presupuesto: 55, zona: "Algun", tipo_propiedad: "departamento", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-04-02", updated_at: "2026-04-24" },
  { id: 9, whatsapp_id: "5492214774152", nombre: "Nico R.", estado: "tibio", presupuesto: 34, zona: "Plata", tipo_propiedad: "departamento", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-04-08", updated_at: "2026-04-23" },
  { id: 10, whatsapp_id: "5482215337524", nombre: "Verónica Salvi", estado: "visita", presupuesto: 0, zona: "Avisor", tipo_propiedad: null, forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-02-15", updated_at: "2026-04-28" },
  { id: 11, whatsapp_id: "5917517484", nombre: "Vicky", estado: "visita", presupuesto: 140, zona: "Encima", tipo_propiedad: "departamento", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-03-05", updated_at: "2026-04-27" },
  { id: 12, whatsapp_id: "5493392633842", nombre: "Oscar Piñeyro", estado: "visita", presupuesto: 0, zona: "Plata", tipo_propiedad: "departamento", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-03-18", updated_at: "2026-04-25" },
  { id: 13, whatsapp_id: "5492216220842", nombre: "→) Noe (←", estado: "caliente", presupuesto: 50, zona: "Los", tipo_propiedad: "departamento", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-02-20", updated_at: "2026-04-28" },
  { id: 14, whatsapp_id: "1156214412", nombre: "Luciano Morales", estado: "caliente", presupuesto: 120000, zona: "quilmes, bernal", tipo_propiedad: "casa", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-03-01", updated_at: "2026-04-28" },
  { id: 15, whatsapp_id: "1168542861", nombre: "Estefanía", estado: "caliente", presupuesto: 121000, zona: "Quilmes, bernal", tipo_propiedad: "casa", forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-03-12", updated_at: "2026-04-27" },
  { id: 16, whatsapp_id: "2215312440", nombre: "Daniela Gvaernet", estado: "caliente", presupuesto: 150000, zona: "Gonnet", tipo_propiedad: null, forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-03-25", updated_at: "2026-04-26" },
  { id: 17, whatsapp_id: "javier001", nombre: "Javier", estado: "llamada", presupuesto: null, zona: null, tipo_propiedad: null, forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-04-01", updated_at: "2026-04-28" },
  { id: 18, whatsapp_id: "josias001", nombre: "Josías", estado: "llamada", presupuesto: null, zona: null, tipo_propiedad: null, forma_pago: null, intencion: null, propiedad_interes: null, created_at: "2026-04-05", updated_at: "2026-04-27" },
];

const MOCK_CHATS = [
  { id: 1, name: "Nelly Echenique", phone: "549221540595B", lastMessage: "Busco casa casco urbano, con g...", unread: 100, propiedad: "116 E/ 34...", presupuesto: 200 },
  { id: 2, name: "Luis Marinelli", phone: "5492216198542", lastMessage: "¡Que bueno saberlo! Mucha suert...", unread: 200, propiedad: "26 E/ 66...", presupuesto: 200 },
  { id: 3, name: "549235249643...", phone: "549235249643", lastMessage: "", unread: 200, propiedad: "116 E/ 34...", presupuesto: 200, starred: true },
  { id: 4, name: "Nelida Pagnat", phone: "5492214957804", lastMessage: "Hola! Si, sigo buscando. Alrede...", unread: 200, propiedad: null, presupuesto: 200, tagged: "EDADES" },
  { id: 5, name: "María", phone: "5492215733471", lastMessage: "", unread: 200, propiedad: null, presupuesto: 200, tagged: "EDADES" },
  { id: 6, name: "Cecilia Soto", phone: "5492214770660", lastMessage: "Hola! ¿Cómo estás? Soy Maga, a...", unread: 200, propiedad: "31 E/ 480...", presupuesto: 200 },
  { id: 7, name: "Marisol", phone: "5492214770671", lastMessage: "Hola! ¿Cómo estás? Soy Maga, a...", unread: 200, propiedad: "466 E/ 2...", presupuesto: 200 },
];

const MOCK_MESSAGES = [
  { id: 1, type: "outgoing", content: "Hola! ¿Cómo estás? Soy Maga, asistente de Andrés Ali en RE/MAX Diagonal II. ¿Me podés darte un servicio que sigue activo o ya no necesitás? Contame qué estás buscando y en qué rangos te manejás, así te acomodo.", time: "03:54 p.m.", sender: "agent" },
  { id: 2, type: "incoming", content: "Busco casa casco urbano, con garage, habitable al momento, con espacios amplios, 2 o 3 dormitorios o escritorio gracias!!@", time: "08:27 p.m.", sender: "client" },
];

const SEGUIMIENTOS = [
  { id: 1, fecha: "2026-04-29", tipo: "hoy", mensajes: 14, estado: "pendiente" },
  { id: 2, fecha: "2026-04-30", tipo: "mañana", mensajes: 4, estado: "pendiente" },
  { id: 3, fecha: "2026-05-03", tipo: "mie", mensajes: 12, estado: "pendiente" },
];

const SEGUIMIENTOS_ENVIADOS = [
  { fecha: "2025-12-29", mensajes: 8 },
  { fecha: "2026-01-12", mensajes: 11 },
  { fecha: "2026-01-13", mensajes: 6 },
  { fecha: "2026-01-14", mensajes: 16 },
  { fecha: "2026-01-20", mensajes: 9 },
];

// ═══════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════

const estadoToColumn = (estado) => {
  const map = { frio: "Frío", tibio: "Tibios", visita: "Visitas", caliente: "Calientes", llamada: "Llamadas" };
  return map[estado] || "Frío";
};

const columnToEstado = (col) => {
  const map = { "Frío": "frio", "Tibios": "tibio", "Visitas": "visita", "Calientes": "caliente", "Llamadas": "llamada" };
  return map[col] || "frio";
};

const formatCurrency = (val) => {
  if (!val || val === 0) return "US$ 0";
  if (val >= 1000) return `US$ ${(val / 1000).toFixed(0)}k`;
  return `US$ ${val}`;
};

const getLeadDisplayName = (lead) => lead.nombre || lead.whatsapp_id || "Sin nombre";

// ═══════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════

// ── Badge ──
function Badge({ children, color = "#6B7280", variant = "filled" }) {
  if (variant === "outline") {
    return (
      <span style={{ border: `1px solid ${color}`, color, fontSize: 10, padding: "1px 6px", borderRadius: 4, fontWeight: 600, whiteSpace: "nowrap" }}>
        {children}
      </span>
    );
  }
  return (
    <span style={{ background: color, color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

// ── Stat Card ──
function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "#6B7280", fontSize: 13, margin: 0, fontWeight: 500 }}>{title}</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: "4px 0 0", color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>{value}</p>
          {subtitle && <p style={{ color: "#9CA3AF", fontSize: 12, margin: "4px 0 0" }}>{subtitle}</p>}
        </div>
        {Icon && (
          <div style={{ background: "#F3F4F6", borderRadius: 8, padding: 8, display: "flex" }}>
            <Icon size={18} color="#6B7280" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Lead Card ──
function LeadCard({ lead, onOpen, onDragStart, presupuesto }) {
  const name = getLeadDisplayName(lead);
  const col = estadoToColumn(lead.estado);
  const colData = INITIAL_COLUMNS.find(c => c.nombre === col);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={() => onOpen(lead)}
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 8,
        cursor: "grab",
        transition: "box-shadow 0.15s, transform 0.1s",
        position: "relative",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: "#111827", maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>{presupuesto || 200}</span>
      </div>
      <div style={{ marginBottom: 6 }}>
        <Badge color={colData?.color || "#6B7280"}>{lead.estado}</Badge>
      </div>
      <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.6 }}>
        {lead.zona && <div>📍 {lead.zona}</div>}
        {lead.tipo_propiedad && <div>🏠 {lead.tipo_propiedad} · {formatCurrency(lead.presupuesto)}</div>}
        {lead.whatsapp_id && <div>📱 {lead.whatsapp_id}</div>}
      </div>
    </div>
  );
}

// ── Lead Detail Modal ──
function LeadModal({ lead, onClose, onSave, columns }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...lead });

  if (!lead) return null;

  const handleSave = () => {
    onSave(form);
    setEditing(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: 520, maxHeight: "85vh", overflow: "auto", padding: 0 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>
              {getLeadDisplayName(lead)}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6B7280" }}>{lead.whatsapp_id}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing(!editing)} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500 }}>
              <Edit3 size={14} /> {editing ? "Cancelar" : "Editar"}
            </button>
            <button onClick={() => window.open(`https://wa.me/${lead.whatsapp_id}`, "_blank")} style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500 }}>
              <Phone size={14} /> WhatsApp
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <X size={18} color="#9CA3AF" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Nombre", key: "nombre", type: "text" },
                { label: "Estado", key: "estado", type: "select", options: columns.map(c => ({ value: columnToEstado(c.nombre), label: c.nombre })) },
                { label: "Presupuesto (USD)", key: "presupuesto", type: "number" },
                { label: "Zona", key: "zona", type: "text" },
                { label: "Tipo propiedad", key: "tipo_propiedad", type: "select", options: [{ value: "departamento", label: "Departamento" }, { value: "casa", label: "Casa" }, { value: "ph", label: "PH" }, { value: "terreno", label: "Terreno" }, { value: "local", label: "Local" }] },
                { label: "Forma de pago", key: "forma_pago", type: "select", options: [{ value: "contado", label: "Contado" }, { value: "financiado", label: "Financiado" }, { value: "hipotecario", label: "Hipotecario" }, { value: "mixto", label: "Mixto" }] },
                { label: "Intención", key: "intencion", type: "select", options: [{ value: "comprar", label: "Comprar" }, { value: "vender", label: "Vender" }] },
                { label: "Propiedad de interés", key: "propiedad_interes", type: "text" },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      value={form[field.key] || ""}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value || null })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}
                    >
                      <option value="">Sin definir</option>
                      {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.key] || ""}
                      onChange={e => setForm({ ...form, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  )}
                </div>
              ))}
              <button onClick={handleSave} style={{ background: "#166534", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
                Guardar cambios
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Estado", value: lead.estado },
                { label: "Presupuesto", value: formatCurrency(lead.presupuesto) },
                { label: "Zona", value: lead.zona || "—" },
                { label: "Tipo", value: lead.tipo_propiedad || "—" },
                { label: "Forma de pago", value: lead.forma_pago || "—" },
                { label: "Intención", value: lead.intencion || "—" },
                { label: "Propiedad interés", value: lead.propiedad_interes || "—" },
                { label: "Última interacción", value: lead.updated_at || "—" },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</p>
                  <p style={{ fontSize: 14, color: "#111827", margin: "2px 0 0", fontWeight: 500 }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Chat Panel (Modal) ──
function ChatModal({ lead, messages, onClose }) {
  const [msg, setMsg] = useState("");
  if (!lead) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#ECE5DD", borderRadius: 16, width: 480, height: 600, display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: "#166534", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCircle size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: 14 }}>{getLeadDisplayName(lead)}</p>
            <p style={{ margin: 0, color: "#D1FAE5", fontSize: 11 }}>{lead.whatsapp_id}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color="#fff" />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 8, backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M30 5L35 15L25 15Z\" fill=\"%23d4ccbb\" opacity=\"0.15\"/%3E%3C/svg%3E')" }}>
          {messages.map(m => (
            <div key={m.id} style={{ alignSelf: m.sender === "agent" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
              <div style={{
                background: m.sender === "agent" ? "#DCF8C6" : "#fff",
                padding: "8px 12px",
                borderRadius: m.sender === "agent" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}>
                <p style={{ margin: 0, fontSize: 13, color: "#111827", lineHeight: 1.5 }}>{m.content}</p>
                <p style={{ margin: "4px 0 0", fontSize: 10, color: "#6B7280", textAlign: "right" }}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ background: "#F0F0F0", padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
          <Paperclip size={18} color="#6B7280" style={{ cursor: "pointer" }} />
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Escribir un mensaje..."
            style={{ flex: 1, border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 13, outline: "none", background: "#fff" }}
          />
          <button style={{ background: "#166534", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Column Modal ──
function AddColumnModal({ onClose, onAdd }) {
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#6B7280");
  const colors = ["#6B7280", "#F59E0B", "#3B82F6", "#EF4444", "#10B981", "#8B5CF6", "#EC4899", "#F97316"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: 380, padding: 24 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Nueva columna</h3>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre de la columna"
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 14, boxSizing: "border-box" }}
          autoFocus
        />
        <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Color</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {colors.map(c => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                border: color === c ? "3px solid #111827" : "3px solid transparent",
                transition: "border 0.15s"
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", border: "1px solid #D1D5DB", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => { if (nombre.trim()) onAdd(nombre.trim(), color); }} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 8, background: "#166534", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Agregar</button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ──
function Sidebar({ active, onNavigate, collapsed, onToggle, isAdmin }) {
  const sections = [
    {
      label: "GENERAL", items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "leads", label: "Leads", icon: Users },
      ]
    },
    {
      label: "MENSAJERÍA", items: [
        { id: "chats", label: "Chats", icon: MessageSquare },
        { id: "mensajes", label: "Mensajes Programados", icon: Calendar },
      ]
    },
    {
      label: "CARTERA", items: [
        { id: "propiedades", label: "Propiedades", icon: Building2 },
        { id: "busquedas", label: "Búsquedas", icon: Compass },
        { id: "campanas", label: "Campañas Activas", icon: Megaphone },
      ]
    },
    {
      label: "ASISTENTES", items: [
        { id: "cotizaciones", label: "Cotizaciones", icon: FileText },
        { id: "documentacion", label: "Documentación", icon: BookOpen },
      ]
    },
  ];

  return (
    <div style={{
      width: collapsed ? 60 : 220,
      minHeight: "100vh",
      background: "#fff",
      borderRight: "1px solid #E5E7EB",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.2s",
      position: "relative",
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "16px 10px" : "16px 18px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#166534", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>A</span>
        </div>
        {!collapsed && <span style={{ fontWeight: 700, fontSize: 15, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>Stragora Alliance</span>}
        <button onClick={onToggle} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 2 }}>
          {collapsed ? <ChevronRight size={16} color="#9CA3AF" /> : <ChevronLeft size={16} color="#9CA3AF" />}
        </button>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {sections.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", padding: "12px 18px 4px", margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>
                {section.label}
              </p>
            )}
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: collapsed ? "10px 18px" : "8px 18px",
                    background: isActive ? "#F0FDF4" : "transparent",
                    border: "none",
                    borderRight: isActive ? "3px solid #166534" : "3px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    color: isActive ? "#166534" : "#4B5563",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    justifyContent: collapsed ? "center" : "flex-start",
                  }}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User */}
      <div style={{ borderTop: "1px solid #E5E7EB", padding: collapsed ? "12px 10px" : "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <UserCircle size={20} color="#6B7280" />
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>Usuario admin</p>
            <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 }}>
              {isAdmin && <Shield size={10} />} Admin
            </p>
          </div>
        )}
        {!collapsed && (
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <Settings size={16} color="#9CA3AF" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Mini Chart (Dashboard) ──
function MiniChart() {
  const points = [10, 25, 18, 45, 30, 55, 40, 70, 35, 80, 60, 90, 50, 75, 85, 42, 65, 55, 70, 45, 60, 38, 50, 30, 40, 22, 35, 15, 28, 20];
  const max = Math.max(...points);
  const w = 700;
  const h = 180;
  const pts = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - (p / max) * h}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 180 }}>
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#166534" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#166534" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#grad1)" />
      <polyline points={pts} fill="none" stroke="#166534" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Second line for tibios */}
      <polyline
        points={points.map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p * 0.5) / max) * h}`).join(" ")}
        fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" strokeDasharray="0"
      />
      <polyline
        points={points.map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p * 0.3) / max) * h}`).join(" ")}
        fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

// ═══════════════════════════════════════
// PAGES
// ═══════════════════════════════════════

// ── Dashboard ──
function DashboardPage({ leads }) {
  const total = leads.length;
  const last7 = leads.filter(l => { const d = new Date(l.created_at); const now = new Date(); return (now - d) / 86400000 <= 7; }).length;
  const last30 = leads.filter(l => { const d = new Date(l.created_at); const now = new Date(); return (now - d) / 86400000 <= 30; }).length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>Dashboard</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6B7280" }}>Métricas y estadísticas de leads</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard title="Total de Leads" value={total.toLocaleString()} subtitle="Todos los leads registrados" icon={Users} />
        <StatCard title="Últimos 7 días" value={last7} subtitle="Leads ingresados esta semana" icon={Calendar} />
        <StatCard title="Últimos 30 días" value={last30} subtitle="Leads ingresados este mes" icon={TrendingUp} />
      </div>

      {/* Chart */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>Leads por Período</h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>Total, tibios, fríos y calientes según fecha de ingreso · 30 días</p>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #D1D5DB", borderRadius: 8, padding: "6px 12px" }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>Desde:</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#111827" }}>25/03/2026</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #D1D5DB", borderRadius: 8, padding: "6px 12px" }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>Hasta:</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#111827" }}>23/04/2026</span>
          </div>
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            {["7 días", "30 días", "90 días", "Por defecto (30 días)"].map(p => (
              <button key={p} style={{ padding: "5px 12px", border: "1px solid #D1D5DB", borderRadius: 6, background: p === "30 días" ? "#166534" : "#fff", color: p === "30 días" ? "#fff" : "#374151", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>{p}</button>
            ))}
          </div>
        </div>
        <MiniChart />
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6B7280" }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: "#166534" }} /> Total
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6B7280" }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: "#F59E0B" }} /> Tibios
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6B7280" }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: "#3B82F6" }} /> Fríos
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Leads Kanban ──
function LeadsPage({ leads, setLeads, columns, setColumns, agentActive, setAgentActive, isAdmin }) {
  const [search, setSearch] = useState("");
  const [selectedProp, setSelectedProp] = useState("Todas");
  const [selectedLead, setSelectedLead] = useState(null);
  const [chatLead, setChatLead] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const filteredLeads = leads.filter(l => {
    const matchSearch = !search || getLeadDisplayName(l).toLowerCase().includes(search.toLowerCase()) || (l.whatsapp_id || "").includes(search);
    const matchProp = selectedProp === "Todas" || l.propiedad_interes === selectedProp;
    return matchSearch && matchProp;
  });

  const handleDrop = (colName) => {
    if (!draggedLead) return;
    const newEstado = columnToEstado(colName);
    setLeads(prev => prev.map(l => l.id === draggedLead.id ? { ...l, estado: newEstado } : l));
    setDraggedLead(null);
    setDragOverCol(null);
  };

  const handleSaveLead = (updated) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLead(null);
  };

  const addColumn = (nombre, color) => {
    const maxOrder = Math.max(...columns.map(c => c.orden), 0);
    setColumns([...columns, { id: Date.now(), nombre, orden: maxOrder + 1, color }]);
    setShowAddColumn(false);
  };

  return (
    <div style={{ padding: "20px 24px", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexShrink: 0, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>Tablero de Leads</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              style={{ padding: "8px 12px 8px 32px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13, width: 240, outline: "none", background: "#fff" }}
            />
          </div>
          {/* ON/OFF Toggle */}
          {isAdmin && (
            <button
              onClick={() => setAgentActive(!agentActive)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8,
                background: agentActive ? "#166534" : "#6B7280",
                color: "#fff", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, transition: "background 0.2s"
              }}
            >
              <Power size={15} /> {agentActive ? "ON" : "OFF"}
            </button>
          )}
          {/* Add column */}
          <button
            onClick={() => setShowAddColumn(true)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 8, background: "#fff", border: "1px solid #D1D5DB", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Property filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexShrink: 0, overflowX: "auto", paddingBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500, alignSelf: "center", marginRight: 4 }}>Productos:</span>
        {["Todas", ...PROPERTIES].map(p => (
          <button
            key={p}
            onClick={() => setSelectedProp(p)}
            style={{
              padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              border: selectedProp === p ? "1px solid #166534" : "1px solid #D1D5DB",
              background: selectedProp === p ? "#F0FDF4" : "#fff",
              color: selectedProp === p ? "#166534" : "#374151",
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all 0.15s"
            }}
          >
            {p}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "#9CA3AF", alignSelf: "center", marginLeft: 4 }}>Mostrar todas ({leads.length})</span>
      </div>

      {/* Kanban */}
      <div style={{ flex: 1, display: "flex", gap: 12, overflowX: "auto", overflowY: "hidden", paddingBottom: 8 }}>
        {columns.sort((a, b) => a.orden - b.orden).map(col => {
          const colLeads = filteredLeads.filter(l => estadoToColumn(l.estado) === col.nombre);
          return (
            <div
              key={col.id}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.nombre); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={() => handleDrop(col.nombre)}
              style={{
                minWidth: 260,
                maxWidth: 280,
                flex: "0 0 260px",
                background: dragOverCol === col.nombre ? "#F0FDF4" : "#F9FAFB",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                border: dragOverCol === col.nombre ? "2px dashed #166534" : "1px solid #E5E7EB",
                transition: "all 0.2s",
              }}
            >
              {/* Column Header */}
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.color }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{col.nombre}</span>
                  <span style={{
                    background: "#E5E7EB", borderRadius: 10, padding: "1px 8px",
                    fontSize: 11, fontWeight: 600, color: "#6B7280"
                  }}>
                    {colLeads.length}
                  </span>
                </div>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: 0.5 }}>
                  <MoreVertical size={14} />
                </button>
              </div>

              {/* Cards */}
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
                {colLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onOpen={setSelectedLead}
                    onDragStart={(e, l) => { setDraggedLead(l); e.dataTransfer.effectAllowed = "move"; }}
                  />
                ))}
                {colLeads.length === 0 && (
                  <div style={{ padding: "24px 0", textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>
                    Sin leads
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {selectedLead && <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} onSave={handleSaveLead} columns={columns} />}
      {chatLead && <ChatModal lead={chatLead} messages={MOCK_MESSAGES} onClose={() => setChatLead(null)} />}
      {showAddColumn && <AddColumnModal onClose={() => setShowAddColumn(false)} onAdd={addColumn} />}
    </div>
  );
}

// ── Chats Page ──
function ChatsPage({ agentActive, isAdmin, setAgentActive }) {
  const [selectedChat, setSelectedChat] = useState(MOCK_CHATS[0]);
  const [msg, setMsg] = useState("");
  const [searchChat, setSearchChat] = useState("");

  const filtered = MOCK_CHATS.filter(c => !searchChat || c.name.toLowerCase().includes(searchChat.toLowerCase()) || c.phone.includes(searchChat));

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Chat List */}
      <div style={{ width: 320, borderRight: "1px solid #E5E7EB", display: "flex", flexDirection: "column", background: "#fff" }}>
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>Chats de WhatsApp ({MOCK_CHATS.length})</h2>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              value={searchChat}
              onChange={e => setSearchChat(e.target.value)}
              placeholder="Buscar por nombre, teléfono, propiedad..."
              style={{ width: "100%", padding: "8px 12px 8px 30px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 12, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid #F3F4F6",
                cursor: "pointer",
                background: selectedChat?.id === chat.id ? "#F0FDF4" : "#fff",
                transition: "background 0.1s",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MessageSquare size={16} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.name}</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.lastMessage || "..."}</p>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {chat.unread && <Badge color="#EF4444">{chat.unread}</Badge>}
                  {chat.propiedad && <Badge color="#3B82F6" variant="outline">{chat.propiedad}</Badge>}
                </div>
              </div>
              {chat.starred && <Star size={14} color="#F59E0B" fill="#F59E0B" style={{ flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#ECE5DD" }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div style={{ background: "#fff", padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #E5E7EB" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserCircle size={22} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827" }}>{selectedChat.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>{selectedChat.phone}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setAgentActive(!agentActive)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8,
                    background: agentActive ? "#166534" : "#6B7280",
                    color: "#fff", border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600
                  }}
                >
                  <Power size={14} /> {agentActive ? "ON" : "OFF"}
                </button>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{ alignSelf: "center", padding: "6px 16px", border: "1px solid #D1D5DB", borderRadius: 20, background: "#fff", fontSize: 12, color: "#6B7280", cursor: "pointer", marginBottom: 8 }}>
                ▲ Cargar mensajes antiguos
              </button>
              <div style={{ textAlign: "center", margin: "8px 0" }}>
                <span style={{ background: "#fff", padding: "4px 14px", borderRadius: 8, fontSize: 11, color: "#6B7280", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>Hoy</span>
              </div>
              {MOCK_MESSAGES.map(m => (
                <div key={m.id} style={{ alignSelf: m.sender === "agent" ? "flex-end" : "flex-start", maxWidth: "65%" }}>
                  <div style={{
                    background: m.sender === "agent" ? "#DCF8C6" : "#fff",
                    padding: "8px 12px",
                    borderRadius: m.sender === "agent" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#111827", lineHeight: 1.5 }}>{m.content}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 10, color: "#6B7280", textAlign: "right" }}>
                      {m.time} {m.sender === "client" && <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 4 }}>· Cliente</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ background: "#F0F0F0", padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
              <Paperclip size={18} color="#6B7280" style={{ cursor: "pointer" }} />
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Shift + enter for new line. Start with '/' to select a Canned Response."
                style={{ flex: 1, border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 13, outline: "none", background: "#fff" }}
              />
              <button style={{ background: "#166534", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Send size={16} color="#fff" />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Seleccioná una conversación</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mensajes Programados ──
function MensajesPage() {
  const [expandedDay, setExpandedDay] = useState(null);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>Mensajes Programados</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>2513 pendiente(s) · 95 enviado(s)</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #D1D5DB", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500, color: "#374151" }}>
          <Clock size={15} /> Actualizar
        </button>
      </div>

      {/* Seguimiento orgánico */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>Seguimiento orgánico (182)</h3>
        </div>
        <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 14, marginTop: 0 }}>Mensajes programados que aún no se han enviado</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {SEGUIMIENTOS.map(s => (
            <div key={s.id} style={{
              border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 20px",
              minWidth: 160, background: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>
                  {s.tipo === "hoy" ? "Hoy" : s.tipo === "mañana" ? "Mañana" : `mié, 3 jun`}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6B7280" }}>{s.mensajes} mensajes</p>
              </div>
              <Badge color={s.estado === "pendiente" ? "#F59E0B" : "#10B981"}>
                {s.estado === "pendiente" ? "Pendiente" : "Enviado"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Enviados */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>Enviados (95)</h3>
        </div>
        <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 14, marginTop: 0 }}>Mensajes que ya fueron enviados</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SEGUIMIENTOS_ENVIADOS.map((s, i) => (
            <div key={i}>
              <div
                onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                style={{
                  padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                  borderRadius: 8, background: expandedDay === i ? "#F9FAFB" : "transparent",
                  transition: "background 0.1s"
                }}
              >
                <ChevronRight size={14} color="#9CA3AF" style={{ transform: expandedDay === i ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                  {new Date(s.fecha).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span style={{ fontSize: 12, color: "#6B7280" }}>{s.mensajes} mensajes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Placeholder Pages ──
function PlaceholderPage({ title, subtitle }) {
  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ background: "#F9FAFB", borderRadius: 16, padding: "48px 64px", textAlign: "center", border: "1px solid #E5E7EB" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>{title}</h2>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#6B7280" }}>{subtitle || "Esta sección se desarrollará próximamente."}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [agentActive, setAgentActive] = useState(true);
  const isAdmin = true;

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage leads={leads} />;
      case "leads": return <LeadsPage leads={leads} setLeads={setLeads} columns={columns} setColumns={setColumns} agentActive={agentActive} setAgentActive={setAgentActive} isAdmin={isAdmin} />;
      case "chats": return <ChatsPage agentActive={agentActive} isAdmin={isAdmin} setAgentActive={setAgentActive} />;
      case "mensajes": return <MensajesPage />;
      case "propiedades": return <PlaceholderPage title="Propiedades" subtitle="Tablero Kanban de propiedades — próximamente" />;
      case "busquedas": return <PlaceholderPage title="Búsquedas" />;
      case "campanas": return <PlaceholderPage title="Campañas Activas" />;
      case "cotizaciones": return <PlaceholderPage title="Cotizaciones" />;
      case "documentacion": return <PlaceholderPage title="Documentación" />;
      default: return <DashboardPage leads={leads} />;
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; background: #F9FAFB; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
        input:focus, select:focus { border-color: #166534 !important; box-shadow: 0 0 0 2px rgba(22,101,52,0.1); }
        button { font-family: inherit; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB" }}>
        <Sidebar active={page} onNavigate={setPage} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} isAdmin={isAdmin} />
        <div style={{ flex: 1, overflow: "auto" }}>
          {renderPage()}
        </div>
      </div>
    </>
  );
}
