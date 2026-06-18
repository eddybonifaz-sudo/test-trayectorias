// ============================================================
//  Research Assesor — Zoom Proxy Server
//  Renueva el token automáticamente y crea meetings via API
//  Deploy gratis en Railway.app
// ============================================================

const https = require('https');
const http  = require('http');
const PORT  = process.env.PORT || 3000;

// ── Variables de entorno (se configuran en Railway) ─────────
const ZOOM_ACCOUNT_ID    = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID     = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const PROXY_SECRET       = process.env.PROXY_SECRET || 'research-assesor-2025';
const ALLOWED_ORIGIN     = process.env.ALLOWED_ORIGIN || '*';

// ── Cache del token ─────────────────────────────────────────
let tokenCache = {
  access_token: null,
  expires_at:   0,
};

// ── Obtener / renovar token automáticamente ─────────────────
async function getZoomToken() {
  const ahora = Date.now();

  // Reutilizar token si aún es válido (con 60 seg de margen)
  if (tokenCache.access_token && ahora < tokenCache.expires_at - 60000) {
    return tokenCache.access_token;
  }

  console.log('[Zoom] Renovando token...');

  const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
  const postData    = `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'zoom.us',
      path:     '/oauth/token',
      method:   'POST',
      headers:  {
        'Authorization': `Basic ${credentials}`,
        'Content-Type':  'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (!data.access_token) {
            reject(new Error(`Zoom token error: ${body}`));
            return;
          }
          // Guardar en caché (el token dura 3600 seg = 1 hora)
          tokenCache.access_token = data.access_token;
          tokenCache.expires_at   = Date.now() + (data.expires_in || 3600) * 1000;
          console.log('[Zoom] Token renovado OK. Válido por', data.expires_in, 'seg');
          resolve(data.access_token);
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ── Crear meeting en Zoom ───────────────────────────────────
async function crearMeeting(titulo, fecha, hora, duracion) {
  const token     = await getZoomToken();
  const startTime = `${fecha}T${hora}:00`;

  const payload = JSON.stringify({
    topic:      titulo || 'Sesión de tutoría — Research Assesor',
    type:       2,                       // Scheduled meeting
    start_time: startTime,
    duration:   parseInt(duracion) || 60,
    timezone:   'America/Guayaquil',
    settings: {
      host_video:        true,
      participant_video: true,
      join_before_host:  false,
      mute_upon_entry:   true,
      waiting_room:      true,
      auto_recording:    'none',
    },
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.zoom.us',
      path:     '/v2/users/me/meetings',
      method:   'POST',
      headers:  {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (!data.join_url) {
            reject(new Error(`Zoom API error: ${body}`));
            return;
          }
          resolve({
            id:        data.id,
            link:      data.join_url,
            password:  data.password,
            start_url: data.start_url,
          });
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Helpers HTTP ────────────────────────────────────────────
function corsHeaders(res, origin) {
  const allow = ALLOWED_ORIGIN === '*' ? '*' : (origin || '*');
  res.setHeader('Access-Control-Allow-Origin',  allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-secret');
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

// ── Servidor HTTP ───────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  corsHeaders(res, origin);

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  // ── GET /health — verificar que el servidor está vivo ──
  if (req.method === 'GET' && url === '/health') {
    json(res, 200, {
      status:    'ok',
      service:   'Research Assesor Zoom Proxy',
      timestamp: new Date().toISOString(),
      zoom_token_cached: !!tokenCache.access_token,
      token_expires_in:  tokenCache.expires_at
        ? Math.max(0, Math.round((tokenCache.expires_at - Date.now()) / 1000)) + ' seg'
        : 'sin token',
    });
    return;
  }

  // ── POST /zoom/create — crear meeting ──────────────────
  if (req.method === 'POST' && url === '/zoom/create') {

    // Validar secret
    const secret = req.headers['x-secret'];
    if (secret !== PROXY_SECRET) {
      json(res, 401, { error: 'Unauthorized' });
      return;
    }

    // Validar variables de entorno
    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      json(res, 500, { error: 'Zoom credentials not configured on server' });
      return;
    }

    try {
      const body    = await readBody(req);
      const meeting = await crearMeeting(
        body.titulo,
        body.fecha,
        body.hora,
        body.duracion
      );
      console.log(`[Meeting creado] ${body.titulo} | ${body.fecha} ${body.hora} | ID: ${meeting.id}`);
      json(res, 200, meeting);
    } catch (err) {
      console.error('[Error crear meeting]', err.message);
      json(res, 500, { error: err.message });
    }
    return;
  }

  // ── GET /zoom/token-status — ver estado del token ──────
  if (req.method === 'GET' && url === '/zoom/token-status') {
    const secret = req.headers['x-secret'];
    if (secret !== PROXY_SECRET) {
      json(res, 401, { error: 'Unauthorized' });
      return;
    }
    json(res, 200, {
      cached:     !!tokenCache.access_token,
      expires_in: tokenCache.expires_at
        ? Math.max(0, Math.round((tokenCache.expires_at - Date.now()) / 1000))
        : 0,
    });
    return;
  }

  // ── 404 ────────────────────────────────────────────────
  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   Research Assesor — Zoom Proxy          ║
║   Puerto: ${PORT}                             ║
║   Listo para recibir solicitudes ✅      ║
╚══════════════════════════════════════════╝
  `);

  // Verificar configuración al arrancar
  if (!ZOOM_ACCOUNT_ID) console.warn('[⚠️] ZOOM_ACCOUNT_ID no configurado');
  if (!ZOOM_CLIENT_ID)  console.warn('[⚠️] ZOOM_CLIENT_ID no configurado');
  if (!ZOOM_CLIENT_SECRET) console.warn('[⚠️] ZOOM_CLIENT_SECRET no configurado');
  if (ZOOM_ACCOUNT_ID && ZOOM_CLIENT_ID && ZOOM_CLIENT_SECRET) {
    console.log('[✅] Credenciales Zoom configuradas');
    // Pre-calentar el token al arrancar
    getZoomToken().catch(e => console.error('[Token warmup error]', e.message));
  }
});
