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
  SHEETS_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwEI9I2QGU6EP1CwrcHiPadcPPfEr-c8c38sLW2ySa_cREmxZc9oJm3yIijQKsynDTodg/exec",

  PROJECT_INFO: {
    titulo: "Trayectorias Estudiantiles: Permanencia y Discontinuidad Académica",
    instituciones: "Universidad de Otavalo y Universidad Nacional Abierta y a Distancia (UNAD)",
    responsable: "Equipo de investigación Binacional UNAD - U. Otavalo",
    contactoCorreo: "ebonifaz@uotavalo.edu.ec", // Completa con el correo institucional de contacto
    contactoTelefono: "+593982716252", // Opcional
    duracionEstimada: "10 a 15 minutos",
    version: "1.0",
    fecha: "2026",
  },
};

if (typeof module !== "undefined") {
  module.exports = { APP_CONFIG };
}
