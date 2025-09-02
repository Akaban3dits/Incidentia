# Changelog

## [0.1.0] - 2025-09-01
### Added
- feat(tickets): CRUD con includes y cierre/reapertura automática (`closed_at`).
- feat(status-history): modelo + service (`logChange`) para auditar cambios de estado.
- feat(notifications): modelo N:M (`Notification`/`NotificationUser`) + service y disparadores:
  - ticket creado (admins del depto/Sistemas),
  - cambio de encargado (notifica al nuevo),
  - prioridad crítica (admins depto + Sistemas + encargado),
  - reapertura/cierre,
  - cambio de departamento,
  - nuevo comentario/adjunto.
- feat(comments): comentarios en hilo (self-ref), CRUD y validaciones.
- feat(attachments): adjunto ligado a ticket **o** comentario (consejo de CHECK de exclusión).
- feat(tasks): campo `completed_at` y CRUD.
- feat(device/device-type/department): services y listados con búsqueda/orden/paginación.
- feat(validators): `express-validator` con sanitizers (usuarios, tickets, comments, attachments, etc.).
- docs(readme): problema, solución, arquitectura en capas y reglas de notificación.

### Changed
- refactor(auth): middleware JWT robusto (issuer/audience, extracción de token, errores específicos) + `requireRoles`.
- refactor(tickets): mejor manejo de FKs y cálculo de `closed_at`; orden de migraciones recomendado.

### Fixed
- fix(fk-errors): mensajes claros por columna en errores de FK.
- fix(update-tickets): coherencia al alternar entre `Cerrado` y otros estados.

### Security
- chore(security): recomendaciones de Helmet, CORS, rate limiting y manejo de secretos.

---

## [0.0.1] - 2025-08-31
### Added
- feat(models-proto): prototipos de modelos base (User, Department, DeviceType, Device, Ticket, Comment, Attachment, Task).
- feat(middlewares-proto): auth inicial y manejador de errores (prototipo).
- feat(errors): `AppError` + errores HTTP derivados (prototipo).
- chore(db): ejecución/configuración inicial de Sequelize y conexión a PostgreSQL.
- docs(swagger): configuración inicial de Swagger/OpenAPI.
