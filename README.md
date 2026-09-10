# Íntimos — De Cerca (Nueva Arquitectura)

> *"De conocer sobre Jesús, a conocer a Jesús."*

Plataforma comunitaria moderna para el grupo juvenil cristiano **Íntimos**.
Reconstruida completamente desde cero con:
- **Backend**: Go (Golang) + Chi router + Autenticación JWT + Hashing Bcrypt.
- **Base de Datos**: PostgreSQL relacional alojada en Coolify con migraciones automáticas.
- **Frontend**: React 18 + Vite + Tailwind CSS + PWA.

---

## 🚀 Estructura del Proyecto

```
C:\Daniel\Intimos\
├── backend/
│   ├── cmd/
│   │   ├── server/main.go          # Servidor HTTP en Go (Puerto 8080)
│   │   └── seeder/main.go          # Seeder de datos iniciales y superadmin
│   ├── internal/
│   │   ├── config/                 # Carga de variables de entorno
│   │   ├── database/               # Pool pgx/v5 y migrador SQL automático
│   │   ├── domain/                 # Modelos del dominio
│   │   ├── repository/postgres/    # Repositorios PostgreSQL relacionales
│   │   ├── service/                # Lógica de negocio (topes, anti-trampa, QR)
│   │   ├── handler/http/           # Controladores API REST y enrutador Chi
│   │   └── middleware/             # Middlewares (Auth JWT, Roles, CORS)
│   ├── pkg/
│   │   ├── hasher/                 # Hashing seguro Bcrypt
│   │   ├── token/                  # Generación y validación de tokens JWT
│   │   └── response/               # Envelope estándar JSON
│   ├── go.mod / go.sum
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/                    # Cliente HTTP REST con interceptor JWT
    │   ├── context/                # AuthContext (Sesión y roles)
    │   ├── components/
    │   │   └── layout/             # Shell responsive y navegación flotante
    │   └── pages/                  # Vistas (Home, CheckIn, Retos, Juegos, Biblia, Ranking, Perfil, Central)
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── .env
```

---

## 🛠️ Cómo Ejecutar el Proyecto

### 1. Backend (Go)
El backend cuenta con migrador automático: al iniciar, crea todas las tablas en PostgreSQL si no existen.

```bash
cd C:\Daniel\Intimos\backend
go run ./cmd/server
```
Servidor disponible en: `http://localhost:8080` (Healthcheck: `http://localhost:8080/health`)

Para sembrar preguntas bíblicas y la cuenta administrativa inicial:
```bash
go run ./cmd/seeder
```

**Credenciales iniciales de administración creadas por el seeder:**
- **Email:** `liderazgo@intimos.com`
- **Contraseña:** `Intimos2026*`
- **Rol:** `superadmin`

---

### 2. Frontend (React + Vite)

```bash
cd C:\Daniel\Intimos\frontend
npm install
npm run dev
```
Aplicación disponible en: `http://localhost:5173`

---

## 🛡️ Mejoras Clave Respecto al Proyecto Original

1. **Fin de la persistencia aislada en `localStorage`**: Todos los datos (servicios, asistencias, dinero de campamento, finanzas, retos) residen en PostgreSQL. Dos personas en dispositivos diferentes ven y comparten exactamente los mismos datos en tiempo real.
2. **Seguridad real**: 
   - Eliminadas las contraseñas en texto plano. Se utiliza **Bcrypt** con costo seguro.
   - Eliminadas las cuentas vulnerables de prueba (`admin@test.com / 1234`).
   - Autenticación mediante **Tokens JWT** con expiración y verificación de roles estricta en cada endpoint.
3. **Economía de puntos autoritativa**: Las reglas de cálculo y los límites (máximo 200 pts/día y 2500 pts/mes en juegos) se calculan y validan exclusivamente en el servidor Go.
4. **Validación de asistencia**: El token QR generado para cada servicio valida la asistencia y otorga bonos de puntualidad automáticos (+75 temprano).
5. **Niveles unificados**: Una sola escala transparente de crecimiento (Semilla → Discípulo → Guerrero → Mentor → Portador de Luz) ligada al historial acumulado inmutable.
6. **Accesibilidad en la Biblia**: Eliminado `user-scalable=no` y añadidos controles de zoom dinámico para facilitar la lectura bíblica a cualquier tamaño de pantalla.
