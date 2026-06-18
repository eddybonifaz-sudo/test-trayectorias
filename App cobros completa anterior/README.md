# Research Assesor — Zoom Proxy Server

Servidor que renueva el token de Zoom automáticamente cada hora y crea meetings via API. Se hospeda gratis en Railway.app.

## Variables de entorno requeridas

Configura estas variables en Railway → tu proyecto → Variables:

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `ZOOM_ACCOUNT_ID` | ID de tu cuenta Zoom | Zoom Marketplace → App Credentials |
| `ZOOM_CLIENT_ID` | Client ID de tu app Zoom | Zoom Marketplace → App Credentials |
| `ZOOM_CLIENT_SECRET` | Client Secret de tu app Zoom | Zoom Marketplace → App Credentials |
| `PROXY_SECRET` | Clave secreta que usará tu app para autenticarse | Inventa una clave segura, ej: `ra-secret-2025` |
| `ALLOWED_ORIGIN` | URL de tu app frontend | `https://research-assesor.netlify.app` |

## Endpoints

### GET /health
Verifica que el servidor está corriendo.
```
https://tu-proxy.railway.app/health
```

### POST /zoom/create
Crea un meeting de Zoom. Requiere header `x-secret`.
```json
// Body:
{
  "titulo": "Asesoría inicial — María García",
  "fecha": "2025-04-01",
  "hora": "10:00",
  "duracion": 60
}

// Respuesta:
{
  "id": 123456789,
  "link": "https://zoom.us/j/123456789?pwd=xxx",
  "password": "abc123",
  "start_url": "https://zoom.us/s/123456789?zak=xxx"
}
```

## Deploy en Railway

1. Sube esta carpeta a un repo GitHub (ej: `research-assesor-zoom-proxy`)
2. Ve a railway.app → New Project → Deploy from GitHub repo
3. Selecciona el repo
4. En Variables, agrega las 5 variables de arriba
5. Railway despliega automáticamente
6. Copia la URL pública (ej: `https://research-assesor-zoom-proxy.railway.app`)
7. Pégala en la app → ⚙️ Configuración → modo "Server-to-Server" → URL del proxy
