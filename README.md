# MediControl

Sistema de gestión médica (frontend SPA) construido con **Next.js 13** (App Router) y **TypeScript**. Permite administrar pacientes, citas, recetas médicas, facturación, usuarios y reportes.

> ⚠️ **Nota importante:** los datos se persisten en **Turso (libSQL/SQLite)** a través de API routes de Next.js (`app/api/`). Las contraseñas se guardan hasheadas con bcrypt. La sesión se guarda en localStorage (sin tokens JWT aún), por lo que conviene agregar sesiones seguras antes de producción.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 13.5 (App Router) + React 18 |
| Lenguaje | TypeScript 5.2 |
| Estilos | Tailwind CSS 3.3 + tailwindcss-animate |
| UI | shadcn/ui (Radix UI + componentes en `components/ui/`), lucide-react (iconos), sonner (notificaciones) |
| Formularios | react-hook-form + zod (validación) + @hookform/resolvers |
| Fechas | date-fns, react-day-picker |
| Gráficos | Recharts (reportes) |
| Base de datos | Turso (libSQL) — `@libsql/client` |
| Backend | API routes de Next.js (`app/api/`) |
| Generado con | Bolt (ver `.bolt/`) |

## Estructura del proyecto

```
app/                    # Páginas (App Router)
  page.tsx              # Login / landing
  appointments/         # Citas médicas (lista + nueva)
  calendar/             # Vista de calendario
  patients/             # Pacientes (lista + nuevo)
  prescriptions/        # Recetas médicas (lista + nueva)
  invoices/             # Facturación (lista + nueva)
  reports/              # Reportes y estadísticas (Recharts)
  users/                # Gestión de usuarios (lista + nuevo)
components/             # Componentes de la app
  login-form.tsx        # Formulario de inicio de sesión
  protected-route.tsx   # Protección de rutas por autenticación/rol
  appointment-form.tsx, patient-form.tsx, prescription-form.tsx,
  invoice-form.tsx, user-form.tsx
  calendar-view.tsx, navigation.tsx, stats-card.tsx
  ui/                   # Componentes shadcn/ui
contexts/
  auth-context.tsx      # Contexto de autenticación (login contra /api/auth/login)
hooks/
  use-patients.ts, use-appointments.ts, use-prescriptions.ts,
  use-invoices.ts, use-users.ts, use-toast.ts
lib/
  db.ts                 # Cliente Turso + esquema (creación y seed automáticos)
  rest.ts               # Fábrica genérica de handlers CRUD para las API routes
  api.ts                # Cliente HTTP usado por los hooks
  types.ts              # Modelos: User, Patient, Appointment, Prescription, Invoice
  utils.ts              # Utilidades (cn de shadcn)
app/api/                # Backend (route handlers)
  auth/login/           # POST login (verifica bcrypt)
  patients/, appointments/, prescriptions/, invoices/, users/
                        # GET listar / POST crear / [id]: GET, PATCH, DELETE
```

### Variables de entorno (`.env.local`)

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

El esquema y los usuarios por defecto se crean automáticamente en la primera consulta (`ensureDb()` en `lib/db.ts`).

## Módulos funcionales

- **Autenticación** — login simulado con roles (`admin`, `doctor`, `nurse`, `receptionist`) y protección de rutas. Usuarios por defecto:
  - `admin@medicontrol.com` / `admin123`
  - `doctor@medicontrol.com` / `doctor123`
- **Pacientes** — CRUD con datos personales, contacto de emergencia, historial médico e información de seguro.
- **Citas** — CRUD con estado (`scheduled`, `confirmed`, `completed`, `cancelled`), tipo, duración y vista de calendario.
- **Recetas** — recetas con múltiples medicamentos (dosis, frecuencia, duración) y diagnóstico.
- **Facturación** — facturas con ítems, subtotal, impuesto, total, estados de pago y fecha de vencimiento.
- **Usuarios** — administración de usuarios del sistema con roles y estado activo/inactivo (solo admin).
- **Reportes** — estadísticas y gráficos (Recharts) sobre los datos locales.

## Puesta en marcha

```bash
npm install   # o yarn
npm run dev   # desarrollo en http://localhost:3000

npm run build # build de producción
npm run start # servir build
npm run lint  # ESLint
```

## Rutas de la aplicación

| Ruta | Descripción |
|---|---|
| `/` | Login |
| `/patients`, `/patients/new` | Pacientes |
| `/appointments`, `/appointments/new` | Citas |
| `/calendar` | Calendario de citas |
| `/prescriptions`, `/prescriptions/new` | Recetas |
| `/invoices`, `/invoices/new` | Facturas |
| `/reports` | Reportes |
| `/users`, `/users/new` | Usuarios (admin) |

## Próximos pasos sugeridos

1. Sesiones seguras (JWT o cookies httpOnly) en lugar de guardar el usuario en localStorage.
2. Migración de datos existentes en localStorage del navegador (no se migran automáticamente).
3. Agregar tests automatizados (actualmente no hay suite de tests).
