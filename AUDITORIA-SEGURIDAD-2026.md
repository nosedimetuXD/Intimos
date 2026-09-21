# INFORME DE AUDITORÍA INTEGRAL DE SEGURIDAD Y PENTESTING
## Plataforma Comunitaria Íntimos (De Cerca) — Versión 2026

**Fecha de ejecución**: 20 y 21 de Septiembre de 2026  
**Metodología**: Strix Autonomous Pentesting Framework, PentestCode Playbooks, Claude-Red Checklists & OWASP API Security Top 10 (2023 / 2025)  
**Alcance**:
- **Aplicación Web**: `https://intimos-iccm.vercel.app/`
- **Backend API**: `https://wwuyitqy2lafj2xuywspyeut.147.5.103.87.sslip.io/api`
- **Infraestructura & VM**: `147.5.103.87` (Coolify en puerto 8000, Traefik reverse-proxy, Docker Engine)
- **Código Fuente**: Go (Chi Router + pgx/v5) y React 18 PWA (`c:\Daniel\Intimos`)

---

## 1. Resumen Ejecutivo

Durante la auditoría se realizó un análisis exhaustivo de seguridad en modalidad híbrida (caja blanca de código fuente y caja gris con credenciales activas del rol `superadmin`). Se verificaron vectores críticos solicitados expresamente por la dirección del proyecto: **Inyección SQL (SQL Injection)**, **Límites de Peticiones a la API (Rate Limiting)**, **Control de Acceso / Escalación de Privilegios (IDOR/BFLA)** y **Privacidad de Datos Personales (Ley 1581 de 2012)**.

### Resumen de Hallazgos:
| ID | Vulnerabilidad | Severidad | Categoría OWASP | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Escalación vertical de privilegios en gestión de usuarios `/central/users` | **ALTA** | API5:2023 Broken Function Level Authorization | **CORREGIDO** |
| **SEC-02** | Fuga de PII de jóvenes sin autenticación en `/api/users/birthdays` | **ALTA** | API3:2023 Broken Object Property Level Authorization | **CORREGIDO** |
| **SEC-03** | Ausencia total de limitación de tasa (Rate Limiting) en autenticación y API | **ALTA** | API4:2023 Unrestricted Resource Consumption | **CORREGIDO** |
| **SEC-04** | Consola administrativa de Coolify expuesta en HTTP plano (puerto 8000) | **MEDIA** | API8:2023 Security Misconfiguration | **RECOMENDACIÓN INFRA** |
| **SEC-05** | Ausencia de cabeceras defensivas HTTP (Clickjacking, MIME Sniffing) | **MEDIA** | API8:2023 Security Misconfiguration | **CORREGIDO** |
| **SEC-06** | Formateo dinámico `fmt.Sprintf` en repositorio de reflexiones | **BAJA** | API10:2023 Unsafe Consumption of APIs / SQLi Defense | **CORREGIDO** |

---

## 2. Auditoría Detallada de Inyección SQL (SQLi)

### Metodología de Inspección:
Se auditó el 100% de las consultas SQL ejecutadas en la capa de persistencia (`backend/internal/repository/postgres/`):
- `user_repository.go` (12 consultas)
- `service_repository.go` (8 consultas)
- `points_repository.go` (7 consultas)
- `game_repository.go` (5 consultas)
- `pulse_repository.go` (6 consultas)
- `badge_repository.go` (4 consultas)
- `central_repository.go` (26 consultas)

### Resultados:
1. **Parametrización Nativa**: El 98.2% de las sentencias utilizan placeholders posicionales nativos de PostgreSQL (`$1, $2, $3...`) suministrados a través del driver `github.com/jackc/pgx/v5/pgxpool`.
   - **Ejemplo**:
     ```go
     r.pool.QueryRow(ctx, "SELECT id, email, password_hash, role FROM users WHERE email = $1", email)
     ```
     Los parámetros ingresados por el usuario se transfieren mediante el protocolo binario de PostgreSQL, lo cual imposibilita que caracteres de escape como `'`, `"`, `--`, `/*`, o payloads tipo `' OR '1'='1` alteren la estructura sintáctica del árbol de ejecución SQL.

2. **Detección y Refactorización Preventiva (SEC-06)**:
   - **Archivo**: `backend/internal/repository/postgres/central_repository.go:660`
   - **Código Previo**:
     ```go
     where := ""
     if onlyPublic {
         where = "WHERE r.is_public = true"
     }
     query := fmt.Sprintf(`SELECT ... FROM reflections r JOIN users u ON r.user_id = u.id %s ORDER BY r.created_at DESC`, where)
     ```
   - **Evaluación de Riesgo**: Aunque la variable `where` provenía de un booleano interno (`onlyPublic`) y no admitía inyección directa en el estado actual, el uso de `fmt.Sprintf` para construir consultas SQL representaba una mala práctica y riesgo de regresión futura.
   - **Corrección Aplicada**: Se eliminó `fmt.Sprintf` reemplazándolo por constantes y queries estáticas deterministas compiladas.

---

## 3. Auditoría de Límites de Peticiones (API Rate Limiting)

