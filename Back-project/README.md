# Incidentia Helpdesk

Plataforma de mesa de ayuda (helpdesk) para gestión de incidencias internas. Soporta tickets con asignación, comentarios en hilo, adjuntos, historial de estados, tareas, notificaciones y control de acceso por roles.

---

## Tecnologías

* Node.js + Express + TypeScript
* Sequelize (PostgreSQL)
* JWT (autenticación) y autorización por roles
* express-validator (validación)
* bcrypt (hash de contraseñas)

---

## Problemática

Las organizaciones necesitan registrar y resolver incidencias internas (fallas de equipos, solicitudes de soporte, requerimientos de área) de forma **trazable y colaborativa**. Sin un sistema centralizado, se pierde contexto (quién hizo qué y cuándo), es difícil priorizar, y no existe una **cadena de notificaciones** confiable para alertar a los responsables.

**Dolores detectados:**

* Tickets sin responsable claro o que se “pierden”.
* Falta de visibilidad de estados/progreso y de un **historial de cambios**.
* Comunicación dispersa (mensajería, correos) y **adjuntos** fuera de contexto.
* Ausencia de **notificaciones** automáticas y reglas por rol/departamento.

---

## Enfoque de solución

Diseñar una plataforma con **capas claras** (modelos, servicios, validadores, controladores) que:

1. Estandarice la creación, asignación y ciclo de vida de tickets.
2. Centralice la colaboración (comentarios en hilo, adjuntos).
3. Registre auditoría de estados (**StatusHistory**).
4. Automatice **notificaciones** según reglas de negocio (roles, departamento, prioridad, encargado).
5. Aplique **buenas prácticas**: validación exhaustiva, manejo consistente de errores, autorización por rol, paginación y asociaciones bien definidas.

---

## ¿Qué se construyó?

* **Modelos y relaciones**: `User`, `Department`, `DeviceType`, `Device`, `Ticket`, `Comment`, `Attachment` (ligado a ticket o comentario), `Task` (con `completed_at`), `StatusHistory`, `Notification` y `NotificationUser` (N\:M).
* **Servicios (business logic)** con CRUD y reglas:

  * `TicketService` (creación, actualización con cierre/reapertura automática, asignación, includes útiles).
  * `CommentService` (comentarios y respuestas con validación de jerarquía).
  * `AttachmentService` (adjuntos en ticket o comentario; notifica a los actores relevantes).
  * `StatusHistoryService` (auditoría cuando cambia el estado del ticket).
  * `NotificationService` (fan-out a destinatarios por rol/departamento/usuario).
* **Validadores** con `express-validator` para entradas seguras (sanitizers, enums, UUID/int, rangos).
* **Autenticación/Autorización**: middleware JWT robusto y `requireRoles(...)`.
* **Manejo de errores** centralizado mediante `AppError` y derivados.

---

## Explicación del proyecto (flujo funcional)

1. **Creación de ticket**

   * Se valida la entrada, se persiste el ticket y, si nace cerrado, se fija `closed_at`.
   * Se **notifica** automáticamente a administradores de “Sistemas” o a los del departamento, según configuración.

2. **Asignación / cambio de estado**

   * Al actualizar, si `status` cambia a `Cerrado`, se establece `closed_at`; si se reabre, se limpia.
   * Se registra en **StatusHistory** quién cambió, de qué a qué, y cuándo.
   * Si cambia el **encargado**, se le notifica de forma directa.
   * Si la **prioridad** cambia a **Crítica**, se alertan administradores del área, administradores de Sistemas y el encargado.

3. **Colaboración**

   * **Comentarios en hilo**: se valida que las respuestas pertenezcan al mismo ticket; se notifica al encargado y, si aplica, al autor del comentario padre (excluyendo al autor actual para evitar auto-notificación).
   * **Adjuntos**: pueden asociarse a ticket **o** comentario (constraint: exactamente uno no nulo); se notifica a los actores relevantes.

4. **Tareas por ticket**

   * Definición de subtareas con `is_completed` y `completed_at` para controlar avance.

5. **Notificaciones**

   * Se generan instancias de `Notification` y se distribuyen a destinatarios en `NotificationUser` (permite `read_at`/`hidden`).
   * Reglas implementadas: ticket creado, asignación, prioridad crítica, reabierto/cerrado, cambio de departamento, nuevo comentario/adjunto, ticket sin encargado. (Recordatorios por cron quedan listos para el roadmap.)

---

## Arquitectura

El proyecto sigue una **arquitectura en capas** (inspirada en enfoques Clean/Hexagonal) que separa responsabilidades y favorece pruebas y mantenibilidad. Además, puede evolucionar hacia un **enfoque modular por dominios** (por ejemplo, `tickets`, `comments`, `notifications`), donde cada módulo encapsula sus modelos, servicios, validadores y controladores con límites claros.

Capas y responsabilidades:

* **Model**: definición de entidades y asociaciones en Sequelize.
* **Service**: reglas de negocio, orquestación de flujos y side‑effects (notificaciones, auditoría).
* **Controller**: coordina validación → service → respuesta HTTP.
* **Validator**: contratos de entrada con sanitización (`express-validator`).
* **Middleware**: autenticación JWT, autorización por roles y manejo centralizado de errores.

---

## Notificaciones (resumen de reglas)

* **Creación de ticket**: informa a administradores de la organización/área definida (p. ej., “Sistemas”).
* **Ticket sin encargado**: advertencia a admins del departamento y de “Sistemas”.
* **Cambio de encargado**: se notifica al nuevo responsable.
* **Prioridad Crítica**: alerta a admins del departamento + “Sistemas” + encargado.
* **Reapertura/Cierre**: información a admins del departamento (y encargado si corresponde).
* **Cambio de departamento**: información a admins del nuevo departamento.
* **Nuevo comentario/adjunto**: información al encargado y autor del comentario padre (si aplica).

---

## Buenas prácticas adoptadas

* Validación estricta con `express-validator` (sanitizers, formatos, rangos, enums).
* Manejo uniforme de errores con `AppError` (400/401/403/404/409/422/500…).
* Auditoría de estados en `StatusHistory` y includes selectivos para evitar N+1.
* Índices en campos de filtros/orden (`createdAt`, FKs, `is_completed`).
* Paginación estándar en listados.
* Autenticación JWT con issuer/audience y control de algoritmos; autorización por roles con `requireRoles`.
* Configuración de seguridad sugerida: Helmet, CORS restringido, rate limiting, logs estructurados.

---
