# Teleconsulta IPS - Frontend

Plataforma de telemedicina con videollamadas en tiempo real. Interfaz construida con React, Vite y Tailwind CSS.

## Stack Tecnologico

- **React 19** + React Router DOM
- **Vite 7** (build tool)
- **Tailwind CSS 4** (utility-first CSS)
- **Lucide React** (iconografia)
- **Day.js** (manejo de fechas y zonas horarias)
- **Socket.IO Client** (comunicacion en tiempo real)
- **WebRTC** (videollamadas peer-to-peer)
- **React Hot Toast** (notificaciones)
- **Axios** (cliente HTTP)

## Design System — "Modern Clinical Warmth"

Estetica inspirada en Apple Health: confianza, calidez y sofisticacion.

### Tipografia (Google Fonts)

| Uso | Fuente | Pesos |
|-----|--------|-------|
| Display / Headings | Bricolage Grotesque | 600, 700 |
| Body | Plus Jakarta Sans | 400, 500, 600 |
| Monospace (badges, codigos) | JetBrains Mono | 400, 500 |

### Paleta de Colores

| Variable | Valor | Uso |
|----------|-------|-----|
| `--color-primary` | `#0D9488` (teal-600) | Confianza medica, acciones principales |
| `--color-primary-dark` | `#0F766E` (teal-700) | Hover de primarios |
| `--color-primary-light` | `#14B8A6` (teal-500) | Acentos suaves |
| `--color-primary-50` | `#F0FDFA` (teal-50) | Fondos sutiles |
| `--color-accent` | `#F59E0B` (amber-500) | Calidez, CTAs prominentes |
| `--color-accent-dark` | `#D97706` (amber-600) | Hover de accent |
| `--color-bg` | `#FAF9F6` | Fondo general (warm ivory) |
| `--color-surface` | `#FFFFFF` | Tarjetas y superficies |
| `--color-text` | `#1A1A2E` | Texto principal (navy profundo) |
| `--color-text-secondary` | `#64748B` | Texto secundario |
| `--color-text-muted` | `#94A3B8` | Texto terciario/labels |
| `--color-success` | `#059669` | Estados exitosos |
| `--color-warning` | `#D97706` | Advertencias |
| `--color-error` | `#E11D48` | Errores, acciones destructivas |
| `--color-dark-bg` | `#0F172A` | Fondo salas de video |
| `--color-dark-surface` | `#1E293B` | Superficies dark theme |

### Sombras

Sombras calidas con tinte navy (rgba de `#1A1A2E`):

- `--shadow-sm` — Elementos sutiles (header, cards)
- `--shadow-md` — Elevacion media (dropdowns)
- `--shadow-lg` — Elevacion alta (modales, waiting room)
- `--shadow-xl` — Elevacion maxima (modales con blur)

### Border Radius

| Elemento | Valor |
|----------|-------|
| Cards | `16px` |
| Inputs | `10px` |
| Botones | `10px` (regulares), `9999px` (pills/badges) |
| Modales | `20px` |

### Animaciones

- **fadeInUp** — Entrada de elementos de pagina (400ms)
- **fadeIn** — Aparicion simple
- **pulse-dot** — Indicador pulsante (EN_SALA)
- **glow** — Efecto glow en conexion activa
- **float** — Flotacion sutil en iconos decorativos
- **signal-lost** — Parpadeo en pagina 404
- **Stagger** — Delay escalonado (.stagger-1 a .stagger-6, 60ms incrementos)

### Efectos

- `.glass` — Glassmorphism claro (backdrop-blur 12px, bg white/80)
- `.glass-dark` — Glassmorphism oscuro (backdrop-blur 12px, bg slate-900/80)

## Estructura del Proyecto

```
frontend/
  index.html              # Entry point + Google Fonts
  src/
    main.jsx              # React root
    App.jsx               # Router config
    index.css             # Design system (variables, keyframes, utilities)
    context/
      AuthContext.jsx     # Autenticacion global
    hooks/
      useAuth.js          # Hook de autenticacion
      useWebRTC.js        # Hook de WebRTC
    components/
      Layout.jsx          # Sidebar teal + header + outlet
      StatusBadge.jsx     # Badges con dot animado
      AppointmentForm.jsx # Formulario con secciones agrupadas
      AppointmentList.jsx # Tabla desktop + cards mobile
      VideoPlayer.jsx     # Reproductor de video con label glass
      VideoControls.jsx   # Controles circulares con glassmorphism
      PrivateRoute.jsx    # Ruta protegida con spinner branded
    pages/
      LoginPage.jsx       # Split layout (branding + form)
      DashboardPage.jsx   # Stats + filtros + lista
      CreateAppointmentPage.jsx  # Header descriptivo + form
      AppointmentDetailPage.jsx  # 2 columnas (paciente + cita)
      AdminUsersPage.jsx  # Tabla + modal con backdrop blur
      VideoRoomPage.jsx   # Sala profesional (dark theme, glassmorphism)
      PatientRoomPage.jsx # Sala paciente (waiting + in-call)
      NotFoundPage.jsx    # 404 con gradiente y animaciones CSS
    services/
      api.js              # Axios instance
      socket.js           # Socket.IO client
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de produccion
npm run build

# Preview del build
npm run preview
```

## Paginas

| Ruta | Componente | Descripcion |
|------|-----------|-------------|
| `/login` | LoginPage | Inicio de sesion (split layout) |
| `/` | DashboardPage | Agenda con stats y filtros |
| `/citas/nueva` | CreateAppointmentPage | Crear teleconsulta |
| `/citas/:id` | AppointmentDetailPage | Detalle con acciones |
| `/sala/:appointmentId` | VideoRoomPage | Sala del profesional |
| `/paciente/:token` | PatientRoomPage | Sala del paciente |
| `/usuarios` | AdminUsersPage | Gestion de usuarios (admin) |
| `*` | NotFoundPage | Pagina 404 |
