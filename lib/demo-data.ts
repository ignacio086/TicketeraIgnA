export type User = {
  id: string
  name: string
  email: string
  password: string
  initials: string
  color: string
}

export type Company = {
  id: string
  name: string
  shortName: string
  system: string
  contacts: { id: string; name: string; email: string; role: string }[]
}

export type TicketStatus = "Nuevo" | "Abierto" | "En curso" | "Esperando cliente" | "Resuelto" | "Cerrado"
export type TicketPriority = "Baja" | "Normal" | "Alta" | "Crítica"

export type TicketMessage = {
  id: string
  kind: "customer" | "agent" | "internal" | "system"
  author: string
  authorEmail?: string
  body: string
  at: string
  attachments?: string[]
}

export type TimeEntry = {
  id: string
  user: string
  minutes: number
  note: string
  at: string
}

export type Ticket = {
  id: string
  number: number
  companyId: string
  contactId: string
  subject: string
  preview: string
  status: TicketStatus
  priority: TicketPriority
  assigneeId: string | null
  category: string
  environment: "PRD" | "TEST"
  system: string
  createdAt: string
  updatedAt: string
  sla: "ok" | "warning" | "overdue" | "paused"
  firstResponseMinutes?: number
  messages: TicketMessage[]
  timeEntries: TimeEntry[]
  tags: string[]
}

export const USERS: User[] = [
  {
    id: "u1",
    name: "Ignacio Gomez",
    email: "igomez@qruz.net",
    password: "Qruz2026!",
    initials: "IG",
    color: "#ff7a45",
  },
  {
    id: "u2",
    name: "Sebastian de la Cruz",
    email: "sdelacruz@qruz.net",
    password: "Qruz2026!",
    initials: "SC",
    color: "#5b7cfa",
  },
]

export const COMPANIES: Company[] = [
  {
    id: "c1",
    name: "Venoil S.A.",
    shortName: "Venoil",
    system: "SAP Business One HANA",
    contacts: [
      { id: "ct1", name: "Marina Roldán", email: "mroldan@venoil.com.ar", role: "Administración" },
      { id: "ct2", name: "Lucas Funes", email: "lfunes@venoil.com.ar", role: "Sistemas" },
    ],
  },
  {
    id: "c2",
    name: "Salamone S.A.",
    shortName: "Salamone",
    system: "SAP Business One HANA",
    contacts: [
      { id: "ct3", name: "Carolina Páez", email: "cpaez@salamone.com.ar", role: "Compras" },
      { id: "ct4", name: "Federico Martín", email: "fmartin@salamone.com.ar", role: "Sistemas" },
    ],
  },
  {
    id: "c3",
    name: "ACSA",
    shortName: "ACSA",
    system: "SAP Business One HANA",
    contacts: [
      { id: "ct5", name: "Paula Soria", email: "psoria@acsa.com.ar", role: "Finanzas" },
      { id: "ct6", name: "Matías Quiroga", email: "mquiroga@acsa.com.ar", role: "Infraestructura" },
    ],
  },
  {
    id: "c4",
    name: "Durox S.A.",
    shortName: "Durox",
    system: "SAP Business One HANA",
    contacts: [
      { id: "ct7", name: "Jésica Yacante", email: "jyacante@durox.com.ar", role: "Administración" },
      { id: "ct8", name: "Gabriel Navarro", email: "gnavarro@durox.com.ar", role: "Sistemas" },
    ],
  },
  {
    id: "c5",
    name: "Angaco S.A.",
    shortName: "Angaco",
    system: "SAP Business One HANA",
    contacts: [
      { id: "ct9", name: "Natalia Molina", email: "nmolina@angaco.com.ar", role: "Tesorería" },
      { id: "ct10", name: "Bruno Correa", email: "bcorrea@angaco.com.ar", role: "Operaciones" },
    ],
  },
]

export const CATEGORIES = ["SAP Business One", "Infraestructura", "Power BI", "Desarrollo", "Accesos"]

