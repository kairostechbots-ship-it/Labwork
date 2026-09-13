# API de Labwork

Base local: `http://localhost:3000`. Las respuestas exitosas usan `{ "data": ... }` y los errores `{ "error": { "message": ... } }`.

## Acceso

| Rol | Permisos |
|---|---|
| `admin` | Todo, incluidos usuarios y eliminaciones |
| `editor` | Crear y editar sucursales, estudios y paquetes |
| `receptionist` | Consultar citas y cambiar su estado |

Auth.js publica sus rutas bajo `/api/auth/*`. El inicio de sesión usa el proveedor `credentials` con `email` y `password`; la cookie de sesión debe enviarse después a `/api/admin/*`.

## Endpoints públicos

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/api/branches` | Sucursales activas |
| `GET` | `/api/branches/:slug` | Una sucursal activa |
| `GET` | `/api/services` | Estudios activos |
| `GET` | `/api/services/:slug` | Un estudio activo |
| `GET` | `/api/packages` | Paquetes activos |
| `GET` | `/api/packages/:slug` | Paquete y estudios incluidos |
| `POST` | `/api/appointments` | Solicitar una cita |

```json
{
  "patientName": "Ana Pérez",
  "phone": "5551234567",
  "email": "ana@example.com",
  "type": "branch",
  "branchId": "UUID_DE_SUCURSAL",
  "requestedDate": "2026-10-15",
  "requestedTime": "09:30",
  "serviceIds": ["UUID_DE_ESTUDIO"],
  "packageIds": [],
  "notes": "Primera visita"
}
```

Para una cita `home`, `address` es obligatorio. Para una cita `branch`, `branchId` es obligatorio.

## Endpoints administrativos

| Método | Ruta | Roles |
|---|---|---|
| `GET`, `POST` | `/api/admin/branches` | admin, editor |
| `PATCH` | `/api/admin/branches/:id` | admin, editor |
| `DELETE` | `/api/admin/branches/:id` | admin |
| `GET`, `POST` | `/api/admin/services` | admin, editor |
| `PATCH` | `/api/admin/services/:id` | admin, editor |
| `DELETE` | `/api/admin/services/:id` | admin |
| `GET`, `POST` | `/api/admin/packages` | admin, editor |
| `PATCH` | `/api/admin/packages/:id` | admin, editor |
| `DELETE` | `/api/admin/packages/:id` | admin |
| `GET` | `/api/admin/appointments?status=pending&branchId=:id&type=branch` | admin, receptionist |
| `GET`, `PATCH` | `/api/admin/appointments/:id` | admin, receptionist |
| `DELETE` | `/api/admin/appointments/:id` | admin |
| `POST` | `/api/admin/appointments/:id/calendar` | admin, receptionist |
| `GET`, `POST` | `/api/admin/users` | admin |
| `PATCH` | `/api/admin/users/:id` | admin |
| `GET`, `DELETE` | `/api/admin/google-calendar` | admin |
| `GET` | `/api/admin/google-calendar/connect` | admin |
| `GET` | `/api/admin/google-calendar/calendars` | admin |
| `GET`, `PUT`, `DELETE` | `/api/admin/google-calendar/mappings` | admin |

El `PATCH` de una cita acepta `{ "status": "confirmed", "note": "Confirmada por teléfono" }` y registra el historial.
Al confirmar o cancelar también sincroniza el evento de Google Calendar. La guía completa está en [`GOOGLE_CALENDAR.md`](./GOOGLE_CALENDAR.md).

## Puesta en marcha

1. Agrega `AUTH_SECRET` en `.env.local` y Vercel. Genéralo con `npx auth secret`.
2. Ejecuta `npm run db:migrate`.
3. Define temporalmente `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env.local`.
4. Ejecuta `npm run admin:create` una vez y elimina esas tres variables.
5. Inicia con `npm run dev`.

La contraseña inicial debe tener al menos 12 caracteres. Nunca se almacena sin cifrar ni se devuelve por la API.
