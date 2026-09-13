# Integración de Google Calendar

La integración usa una sola cuenta institucional de Google y un calendario diferente para cada sucursal. También permite asignar un calendario exclusivo para tomas a domicilio.

## Comportamiento

- Solo un usuario Labwork con rol `admin` puede conectar o desconectar la cuenta de Google y asignar calendarios.
- Los usuarios `admin` y `receptionist` pueden confirmar o cancelar citas.
- Al confirmar una cita se crea o actualiza su evento.
- Al cancelar o eliminar una cita se elimina su evento.
- Si Google no está disponible, el cambio de estado de la cita se conserva y la respuesta incluye `calendarSync.status = "error"`. Se puede reintentar manualmente.
- El evento contiene nombre, teléfono, correo, ubicación e ID interno. No se envía la lista de estudios al calendario.

## 1. Preparar Google Cloud

1. Abre [Google Cloud Console](https://console.cloud.google.com/) y crea o selecciona el proyecto de Labwork.
2. En **APIs y servicios > Biblioteca**, busca y habilita **Google Calendar API**.
3. Configura la pantalla de consentimiento OAuth:
   - Usa tipo **Interno** si todos pertenecen al mismo Google Workspace.
   - Usa tipo **Externo** en caso contrario y agrega la cuenta institucional como usuario de prueba mientras la aplicación esté en pruebas.
   - En una aplicación externa con estado **Testing**, el refresh token de Calendar normalmente caduca después de siete días. Para un uso continuo hay que publicar la aplicación o usar una aplicación interna de Google Workspace.
4. Crea credenciales en **APIs y servicios > Credenciales > Crear credenciales > ID de cliente OAuth**.
5. Selecciona **Aplicación web**.
6. Agrega este URI de redirección para desarrollo:

   ```text
   http://localhost:3000/api/admin/google-calendar/callback
   ```

7. En producción agrega también el URI con el dominio real y HTTPS:

   ```text
   https://TU-DOMINIO/api/admin/google-calendar/callback
   ```

El URI debe coincidir exactamente con el configurado en el ambiente correspondiente. Consulta la [guía oficial OAuth para aplicaciones web](https://developers.google.com/identity/protocols/oauth2/web-server).

## 2. Crear los calendarios

En la cuenta institucional crea calendarios como:

- Labwork - Sucursal Centro
- Labwork - Sucursal Norte
- Labwork - Sucursal Sur
- Labwork - Tomas a domicilio

Compártelos con los administradores que necesiten verlos. La cuenta conectada debe ser propietaria o tener permiso para modificar eventos.

## 3. Configurar variables locales

Agrega estas variables a `.env`. No subas sus valores a Git ni los pegues en tickets o chats.

```dotenv
GOOGLE_CALENDAR_CLIENT_ID="CLIENT_ID_DE_GOOGLE"
GOOGLE_CALENDAR_CLIENT_SECRET="CLIENT_SECRET_DE_GOOGLE"
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3000/api/admin/google-calendar/callback"
GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY="CLAVE_BASE64_DE_32_BYTES"
GOOGLE_CALENDAR_TIME_ZONE="America/Mexico_City"
GOOGLE_CALENDAR_APPOINTMENT_DURATION_MINUTES="60"
```

Genera la clave de cifrado una sola vez:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Guarda esa clave también en el proveedor de producción. Si se pierde o cambia, el refresh token almacenado ya no podrá descifrarse y habrá que volver a conectar Google.

## 4. Aplicar la migración

Con `DATABASE_URL` disponible, ejecuta:

```powershell
npm run db:migrate
```

La migración crea las tablas de conexión y asignaciones, y añade `google_calendar_id` a las citas.

## 5. Conectar y asignar calendarios

1. Arranca el proyecto con `npm run dev`.
2. Inicia sesión como administrador en:

   ```text
   http://localhost:3000/api/auth/signin?callbackUrl=/admin/google-calendar
   ```

3. Abre `http://localhost:3000/admin/google-calendar`.
4. Pulsa **Conectar Google** y acepta los permisos.
5. Selecciona el calendario correspondiente para cada sucursal y para tomas a domicilio.

## 6. Probar la sincronización

Confirma una cita persistida con `PATCH /api/admin/appointments/:id`:

```json
{
  "status": "confirmed",
  "note": "Confirmada por teléfono"
}
```

La respuesta incluye uno de estos resultados:

```json
{ "calendarSync": { "status": "created", "eventId": "..." } }
```

Otros estados posibles son `updated`, `deleted`, `not-needed` y `error`.

Para reintentar una sincronización:

```text
POST /api/admin/appointments/:id/calendar
```

Para filtrar las citas de una sucursal:

```text
GET /api/admin/appointments?branchId=UUID_DE_SUCURSAL
```

Los filtros `branchId`, `status` y `type` se pueden combinar.

## Endpoints de configuración

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/api/admin/google-calendar` | Estado de la conexión |
| `DELETE` | `/api/admin/google-calendar` | Desconectar la cuenta |
| `GET` | `/api/admin/google-calendar/connect` | Iniciar OAuth |
| `GET` | `/api/admin/google-calendar/callback` | Recibir la respuesta de Google |
| `GET` | `/api/admin/google-calendar/calendars` | Listar calendarios con escritura |
| `GET` | `/api/admin/google-calendar/mappings` | Consultar asignaciones |
| `PUT` | `/api/admin/google-calendar/mappings` | Asignar calendario a sucursal o domicilio |
| `DELETE` | `/api/admin/google-calendar/mappings` | Quitar una asignación |

Google recomienda `access_type=offline` para que el servidor renueve el acceso sin que el administrador esté presente. El refresh token se guarda cifrado con AES-256-GCM; los access tokens temporales no se almacenan.