export const SEED_TICKETS: Ticket[] = [
  {
    id: "t1048",
    number: 1048,
    companyId: "c1",
    contactId: "ct1",
    subject: "Error al emitir factura electrónica",
    preview: "El documento quedó en estado NUEVO y no nos permite reintentar el envío.",
    status: "En curso",
    priority: "Crítica",
    assigneeId: "u1",
    category: "SAP Business One",
    environment: "PRD",
    system: "SAP B1 / Documentos electrónicos",
    createdAt: "2026-09-14T08:12:00-03:00",
    updatedAt: "2026-09-14T09:42:00-03:00",
    sla: "warning",
    firstResponseMinutes: 18,
    tags: ["facturación", "ARCA"],
    timeEntries: [
      { id: "te1", user: "Ignacio Gomez", minutes: 27, note: "Revisión del monitor de documentos electrónicos", at: "2026-09-14T09:10:00-03:00" },
      { id: "te2", user: "Ignacio Gomez", minutes: 18, note: "Validación de servicios y logs", at: "2026-09-14T09:38:00-03:00" },
    ],
    messages: [
      {
        id: "m1",
        kind: "customer",
        author: "Marina Roldán",
        authorEmail: "mroldan@venoil.com.ar",
        body: "Buen día, tenemos una factura que quedó en estado NUEVO en el monitor de documentos electrónicos. No permite cancelarla ni volver a enviarla. Adjunto captura del estado.",
        at: "2026-09-14T08:12:00-03:00",
        attachments: ["monitor-documentos.png"],
      },
      {
        id: "m2",
        kind: "agent",
        author: "Ignacio Gomez",
        authorEmail: "igomez@qruz.net",
        body: "Buen día Marina. Ya tomamos el caso y estamos revisando el servicio de documentos electrónicos. Les confirmamos apenas tengamos el diagnóstico.",
        at: "2026-09-14T08:30:00-03:00",
      },
      {
        id: "m3",
        kind: "internal",
        author: "Ignacio Gomez",
        body: "El documento no llegó a ERROR. Revisar si el servicio quedó bloqueado antes de modificar el estado manualmente.",
        at: "2026-09-14T09:02:00-03:00",
      },
    ],
  },
  {
    id: "t1047",
    number: 1047,
    companyId: "c4",
    contactId: "ct7",
    subject: "Adjunto no visible en Web Client",
    preview: "El archivo se carga, pero al volver a abrir el pedido el adjunto no aparece.",
    status: "Esperando cliente",
    priority: "Alta",
    assigneeId: "u2",
    category: "SAP Business One",
    environment: "TEST",
    system: "SAP B1 Web Client",
    createdAt: "2026-09-13T15:18:00-03:00",
    updatedAt: "2026-09-14T08:55:00-03:00",
    sla: "paused",
    firstResponseMinutes: 34,
    tags: ["web-client", "adjuntos"],
    timeEntries: [
      { id: "te3", user: "Sebastian de la Cruz", minutes: 62, note: "Pruebas en TST_STOCK y comparación de permisos", at: "2026-09-13T17:10:00-03:00" },
    ],
    messages: [
      { id: "m4", kind: "customer", author: "Jésica Yacante", authorEmail: "jyacante@durox.com.ar", body: "Al crear un pedido desde Web Client adjuntamos un PDF, pero al guardar y volver a abrirlo ya no aparece.", at: "2026-09-13T15:18:00-03:00", attachments: ["pedido-prueba.pdf"] },
      { id: "m5", kind: "agent", author: "Sebastian de la Cruz", authorEmail: "sdelacruz@qruz.net", body: "Realizamos pruebas en TST_STOCK y detectamos que ocurre con usuarios dentro del circuito de autorización. Necesitamos una última validación con el usuario fuera del circuito.", at: "2026-09-13T17:42:00-03:00" },
    ],
  },
  {
    id: "t1046",
    number: 1046,
    companyId: "c3",
    contactId: "ct5",
    subject: "Actualizar vencimiento de proveedores",
    preview: "Necesitamos actualizar el campo de vencimiento mediante DTW.",
    status: "Abierto",
    priority: "Normal",
    assigneeId: null,
    category: "SAP Business One",
    environment: "PRD",
    system: "SAP B1 / Datos maestros",
    createdAt: "2026-09-13T11:04:00-03:00",
    updatedAt: "2026-09-13T11:04:00-03:00",
    sla: "overdue",
    tags: ["DTW", "proveedores"],
    timeEntries: [],
    messages: [
      { id: "m6", kind: "customer", author: "Paula Soria", authorEmail: "psoria@acsa.com.ar", body: "Necesitamos completar para todos los proveedores la fecha de vencimiento al 31/12/2026. ¿Nos pueden indicar el formato correcto para DTW?", at: "2026-09-13T11:04:00-03:00", attachments: ["proveedores.xlsx"] },
    ],
  },
  {
    id: "t1045",
    number: 1045,
    companyId: "c2",
    contactId: "ct4",
    subject: "Power BI no solicita credenciales HANA",
    preview: "El conector trae información sin pedir usuario y luego rechaza las credenciales.",
    status: "En curso",
    priority: "Alta",
    assigneeId: "u1",
    category: "Power BI",
    environment: "PRD",
    system: "Power BI / HANA",
    createdAt: "2026-09-12T14:25:00-03:00",
    updatedAt: "2026-09-13T16:30:00-03:00",
    sla: "ok",
    firstResponseMinutes: 42,
    tags: ["ODBC", "HANA"],
    timeEntries: [{ id: "te4", user: "Ignacio Gomez", minutes: 49, note: "Revisión de origen de datos y caché de credenciales", at: "2026-09-13T16:20:00-03:00" }],
    messages: [
      { id: "m7", kind: "customer", author: "Federico Martín", authorEmail: "fmartin@salamone.com.ar", body: "Power BI conecta al servidor HANA pero no solicita usuario. Cuando editamos las credenciales dice que son incorrectas.", at: "2026-09-12T14:25:00-03:00" },
      { id: "m8", kind: "agent", author: "Ignacio Gomez", authorEmail: "igomez@qruz.net", body: "Estamos revisando las credenciales guardadas en la configuración del origen de datos y la versión del cliente HANA instalada.", at: "2026-09-12T15:07:00-03:00" },
    ],
  },
  {
    id: "t1044",
    number: 1044,
    companyId: "c5",
    contactId: "ct9",
    subject: "Consulta de cheques para cierre semanal",
    preview: "Solicitan listado de cheques desde viernes hasta jueves.",
    status: "Resuelto",
    priority: "Baja",
    assigneeId: "u2",
    category: "Desarrollo",
    environment: "PRD",
    system: "SAP B1 / Consultas",
    createdAt: "2026-09-10T10:20:00-03:00",
    updatedAt: "2026-09-11T12:44:00-03:00",
    sla: "ok",
    firstResponseMinutes: 25,
    tags: ["query", "cheques"],
    timeEntries: [{ id: "te5", user: "Sebastian de la Cruz", minutes: 76, note: "Desarrollo y validación de consulta", at: "2026-09-11T12:30:00-03:00" }],
    messages: [
      { id: "m9", kind: "customer", author: "Natalia Molina", authorEmail: "nmolina@angaco.com.ar", body: "Necesitamos un listado semanal de cheques que tome desde el viernes hasta el jueves siguiente.", at: "2026-09-10T10:20:00-03:00" },
      { id: "m10", kind: "agent", author: "Sebastian de la Cruz", authorEmail: "sdelacruz@qruz.net", body: "La consulta quedó disponible y fue validada con Tesorería. Dejamos el ticket como resuelto.", at: "2026-09-11T12:44:00-03:00" },
    ],
  },
]

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

export const companyFor = (id: string) => COMPANIES.find((company) => company.id === id)!
export const userFor = (id: string | null) => USERS.find((user) => user.id === id)

