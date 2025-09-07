# Changelog

## [0.2.2] - 2025-09-07
### Added
- test(auth): helper reutilizable de tokens `tests/auth/token.ts` con:
  - `getAdminToken()`, `getToken(role)`, `withAuth(req, token)`, `clearCachedTokens()`.

### Changed
- ticket(update): `UpdateTicketInput` se **restringe** a `{ status, priority, assigned_user_id }`.  
  `closed_at` ahora es **solo calculado** por el servicio (al cerrar/reabrir).
- ticket(service): `update` corre en **transacción**, registra `StatusHistory` con `updatedAt` y retorna el `id` para recargar el ticket **tras el commit** (evita lecturas sucias en tests).
- tests(ticket PUT): ya **no** envía `titulo` ni otros campos; valida cierre/reapertura y `closed_at`.
- tests(suites): suites protegidas usan el helper de token, eliminando firmas JWT duplicadas.

### Removed
- ticket(update): se elimina actualizar vía API los campos  
  `titulo`, `description`, `department_id`, `device_id`, `parent_ticket_id` y `closed_at`.

### Fixed
- attachments(service): se quita el **fanout de notificaciones** al crear adjuntos; solo persiste y devuelve el adjunto con relaciones.

---

## [0.2.1] - 2025-09-04
### Added
- test(helpers): fábrica de usuario vía `/api/users` + firmador JWT (HS256) para usar en suites de tickets.
- auth(routes): aplicado `authMiddleware` y (donde corresponde) `requireRoles` en endpoints protegidos.

### Changed
- ticket(controller): `create` ahora **ignora** `created_by_*` del body y los toma del **JWT** (`created_by_id`, `created_by_name`, `created_by_email`) sin validar formato de email.
- tests(tickets): suites **POST/GET/PUT/DELETE** actualizadas para crear usuario real y enviar `Authorization: Bearer <token>` en todas las requests.
- tests(env): asegurada la carga de `.env.test` antes de la app; token/issuer/audience neutralizados en test.

### Fixed
- ticket(create): error **500** por columna faltante — alineado modelo/BD para `created_by_email` en entorno de test (migración/sync aplicada).
- tests(delete): uso de **UUID v4** válido para casos 404; estados esperados corregidos (204/404).
- tests(setup): limpieza en orden respetando FKs para evitar violaciones durante los tests.

## [0.2.0] - 2025-09-03
### Added
- feat(tickets): CRUD completo con includes (`device`, `assignedUser`, `department`), búsqueda/orden/paginación y reglas de negocio:
  - **No** permitir crear un ticket en estado `Cerrado`.
  - Manejo automático de `closed_at` al cerrar/reabrir.
- feat(notifications): métodos `notifyToDeptByName` y `notifyAssignee`; fanout con `createAndFanout`.
- feat(validators): validadores para tickets (`ticketCreateValidator`, `ticketUpdateValidator`, `ticketIdValidator`, `ticketListValidator`).
- feat(device-types): módulo completo (modelo + service + controlador + rutas) con scopes (`byName`, `byCode`, `search`, `orderBy`) y **Swagger**.
- feat(devices): include `withType`, filtro por `deviceTypeId` en listado y **Swagger**.
- feat(routes/params): helper `devicetypeIdParam` y validadores de query/params para device/deviceType/ticket.

### Changed
- refactor(app): separar **Express app** (`src/app.ts`) del arranque (`src/server.ts`); el server no se inicia en `test`.
- refactor(logging): logger centralizado (`logger.info/warn/error`) con **silencio en test**; `morgan` deshabilitado en `test`.
- refactor(db-init): `ensureDatabaseExists` e `initializeDatabase` usan el logger y limpian mensajes ruidosos.

### Fixed
- fix(tickets): creación en `Cerrado` ahora responde **400**; `delete` responde **204**; mapping coherente de errores **400/404/500**; validación de `UUID` en `DELETE /:id`.
- fix(devices): prechecks de duplicados/FK en `update`; **404** si no existe; **400** para FK inválida; **409** para duplicados.

### Tests
- test(e2e): suites para **departments, device-types, devices y tickets** (POST/GET/PUT/DELETE), incluyendo:
  - tickets: cierre/reapertura (toggle de `closed_at`), FK inválidas, `parent_ticket_id` no puede ser el mismo `id`.
  - devices: filtro por `deviceTypeId`, orden y paginación.
- test(codeerrors): cobertura de paths de error para **device, deviceType, user y ticket** (400/404/409, UUID inválidos, FK inválidas, duplicados).
- test(setup): `src/tests/setup.ts` limpia tablas relevantes y cierra conexiones; `.env.test` dedicado; logs de test silenciosos.

### Docs
- docs(swagger): rutas y esquemas para **/api/tickets**, **/api/devices** y **/api/device-types** (tags, params, request/response, códigos de error).

---

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
