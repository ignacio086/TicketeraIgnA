"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Activity, AlarmClock, ArrowLeft, BarChart3, BookOpen, Building2, Check,
  ChevronRight, CircleAlert, Clock3, FileText, Inbox, LayoutDashboard, LogOut,
  Mail, MessageSquareText, MoreHorizontal, Paperclip, Pause, Play, Plus,
  RotateCcw, Search, Send, Settings, ShieldCheck, Sparkles, Square, Tag,
  TicketCheck, Timer, UserRound, UsersRound, WandSparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/sonner"
import {
  CATEGORIES, COMPANIES, SEED_TICKETS, Ticket, TicketPriority, TicketStatus,
  USERS, companyFor, formatDateTime, userFor,
} from "@/lib/demo-data"

type View = "dashboard" | "tickets" | "companies" | "reports" | "knowledge"
type TicketFilter = "Todos" | "Míos" | "Sin asignar" | "Vencidos" | "Esperando cliente" | "Cerrados"
const STATUSES: TicketStatus[] = ["Nuevo", "Abierto", "En curso", "Esperando cliente", "Resuelto", "Cerrado"]
const PRIORITIES: TicketPriority[] = ["Baja", "Normal", "Alta", "Crítica"]
const navItems = [
  ["dashboard", "Resumen", LayoutDashboard], ["tickets", "Tickets", Inbox],
  ["companies", "Empresas", Building2], ["reports", "Reportes", BarChart3],
  ["knowledge", "Conocimiento", BookOpen],
] as const
const statusTone: Record<TicketStatus, string> = {
  Nuevo: "sky", Abierto: "indigo", "En curso": "amber",
  "Esperando cliente": "violet", Resuelto: "green", Cerrado: "gray",
}
const priorityTone: Record<TicketPriority, string> = { Baja: "gray", Normal: "sky", Alta: "orange", Crítica: "rose" }
const filters: TicketFilter[] = ["Todos", "Míos", "Sin asignar", "Vencidos", "Esperando cliente", "Cerrados"]

function loadTickets() {
  if (typeof window === "undefined") return SEED_TICKETS
  try { return JSON.parse(localStorage.getItem("qruz-demo-tickets") || "") as Ticket[] } catch { return SEED_TICKETS }
}
function duration(seconds: number) {
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((v) => String(v).padStart(2, "0")).join(":")
}
const totalMinutes = (ticket: Ticket) => ticket.timeEntries.reduce((sum, entry) => sum + entry.minutes, 0)

function Login({ onLogin }: { onLogin: (id: string) => void }) {
  const [email, setEmail] = useState("igomez@qruz.net")
  const [password, setPassword] = useState("Qruz2026!")
  const [error, setError] = useState("")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const user = USERS.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password)
    if (!user) return setError("El correo o la contraseña no coinciden con un usuario de la demo.")
    setError(""); onLogin(user.id)
  }
  return <main className="login-shell">
    <section className="login-form-panel"><form onSubmit={submit} className="login-card">
      <div className="login-identity">
        <Image className="login-company-logo" src="/qruz-logo.png" alt="Qruz IT Solutions" width={161} height={66} priority />
        <h1>IgnA Tickets</h1>
      </div>
      <div className="form-stack">
        <div className="field-stack"><Label htmlFor="email">Correo electrónico</Label><div className="input-with-icon"><Mail /><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
        <div className="field-stack"><Label htmlFor="password">Contraseña</Label><div className="input-with-icon"><ShieldCheck /><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div></div>
        {error && <div className="login-error"><CircleAlert />{error}</div>}
        <Button className="login-button" type="submit">Ingresar <ChevronRight /></Button>
      </div>
    </form></section>
  </main>
}

