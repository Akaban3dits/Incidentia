# Changelog


## [0.2.0] - 2025-09-14
### ✨ Added
- **Sidebar** con soporte responsivo:
  - Colapsable (`w-64` / `w-16`)
  - Menú hamburguesa para móvil
  - Overlay en móvil para cerrar al hacer click fuera
- **Navbar**:
  - Dropdown de usuario con perfil, configuración y logout
  - Badge de notificaciones con mejor posicionamiento
  - Soporte de cambio de tema con `ThemeToggle`
- **Tickets Dashboard**:
  - Tabs para documentos, comentarios y tareas
  - Subcomponentes: `TicketDocuments`, `TicketComments`, `TicketTasks`, `TicketSidebar`
  - Dialogs de acciones rápidas (`ReassignDialog`, `StatusDialog`, `PriorityDialog`)

### 🎨 Changed
- Ajustes de `Tailwind` en paddings, gaps y tamaños de fuente para mejorar legibilidad.
- Mejorada la responsividad de `TicketDetails` en vista móvil y desktop.
- Ajustado el diseño de botones en Sidebar (`Nuevo Ticket`, íconos centrados en modo colapsado).

### 🐛 Fixed
- Corregido espacio en blanco innecesario al lado izquierdo en móvil.
- Fix en `Badge` de notificaciones para que no desplace el icono de la campana.
- Se solucionó la advertencia de `ngrok` agregando `allowedHosts` en `vite.config.js`.

---

## [0.1.0] - 2025-09-10
### ✨ Added
- Primera versión del dashboard.
- Estructura base con `Sidebar`, `Navbar` y `TicketDetails`.
- Integración inicial con `shadcn/ui` (cards, buttons, badges, tabs, checkbox).
- Setup inicial de `tailwindcss` con configuración extendida de colores.
