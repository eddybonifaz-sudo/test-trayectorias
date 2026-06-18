/**
 * Código.gs
 * ------------------------------------------------------------------
 * Google Apps Script que recibe las respuestas del formulario web
 * (vía POST) y las guarda como una nueva fila en una hoja de Google
 * Sheets. Crea automáticamente los encabezados en la primera fila
 * si la hoja está vacía.
 *
 * INSTALACIÓN (ver docs/CONFIGURACION_GOOGLE_SHEETS.md para el paso
 * a paso con capturas de pantalla):
 *   1. Crea una hoja de Google Sheets nueva (o usa una existente).
 *   2. Extensiones > Apps Script.
 *   3. Borra el contenido de Código.gs y pega TODO este archivo.
 *   4. Implementar > Nueva implementación > tipo "Aplicación web".
 *      - Ejecutar como: Yo (tu cuenta)
 *      - Quién tiene acceso: Cualquier usuario
 *   5. Copia la URL que termina en /exec y pégala en js/config.js
 *      como APP_CONFIG.SHEETS_WEB_APP_URL.
 *   6. Cada vez que MODIFIQUES este script, debes crear una NUEVA
 *      versión de la implementación (Implementar > Gestionar
 *      implementaciones > lápiz de editar > Versión: Nueva versión).
 * ------------------------------------------------------------------
 */

const SHEET_NAME = "Respuestas";

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);

    ensureHeaders(sheet, data);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map((h) => (data[h] !== undefined ? data[h] : ""));
    sheet.appendRow(row);

    return jsonResponse({ result: "ok" });
  } catch (err) {
    return jsonResponse({ result: "error", message: err.message });
  }
}

function doGet(e) {
  return jsonResponse({
    result: "ok",
    message: "Este endpoint solo acepta solicitudes POST desde el formulario.",
  });
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

/**
 * Si la hoja está vacía, escribe los encabezados a partir de las
 * claves del primer objeto recibido. Si ya existen encabezados pero
 * llegan claves nuevas (por ejemplo, una pregunta de texto libre que
 * no se había usado antes), las agrega al final sin romper el orden
 * de las columnas existentes.
 */
function ensureHeaders(sheet, data) {
  const incomingKeys = Object.keys(data);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(incomingKeys);
    return;
  }

  const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missingKeys = incomingKeys.filter((k) => existingHeaders.indexOf(k) === -1);

  if (missingKeys.length > 0) {
    sheet.getRange(1, existingHeaders.length + 1, 1, missingKeys.length).setValues([missingKeys]);
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