function AppSidebar({ view, changeView, currentUserId, tickets, logout }: { view: View; changeView: (v: View) => void; currentUserId: string; tickets: Ticket[]; logout: () => void }) {
  const user = userFor(currentUserId)!
  const open = tickets.filter((t) => !["Resuelto", "Cerrado"].includes(t.status)).length
  return <Sidebar collapsible="icon" className="app-sidebar">
    <SidebarHeader><div className="app-brand"><Image src="/qruz-logo.png" alt="Qruz IT Solutions" width={161} height={66} priority /><span className="brand-name">IgnA Tickets</span></div></SidebarHeader>
    <SidebarContent><SidebarGroup><SidebarGroupContent><SidebarMenu>{navItems.map(([id, label, Icon]) => <SidebarMenuItem key={id}><SidebarMenuButton tooltip={label} isActive={view === id} onClick={() => changeView(id)}><Icon /><span>{label}</span>{id === "tickets" && <span className="nav-count">{open}</span>}</SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup><SidebarGroup className="sidebar-bottom-link"><SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip="Configuración" onClick={() => toast.info("Disponible en la segunda entrega")}><Settings /><span>Configuración</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
    <SidebarFooter><div className="user-card"><Avatar className="size-9"><AvatarFallback style={{ background: user.color }}>{user.initials}</AvatarFallback></Avatar><div className="user-card-copy"><strong>{user.name}</strong><span>{user.email}</span></div><Button variant="ghost" size="icon-sm" onClick={logout}><LogOut /></Button></div></SidebarFooter>
  </Sidebar>
}

function AppHeader({ title, search, setSearch, onNew }: { title: string; search: string; setSearch: (v: string) => void; onNew: () => void }) {
  return <header className="app-header"><div className="header-title"><SidebarTrigger /><div><h1>{title}</h1><span>14 de septiembre de 2026</span></div></div><div className="header-actions"><div className="global-search"><Search /><Input placeholder="Buscar tickets o clientes…" value={search} onChange={(e) => setSearch(e.target.value)} /><kbd>⌘ K</kbd></div><Button className="primary-action" onClick={onNew}><Plus /> Nuevo ticket</Button></div></header>
}

function SlaPill({ value }: { value: Ticket["sla"] }) {
  const text = value === "overdue" ? "SLA vencido" : value === "warning" ? "SLA próximo" : value === "paused" ? "SLA pausado" : "Dentro de SLA"
  return <span className={`sla-pill ${value}`}><i />{text}</span>
}

function TicketTable({ tickets, onOpen }: { tickets: Ticket[]; onOpen: (id: string) => void }) {
  if (!tickets.length) return <div className="empty-state"><Search /><h3>No encontramos tickets</h3><p>Probá con otra búsqueda o cambiá los filtros.</p></div>
  return <div className="ticket-table-wrap"><table className="ticket-table"><thead><tr><th>Ticket</th><th>Cliente</th><th>Estado</th><th>Prioridad</th><th>Responsable</th><th>SLA</th><th>Actividad</th></tr></thead><tbody>{tickets.map((ticket) => {
    const company = companyFor(ticket.companyId), assignee = userFor(ticket.assigneeId)
    return <tr key={ticket.id} onClick={() => onOpen(ticket.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen(ticket.id)}>
      <td><div className="ticket-subject"><span>#{ticket.number}</span><strong>{ticket.subject}</strong><small>{ticket.preview}</small></div></td>
      <td><div className="company-cell"><span className="company-logo">{company.shortName.slice(0, 2).toUpperCase()}</span><div><b>{company.shortName}</b><small>{company.contacts.find((c) => c.id === ticket.contactId)?.name}</small></div></div></td>
      <td><Badge variant="outline" className={`status-${statusTone[ticket.status]}`}>{ticket.status}</Badge></td>
      <td><span className={`priority ${priorityTone[ticket.priority]}`}><i />{ticket.priority}</span></td>
      <td>{assignee ? <div className="assignee-cell"><Avatar className="size-7"><AvatarFallback style={{ background: assignee.color }}>{assignee.initials}</AvatarFallback></Avatar><span>{assignee.name.split(" ")[0]}</span></div> : <span className="unassigned">Sin asignar</span>}</td>
      <td><SlaPill value={ticket.sla} /></td><td><span className="date-cell">{formatDateTime(ticket.updatedAt)}</span><ChevronRight className="row-chevron" /></td>
    </tr>
  })}</tbody></table></div>
}

function Dashboard({ tickets, userId, onOpen, goTickets }: { tickets: Ticket[]; userId: string; onOpen: (id: string) => void; goTickets: () => void }) {
  const active = tickets.filter((t) => !["Resuelto", "Cerrado"].includes(t.status))
  const mine = active.filter((t) => t.assigneeId === userId), unassigned = active.filter((t) => !t.assigneeId)
  const overdue = active.filter((t) => t.sla === "overdue"), waiting = active.filter((t) => t.status === "Esperando cliente")
  const recent = [...tickets].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 4)
  const stats = [["Mis tickets", mine.length, "Asignados a vos", Inbox, "navy"], ["SLA vencido", overdue.length, "Requiere atención", AlarmClock, "orange"], ["Sin asignar", unassigned.length, "En la cola del equipo", UsersRound, "blue"], ["Esperando cliente", waiting.length, "SLA pausado", Pause, "purple"]] as const
  return <div className="page-stack"><section className="welcome-row"><div><span className="eyebrow dark">Bandeja operativa</span><h2>Buen día, {userFor(userId)?.name.split(" ")[0]}</h2><p>Tenés {mine.length} tickets activos. Hay {unassigned.length} sin asignar en la cola del equipo.</p></div><SlaPill value={overdue.length ? "overdue" : "ok"} /></section>
    <section className="stats-grid">{stats.map(([label, count, hint, Icon, color]) => <button className="stat-card" key={label} onClick={goTickets}><span className={`stat-icon ${color}`}><Icon /></span><div><span>{label}</span><strong>{count}</strong><small>{hint}</small></div><ChevronRight /></button>)}</section>
    <div className="dashboard-grid"><section className="panel recent-panel"><div className="panel-heading"><div><h3>Actividad reciente</h3><p>Los últimos tickets actualizados</p></div><Button variant="ghost" onClick={goTickets}>Ver todos <ChevronRight /></Button></div><TicketTable tickets={recent} onOpen={onOpen} /></section>
      <aside className="dashboard-side"><section className="panel workload-panel"><div className="panel-heading"><div><h3>Carga del equipo</h3><p>Tickets activos asignados</p></div></div>{USERS.map((u) => { const amount = active.filter((t) => t.assigneeId === u.id).length; return <div className="workload-row" key={u.id}><Avatar className="size-9"><AvatarFallback style={{ background: u.color }}>{u.initials}</AvatarFallback></Avatar><div><strong>{u.name}</strong><span><i style={{ width: `${Math.max(18, amount * 25)}%` }} /></span></div><b>{amount}</b></div> })}<div className="workload-row"><span className="queue-avatar"><Inbox /></span><div><strong>Sin asignar</strong><span><i className="queue-bar" style={{ width: `${Math.max(18, unassigned.length * 25)}%` }} /></span></div><b>{unassigned.length}</b></div></section>
        <section className="panel pulse-panel"><div className="pulse-top"><span className="stat-icon green"><Activity /></span><div><strong>Tiempo registrado hoy</strong><span>Equipo de soporte</span></div></div><b>2h 47m</b><div className="mini-bars">{[38,62,48,80,68,92,55].map((h, i) => <span key={i} className={i === 5 ? "active" : ""} style={{ height: `${h}%` }} />)}</div><small><i /> 18% más que ayer</small></section></aside>
    </div></div>
}

function TicketsView({ tickets, userId, search, onOpen }: { tickets: Ticket[]; userId: string; search: string; onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState<TicketFilter>("Todos"), [status, setStatus] = useState("Todos"), [priority, setPriority] = useState("Todas")
  const visible = useMemo(() => tickets.filter((t) => {
    const haystack = `${t.number} ${t.subject} ${t.preview} ${companyFor(t.companyId).name}`.toLowerCase()
    return (!search || haystack.includes(search.toLowerCase())) &&
      (filter !== "Míos" || t.assigneeId === userId) && (filter !== "Sin asignar" || !t.assigneeId) &&
      (filter !== "Vencidos" || t.sla === "overdue") && (filter !== "Esperando cliente" || t.status === "Esperando cliente") &&
      (filter !== "Cerrados" || ["Resuelto", "Cerrado"].includes(t.status)) && (status === "Todos" || t.status === status) && (priority === "Todas" || t.priority === priority)
  }), [tickets, userId, search, filter, status, priority])
  return <div className="page-stack"><div className="list-top"><div><h2>Todos los tickets</h2><p>{visible.length} resultados · datos de demostración</p></div><div className="filter-selects"><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Todos">Todos los estados</SelectItem>{STATUSES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select><Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Todas">Todas las prioridades</SelectItem>{PRIORITIES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div></div>
    <div className="filter-tabs">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}{item === "Sin asignar" && <span>{tickets.filter((t) => !t.assigneeId).length}</span>}</button>)}</div><section className="panel"><TicketTable tickets={visible} onOpen={onOpen} /></section></div>
}

function CompaniesView({ tickets, search, onOpen }: { tickets: Ticket[]; search: string; onOpen: (id: string) => void }) {
  const visible = COMPANIES.filter((c) => `${c.name} ${c.contacts.map((x) => x.name).join(" ")}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="page-stack"><div className="list-top"><div><h2>Empresas y contactos</h2><p>{COMPANIES.length} clientes activos · {COMPANIES.reduce((n, c) => n + c.contacts.length, 0)} contactos</p></div></div><section className="company-grid">{visible.map((company) => { const all = tickets.filter((t) => t.companyId === company.id), open = all.filter((t) => !["Resuelto", "Cerrado"].includes(t.status)); return <article className="company-card" key={company.id}><div className="company-card-head"><span className="large-company-logo">{company.shortName.slice(0, 2).toUpperCase()}</span><div><h3>{company.name}</h3><p>{company.system}</p></div><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></div><div className="company-metrics"><div><span>Abiertos</span><b>{open.length}</b></div><div><span>Históricos</span><b>{all.length}</b></div><div><span>Tiempo</span><b>{all.reduce((n, t) => n + totalMinutes(t), 0)}m</b></div></div><div className="contact-list">{company.contacts.map((c) => <div key={c.id}><span className="contact-avatar">{c.name.split(" ").map((p) => p[0]).join("")}</span><div><strong>{c.name}</strong><small>{c.role} · {c.email}</small></div></div>)}</div>{open.length > 0 && <button className="company-open-ticket" onClick={() => onOpen(open[0].id)}>Ver ticket activo <ChevronRight /></button>}</article> })}</section></div>
}

function ReportsView({ tickets }: { tickets: Ticket[] }) {
  const rows = COMPANIES.map((c) => ({ name: c.shortName, minutes: tickets.filter((t) => t.companyId === c.id).reduce((n, t) => n + totalMinutes(t), 0) })), max = Math.max(...rows.map((r) => r.minutes), 1)
  return <div className="page-stack"><div className="list-top"><div><h2>Reportes</h2><p>Vista ejecutiva basada en los datos de demostración</p></div><Button variant="outline" onClick={() => toast.info("La exportación se conecta en la segunda entrega")}><FileText /> Exportar</Button></div><section className="report-kpis">{[["Primera respuesta promedio","29 min","↓ 12% este mes"],["Resolución promedio","6h 18m","↓ 8% este mes"],["Cumplimiento SLA","92%","↑ 4 puntos"],["Horas registradas","14h 32m","Septiembre 2026"]].map(([a,b,c]) => <div key={a}><span>{a}</span><b>{b}</b><small>{c}</small></div>)}</section><div className="report-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h3>Tiempo por cliente</h3><p>Minutos registrados en tickets</p></div></div><div className="horizontal-chart">{rows.map((row) => <div className="bar-row" key={row.name}><span>{row.name}</span><div><i style={{ width: `${Math.max(6, row.minutes / max * 100)}%` }} /></div><b>{row.minutes}m</b></div>)}</div></section><section className="panel category-panel"><div className="panel-heading"><div><h3>Tickets por categoría</h3><p>Distribución actual</p></div></div>{CATEGORIES.map((c, i) => <div className="category-row" key={c}><i className={`dot-${i}`} /><span>{c}</span><b>{tickets.filter((t) => t.category === c).length}</b></div>)}</section></div></div>
}

function KnowledgeView() {
  const articles = [["SAP Business One","Adjuntos en Web Client y circuitos de autorización"],["Infraestructura","Configuración de ODBC HANA para terceros"],["Power BI","Limpieza de credenciales guardadas del origen HANA"]]
  return <div className="page-stack"><div className="list-top"><div><h2>Base de conocimiento</h2><p>Procedimientos internos para resolver casos con más rapidez</p></div><Button onClick={() => toast.info("Editor disponible en la versión completa")}><Plus /> Nuevo artículo</Button></div><section className="panel knowledge-list">{articles.map(([cat, title]) => <button key={title} onClick={() => toast.info("Vista de artículo simulada")}><span className="knowledge-icon"><BookOpen /></span><div><Badge variant="outline">{cat}</Badge><h3>{title}</h3><p>Actualizado recientemente</p></div><ChevronRight /></button>)}</section></div>
}

function TicketDetail({ ticket, userId, update, back }: { ticket: Ticket; userId: string; update: (t: Ticket) => void; back: () => void }) {
  const company = companyFor(ticket.companyId), contact = company.contacts.find((c) => c.id === ticket.contactId)!
  const [kind, setKind] = useState<"reply" | "note">("reply"), [message, setMessage] = useState("")
  const [running, setRunning] = useState(false), [elapsed, setElapsed] = useState(0)
  const [aiOpen, setAiOpen] = useState(false), [includeFiles, setIncludeFiles] = useState(false), [aiResult, setAiResult] = useState(false)
  const files = [...new Set(ticket.messages.flatMap((m) => m.attachments || []))]
  useEffect(() => { if (!running) return; const id = setInterval(() => setElapsed((v) => v + 1), 1000); return () => clearInterval(id) }, [running])
  const change = <K extends keyof Ticket>(key: K, value: Ticket[K]) => update({ ...ticket, [key]: value, updatedAt: new Date().toISOString(), messages: [...ticket.messages, { id: `m-${Date.now()}`, kind: "system", author: "Sistema", body: `${userFor(userId)?.name} actualizó ${key === "status" ? "el estado" : key === "priority" ? "la prioridad" : "el responsable"}.`, at: new Date().toISOString() }] })
  const send = () => { if (!message.trim()) return; const u = userFor(userId)!; update({ ...ticket, status: kind === "reply" && ticket.status === "Nuevo" ? "Abierto" : ticket.status, updatedAt: new Date().toISOString(), messages: [...ticket.messages, { id: `m-${Date.now()}`, kind: kind === "reply" ? "agent" : "internal", author: u.name, authorEmail: u.email, body: message.trim(), at: new Date().toISOString() }] }); setMessage(""); toast.success(kind === "reply" ? "Respuesta agregada" : "Nota interna guardada") }
  const stop = () => { const minutes = Math.max(1, Math.round(elapsed / 60)); setRunning(false); setElapsed(0); update({ ...ticket, timeEntries: [...ticket.timeEntries, { id: `te-${Date.now()}`, user: userFor(userId)!.name, minutes, note: "Trabajo registrado desde el cronómetro", at: new Date().toISOString() }] }); toast.success(`${minutes} minuto${minutes === 1 ? "" : "s"} registrado${minutes === 1 ? "" : "s"}`) }
  return <div className="ticket-detail-page"><div className="detail-topbar"><button onClick={back}><ArrowLeft /> Volver a tickets</button><div><SlaPill value={ticket.sla} /><span>Actualizado {formatDateTime(ticket.updatedAt)}</span></div></div>
    <div className="detail-heading"><div><div className="ticket-number-row"><span>Ticket #{ticket.number}</span>{ticket.tags.map((t) => <Badge variant="outline" key={t}><Tag />{t}</Badge>)}</div><h2>{ticket.subject}</h2><p>{company.name} · {contact.name} · {contact.email}</p></div><Button variant="outline" className="ai-button" onClick={() => { setAiResult(false); setAiOpen(true) }}><WandSparkles /> Analizar con IA</Button></div>
    <div className="detail-layout"><section className="conversation-panel"><Tabs defaultValue="conversation"><TabsList variant="line" className="conversation-tabs"><TabsTrigger value="conversation">Conversación <span>{ticket.messages.filter((m) => m.kind !== "system").length}</span></TabsTrigger><TabsTrigger value="history">Historial <span>{ticket.messages.filter((m) => m.kind === "system").length + 3}</span></TabsTrigger><TabsTrigger value="time">Tiempos <span>{totalMinutes(ticket)}m</span></TabsTrigger></TabsList>
      <TabsContent value="conversation"><div className="conversation-stream">{ticket.messages.filter((m) => m.kind !== "system").map((m) => <article className={`message-card ${m.kind}`} key={m.id}><div className="message-avatar">{m.kind === "internal" ? <MessageSquareText /> : m.author.split(" ").map((p) => p[0]).slice(0,2).join("")}</div><div className="message-body"><div className="message-meta"><div><strong>{m.author}</strong><span>{m.kind === "customer" ? "Cliente" : m.kind === "internal" ? "Nota interna" : "Equipo IgnA"}</span></div><time>{formatDateTime(m.at)}</time></div><p>{m.body}</p>{m.attachments?.map((a) => <button className="attachment-chip" key={a} onClick={() => toast.info("Adjunto simulado: " + a)}><Paperclip />{a}<span>Ver</span></button>)}</div></article>)}</div>
        <div className={`composer ${kind}`}><div className="composer-switch"><button className={kind === "reply" ? "active" : ""} onClick={() => setKind("reply")}><Mail /> Respuesta al cliente</button><button className={kind === "note" ? "active" : ""} onClick={() => setKind("note")}><MessageSquareText /> Nota interna</button></div><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={kind === "reply" ? `Responder a ${contact.name}…` : "Escribir una nota que solo verá el equipo…"} /><div className="composer-actions"><div><Button variant="ghost" size="sm" onClick={() => toast.info("El archivo no sale de esta demo")}><Paperclip /> Adjuntar</Button><Button variant="ghost" size="sm" onClick={() => setMessage("Buen día, ya estamos revisando el caso. Les confirmamos apenas tengamos novedades.")}><Sparkles /> Respuesta rápida</Button></div><Button onClick={send} disabled={!message.trim()}>{kind === "reply" ? <Send /> : <Check />}{kind === "reply" ? "Agregar respuesta" : "Guardar nota"}</Button></div></div></TabsContent>
      <TabsContent value="history"><div className="history-list"><div><span><TicketCheck /></span><p><b>Ticket creado</b><small>{contact.name} envió el correo inicial.</small></p><time>{formatDateTime(ticket.createdAt)}</time></div><div><span><UserRound /></span><p><b>Asignación actual</b><small>{userFor(ticket.assigneeId)?.name || "Sin asignar"}</small></p><time>{formatDateTime(ticket.updatedAt)}</time></div><div><span><Activity /></span><p><b>Estado actual</b><small>{ticket.status} · Prioridad {ticket.priority.toLowerCase()}</small></p><time>{formatDateTime(ticket.updatedAt)}</time></div>{ticket.messages.filter((m) => m.kind === "system").map((m) => <div key={m.id}><span><Activity /></span><p><b>Cambio registrado</b><small>{m.body}</small></p><time>{formatDateTime(m.at)}</time></div>)}</div></TabsContent>
      <TabsContent value="time"><div className="time-summary"><div><span>Tiempo total</span><b>{Math.floor(totalMinutes(ticket)/60)}h {totalMinutes(ticket)%60}m</b></div><Button variant="outline" onClick={() => toast.info("Carga manual disponible en la versión completa")}><Plus /> Agregar tiempo manual</Button></div><div className="time-entry-list">{ticket.timeEntries.length ? ticket.timeEntries.map((e) => <div key={e.id}><span className="time-entry-icon"><Clock3 /></span><div><b>{e.note}</b><small>{e.user} · {formatDateTime(e.at)}</small></div><strong>{e.minutes}m</strong></div>) : <div className="empty-inline"><Timer />Todavía no hay tiempo registrado.</div>}</div></TabsContent>
    </Tabs></section>
      <aside className="ticket-sidebar"><section className="detail-card"><h3>Detalles</h3><div className="detail-field"><Label>Estado</Label><Select value={ticket.status} onValueChange={(v) => change("status", v as TicketStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((v) => <SelectItem value={v} key={v}>{v}</SelectItem>)}</SelectContent></Select></div><div className="detail-field"><Label>Prioridad</Label><Select value={ticket.priority} onValueChange={(v) => change("priority", v as TicketPriority)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIORITIES.map((v) => <SelectItem value={v} key={v}>{v}</SelectItem>)}</SelectContent></Select></div><div className="detail-field"><Label>Responsable</Label><Select value={ticket.assigneeId || "none"} onValueChange={(v) => change("assigneeId", v === "none" ? null : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sin asignar</SelectItem>{USERS.map((u) => <SelectItem value={u.id} key={u.id}>{u.name}</SelectItem>)}</SelectContent></Select></div><div className="detail-field"><Label>Categoría</Label><span>{ticket.category}</span></div><div className="detail-field"><Label>Sistema</Label><span>{ticket.system}</span></div><div className="detail-field"><Label>Ambiente</Label><Badge variant="outline">{ticket.environment}</Badge></div></section>
        <section className={`timer-card ${running ? "running" : ""}`}><div className="timer-head"><span><Timer /></span><div><h3>Tiempo de trabajo</h3><p>{running ? "Cronómetro en curso" : `${totalMinutes(ticket)} minutos registrados`}</p></div></div><strong className="timer-display">{duration(elapsed)}</strong>{running ? <Button variant="destructive" onClick={stop}><Square /> Detener y guardar</Button> : <Button onClick={() => setRunning(true)}><Play /> Iniciar cronómetro</Button>}</section>
        <section className="detail-card contact-card"><h3>Contacto</h3><div className="contact-summary"><span>{contact.name.split(" ").map((p) => p[0]).join("")}</span><div><b>{contact.name}</b><small>{contact.role}</small></div></div><a href={`mailto:${contact.email}`}><Mail />{contact.email}</a><div className="company-link"><Building2 /><span><b>{company.name}</b><small>{company.system}</small></span></div></section></aside>
    </div>
    <Dialog open={aiOpen} onOpenChange={setAiOpen}><DialogContent className="ai-dialog"><DialogHeader><div className="ai-title-icon"><Sparkles /></div><DialogTitle>Analizar ticket con IA</DialogTitle><DialogDescription>Esta primera entrega simula el análisis. Ningún dato sale de tu computadora.</DialogDescription></DialogHeader>{!aiResult ? <><div className="ai-context"><h4>Contexto a incluir</h4><label><Checkbox checked disabled /><span><b>Conversación completa</b><small>{ticket.messages.filter((m) => m.kind !== "system").length} mensajes</small></span></label><label><Checkbox checked disabled /><span><b>Datos del ticket y empresa</b><small>{company.name} · {ticket.system}</small></span></label><label><Checkbox checked={includeFiles} onCheckedChange={(v) => setIncludeFiles(Boolean(v))} /><span><b>Adjuntos</b><small>{files.length ? files.join(", ") : "No hay adjuntos"}</small></span></label></div><div className="privacy-note"><ShieldCheck /><p><b>Control de privacidad</b><span>Los adjuntos se incluyen solamente si marcás la opción.</span></p></div><DialogFooter><Button variant="outline" onClick={() => setAiOpen(false)}>Cancelar</Button><Button className="ai-primary" onClick={() => setAiResult(true)}><WandSparkles /> Analizar ticket</Button></DialogFooter></> : <><div className="ai-result"><div><span>Posible causa</span><p>El proceso parece haberse detenido antes de recibir una respuesta del servicio. Conviene confirmar el estado del servicio y revisar los logs antes de modificar el documento.</p></div><div><span>Sugerencia de resolución</span><ol><li>Verificar que el servicio relacionado esté iniciado.</li><li>Revisar el log del momento del envío.</li><li>Validar si el documento tiene identificador fiscal.</li><li>Si no fue transmitido, llevarlo a error por el procedimiento soportado y reintentar.</li></ol></div><div><span>Información faltante</span><p>Versión exacta del componente y mensaje completo del log.</p></div></div><DialogFooter><Button variant="outline" onClick={() => toast.success("Sugerencia copiada")}>Copiar</Button><Button className="ai-primary" onClick={() => { setMessage("Buen día, vamos a validar el servicio relacionado, los logs y el identificador fiscal antes de realizar un nuevo intento. Les confirmamos el resultado apenas finalice la revisión."); setKind("reply"); setAiOpen(false) }}>Usar como respuesta</Button></DialogFooter></>}</DialogContent></Dialog>
  </div>
}

function NewTicketDialog({ open, setOpen, create }: { open: boolean; setOpen: (v: boolean) => void; create: (t: Ticket) => void }) {
  const [companyId, setCompanyId] = useState(COMPANIES[0].id), [subject, setSubject] = useState(""), [priority, setPriority] = useState<TicketPriority>("Normal"), [description, setDescription] = useState("")
  const company = companyFor(companyId)
  const save = () => { if (!subject.trim() || !description.trim()) return; const now = new Date().toISOString(); create({ id: `t-${Date.now()}`, number: 1049 + Math.floor(Math.random()*30), companyId, contactId: company.contacts[0].id, subject: subject.trim(), preview: description.trim(), status: "Nuevo", priority, assigneeId: null, category: "SAP Business One", environment: "PRD", system: "SAP B1", createdAt: now, updatedAt: now, sla: "ok", tags: [], timeEntries: [], messages: [{ id: `m-${Date.now()}`, kind: "customer", author: company.contacts[0].name, authorEmail: company.contacts[0].email, body: description.trim(), at: now }] }); setSubject(""); setDescription(""); setOpen(false) }
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Crear ticket</DialogTitle><DialogDescription>Se guarda localmente y no se envía ningún correo.</DialogDescription></DialogHeader><div className="new-ticket-form"><div className="detail-field"><Label>Empresa</Label><Select value={companyId} onValueChange={setCompanyId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMPANIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div><div className="detail-field"><Label>Contacto</Label><Input value={company.contacts[0].name} disabled /></div><div className="detail-field"><Label>Asunto</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Resumen del problema" /></div><div className="detail-field"><Label>Prioridad</Label><Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div><div className="detail-field"><Label>Descripción</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalle del pedido o inconveniente…" /></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save} disabled={!subject.trim() || !description.trim()}><Plus /> Crear ticket</Button></DialogFooter></DialogContent></Dialog>
}

export default function Home() {
  const [ready, setReady] = useState(false), [userId, setUserId] = useState<string | null>(null), [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS)
  const [view, setView] = useState<View>("dashboard"), [selectedId, setSelectedId] = useState<string | null>(null), [search, setSearch] = useState(""), [newOpen, setNewOpen] = useState(false)
  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (!active) return
      setTickets(loadTickets())
      setUserId(localStorage.getItem("qruz-demo-user"))
      setReady(true)
    })
    return () => { active = false }
  }, [])
  useEffect(() => { if (ready) localStorage.setItem("qruz-demo-tickets", JSON.stringify(tickets)) }, [tickets, ready])
  const login = (id: string) => { localStorage.setItem("qruz-demo-user", id); setUserId(id) }, logout = () => { localStorage.removeItem("qruz-demo-user"); setUserId(null) }
  const update = (ticket: Ticket) => setTickets((all) => all.map((t) => t.id === ticket.id ? ticket : t))
  const openTicket = (id: string) => { setSelectedId(id); setView("tickets") }
  const reset = () => { setTickets(SEED_TICKETS); setSelectedId(null); setView("dashboard"); toast.success("Datos de demostración restaurados") }
  if (!ready) return <div className="app-loading"><Image src="/qruz-logo.png" alt="Qruz IT Solutions" width={161} height={66} priority /></div>
  if (!userId || !userFor(userId)) return <><Login onLogin={login} /><Toaster richColors position="top-right" /></>
  const selected = tickets.find((t) => t.id === selectedId), titles: Record<View,string> = { dashboard: "Resumen", tickets: "Tickets", companies: "Empresas", reports: "Reportes", knowledge: "Base de conocimiento" }
  return <SidebarProvider><AppSidebar view={view} changeView={(v) => { setView(v); setSelectedId(null) }} currentUserId={userId} tickets={tickets} logout={logout} /><SidebarInset className="app-main">{!selected && <AppHeader title={titles[view]} search={search} setSearch={setSearch} onNew={() => setNewOpen(true)} />}<div className={selected ? "detail-content" : "app-content"}>{selected ? <TicketDetail ticket={selected} userId={userId} update={update} back={() => setSelectedId(null)} /> : view === "dashboard" ? <Dashboard tickets={tickets} userId={userId} onOpen={openTicket} goTickets={() => setView("tickets")} /> : view === "tickets" ? <TicketsView tickets={tickets} userId={userId} search={search} onOpen={openTicket} /> : view === "companies" ? <CompaniesView tickets={tickets} search={search} onOpen={openTicket} /> : view === "reports" ? <ReportsView tickets={tickets} /> : <KnowledgeView />}</div>{!selected && <button className="reset-demo" onClick={reset}><RotateCcw /> Restablecer demo</button>}</SidebarInset><NewTicketDialog open={newOpen} setOpen={setNewOpen} create={(ticket) => { setTickets((all) => [ticket, ...all]); setSelectedId(ticket.id); toast.success("Ticket creado") }} /><Toaster richColors position="top-right" /></SidebarProvider>
}