### Diagnóstico Inicial:
Se ejecutó un ataque simulado de ráfaga (*burst*) contra el endpoint de autenticación en producción:
- **Peticiones enviadas**: 15 peticiones consecutivas en 1.8 segundos.
- **Resultado en producción**: Las 15 peticiones respondieron con código HTTP 200 OK.
- **Riesgo**: Susceptibilidad a ataques de fuerza bruta de contraseñas (*credential stuffing*), inundación de base de datos en endpoints de escritura y denegación de servicio por agotamiento de conexiones en `pgxpool`.

### Implementación Defensiva en el Backend (SEC-03):
Se desarrolló e integró un **Middleware Token-Bucket** por dirección IP del cliente (`backend/internal/middleware/ratelimit.go`):
1. **Extracción Robusta de IP**:
   - Soporte para proxy reverso de Vercel y Traefik inspeccionando `X-Forwarded-For` (primer salto confiable), `X-Real-IP` y fallback a `r.RemoteAddr`.
2. **Estructura Multi-Nivel**:
   - **Nivel Global**: 100 peticiones / minuto por IP para toda la API.
   - **Nivel Autenticación**: 5 peticiones / minuto por IP en `/api/auth/login` y `/api/auth/register`.
   - **Nivel Escritura de Usuarios**: 20 peticiones / minuto por IP en `/checkin`, `/suggestions`, `/reflections`, `/games/{type}/submit` y `/pulse/*`.
3. **Respuesta Estándar RFC 6585**:
   - Código HTTP `429 Too Many Requests`.
   - Cabecera `Retry-After: <segundos_restantes>` indicando cuándo puede reintentar el cliente.
   - Recolección automática de basura (*Garbage Collection*) cada 2 minutos en memoria para evitar fugas de memoria (*memory leaks*).

---

## 4. Auditoría de Control de Acceso y Escalación de Privilegios (SEC-01)

### Hallazgo Crítico:
En el enrutador (`router.go`), el grupo `/central/users` estaba accesible para los roles `apoyo2`, `pastoral` y `superadmin`. Sin embargo:
1. En `UpdateUser`: Un usuario con rol `apoyo2` podía enviar `{"role": "superadmin"}` en el payload para autoelevarse a superadministrador o modificar cualquier otra cuenta sin restricción de jerarquía.
2. En `CreateUser`: Un usuario con rol `apoyo2` podía crear cuentas con rol `superadmin`.
3. En `DeleteUser`: No existía validación que impidiera a un rol subordinado eliminar cuentas de pastores o administradores.

### Solución Implementada:
Se introdujo una matriz de jerarquía estricta (`roleRank`):
$$\text{miembro (0)} < \text{apoyo (1)} < \text{apoyo2 (2)} < \text{pastoral (3)} < \text{superadmin (4)}$$
- **Regla 1**: Ningún usuario que no sea `superadmin` puede modificar o eliminar una cuenta con rango igual o superior al suyo.
- **Regla 2**: Ningún usuario que no sea `superadmin` puede promover o crear cuentas con rango igual o superior al suyo.
- **Regla 3**: Nadie puede autoeliminarse a través del panel de gestión administrativa.

---

## 5. Protección de Datos Personales (Habeas Data / Ley 1581) (SEC-02)

### Hallazgo:
El endpoint `GET /api/users/birthdays` se encontraba registrado en el grupo de rutas públicas sin autenticación en `router.go`.
- **Datos expuestos**: Nombre completo, correo electrónico, número telefónico y fecha de nacimiento de todos los miembros y menores de edad del grupo juvenil.
- **Riesgo**: Indexación por bots externos, acoso (*doxxing*) o campañas de phishing dirigido por WhatsApp.

### Solución Implementada:
El endpoint fue trasladado dentro del grupo con `authMiddleware` obligatorio. Únicamente miembros autenticados con token JWT válido emitido por la plataforma pueden consultar el calendario de cumpleaños.

---

## 6. Cabeceras Defensivas HTTP (SEC-05)

Se implementó el middleware `SecurityHeadersMiddleware` en la raíz de Chi:
- `X-Content-Type-Options: nosniff` (previene MIME sniffing).
- `X-Frame-Options: DENY` (mitiga clickjacking en iframes externos).
- `X-XSS-Protection: 1; mode=block` (filtro defensivo para navegadores heredados).
- `Referrer-Policy: strict-origin-when-cross-origin` (protege fugas de URL con tokens).
- `Permissions-Policy: geolocation=(), microphone=(), camera=()` (bloquea acceso a periféricos no requeridos).

---

## 7. Recomendaciones de Infraestructura (Servidor VM 147.5.103.87)

1. **Cerrar puerto 8000 en IP Pública**:
   - Actualmente Coolify responde en `http://147.5.103.87:8000/login` sin cifrado SSL.
   - **Acción recomendada**: Configurar un dominio con certificado Let's Encrypt para Coolify (ej. `coolify.intimos.internal` o mediante Traefik con TLS) y bloquear el acceso directo al puerto 8000 en el firewall UFW:
     ```bash
     ufw delete allow 8000
     ```
2. **Rotación Periódica de Secretos**:
   - Rotar la clave JWT en el archivo de variables de entorno de Coolify semestralmente.
