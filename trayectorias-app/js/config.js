/**
 * config.js
 * ------------------------------------------------------------------
 * Configuración general de la aplicación. Edita estos valores antes
 * de publicar:
 *
 *  1. SHEETS_WEB_APP_URL: la URL de tu Google Apps Script Web App
 *     (ver docs/CONFIGURACION_GOOGLE_SHEETS.md para el paso a paso).
 *  2. PROJECT_INFO: textos que aparecen en el consentimiento informado.
 * ------------------------------------------------------------------
 */

const APP_CONFIG = {
  // Reemplaza esta URL por la que obtengas al desplegar el Apps Script
  // como "Web App". Debe terminar en /exec.
  SHEETS_WEB_APP_URL: "https://script.google.com/macros/s/REEMPLAZAR_CON_TU_ID/exec",

  PROJECT_INFO: {
    titulo: "Trayectorias Estudiantiles: Permanencia y Discontinuidad Académica",
    instituciones: "Universidad de Otavalo y Universidad Nacional de Chimborazo (UNACH)",
    responsable: "Edison Bonifaz Aranda, MSc.",
    contactoCorreo: "", // Completa con el correo institucional de contacto
    contactoTelefono: "", // Opcional
    duracionEstimada: "10 a 15 minutos",
    version: "1.0",
    fecha: "2026",
  },
};

if (typeof module !== "undefined") {
  module.exports = { APP_CONFIG };
}
