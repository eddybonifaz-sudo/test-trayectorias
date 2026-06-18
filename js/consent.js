/**
 * consent.js
 * ------------------------------------------------------------------
 * Texto del consentimiento informado. Se inyecta en #consentText.
 * Redactado conforme a:
 *  - Ley Orgánica de Protección de Datos Personales (LOPDP), Ecuador,
 *    Registro Oficial Suplemento 459 (26-may-2021).
 *  - Principios de investigación con seres humanos: voluntariedad,
 *    confidencialidad, minimización de datos, derecho de retiro.
 *
 * EDITA AQUÍ los campos entre llaves {{ }} antes de publicar:
 *  - {{TITULO}}, {{INSTITUCIONES}}, {{RESPONSABLE}}, {{CONTACTO}},
 *    {{DURACION}} se completan automáticamente desde config.js
 *    (APP_CONFIG.PROJECT_INFO). Si necesitas más cambios de fondo,
 *    edita el HTML generado más abajo directamente.
 * ------------------------------------------------------------------
 */

function buildConsentHTML() {
  const info = APP_CONFIG.PROJECT_INFO;
  const contacto = info.contactoCorreo
    ? `el correo <strong>${info.contactoCorreo}</strong>${info.contactoTelefono ? ` o el teléfono <strong>${info.contactoTelefono}</strong>` : ""}`
    : "el equipo de investigación a través de los canales institucionales de la Universidad de Otavalo / UNACH";

  return `
    <h3>1. Propósito del estudio</h3>
    <p>Esta encuesta forma parte del proyecto de investigación <strong>"${info.titulo}"</strong>,
    desarrollado por ${info.instituciones}. Su objetivo es comprender los factores que influyen
    en la permanencia, interrupción o discontinuidad de los estudios universitarios en modalidad
    en línea, con el fin de proponer estrategias de acompañamiento estudiantil.</p>

    <h3>2. ¿Quién es responsable de este estudio?</h3>
    <p>El responsable del tratamiento de los datos recogidos en este formulario es
    <strong>${info.responsable}</strong>, en el marco de un proyecto de investigación institucional
    de ${info.instituciones}.</p>

    <h3>3. ¿Qué información se recopila?</h3>
    <p>Se recogen datos sociodemográficos generales (rango de edad, género, autoidentificación
    étnica, situación familiar y laboral), información sobre su trayectoria académica y
    condiciones de estudio en línea. <strong>No se solicitan nombres, números de cédula, ni
    datos de contacto directo</strong>; las respuestas se tratan de forma agregada y con fines
    estrictamente académicos.</p>
    <p>Algunas preguntas (por ejemplo, sobre experiencias de violencia o problemas de salud)
    constituyen <strong>datos sensibles</strong> según la Ley Orgánica de Protección de Datos
    Personales del Ecuador. Su respuesta a estas preguntas es completamente voluntaria y puede
    omitirlas si así lo prefiere, sin que esto afecte su participación en el resto del estudio.</p>

    <h3>4. Duración y procedimiento</h3>
    <p>Completar el formulario toma aproximadamente <strong>${info.duracionEstimada}</strong>.
    Puede avanzar a su propio ritmo y revisar sus respuestas antes de enviarlas definitivamente.</p>

    <h3>5. Carácter voluntario y derecho de retiro</h3>
    <p>Su participación es <strong>completamente voluntaria</strong>. Puede dejar de responder
    en cualquier momento antes de enviar el formulario, simplemente cerrando esta ventana, sin
    ninguna consecuencia académica, laboral o de otro tipo. Una vez enviadas las respuestas de
    forma anónima, no será técnicamente posible identificar ni retirar un registro individual,
    ya que el formulario no asocia las respuestas a su identidad.</p>

    <h3>6. Confidencialidad y tratamiento de datos personales</h3>
    <p>De conformidad con la <strong>Ley Orgánica de Protección de Datos Personales del Ecuador
    (Registro Oficial Suplemento 459, 26 de mayo de 2021)</strong>, le informamos que:</p>
    <ul>
      <li>Sus datos serán tratados únicamente para los fines académicos y de investigación
      descritos en este documento (principio de finalidad).</li>
      <li>Solo se recopilan los datos estrictamente necesarios para los objetivos del estudio
      (principio de minimización).</li>
      <li>Las respuestas se almacenan en una hoja de cálculo institucional con acceso restringido
      al equipo de investigación, y se reportarán únicamente de forma agregada o estadística,
      nunca de forma individualizada.</li>
      <li>No se realizarán transferencias de sus datos a terceros ajenos al equipo de
      investigación, salvo requerimiento legal expreso.</li>
      <li>Como titular de los datos, usted tiene derecho a: <strong>acceso, rectificación y
      actualización, eliminación, oposición, portabilidad y limitación del tratamiento</strong>
      de su información, así como a no ser objeto de decisiones basadas únicamente en
      valoraciones automatizadas. El índice de riesgo calculado al final de este formulario es
      referencial, de uso agregado para el equipo de investigación, y no constituye una decisión
      individual sobre usted.</li>
      <li>Puede ejercer estos derechos, formular consultas o revocar su consentimiento
      contactando a ${contacto}. La revocatoria del consentimiento no afecta la licitud del
      tratamiento realizado previamente.</li>
    </ul>

    <h3>7. Riesgos y beneficios</h3>
    <p>No se prevén riesgos más allá de la posible incomodidad al responder preguntas sobre
    temas personales o sensibles, que puede omitir libremente. Como beneficio, su participación
    contribuirá a mejorar las estrategias institucionales de acompañamiento y permanencia
    estudiantil.</p>

    <h3>8. Aceptación</h3>
    <p>Al marcar las casillas a continuación y pulsar "Acepto y continúo", usted declara que ha
    leído y comprendido esta información, que sus dudas han sido resueltas y que otorga su
    consentimiento libre, expreso e informado para participar en este estudio y para el
    tratamiento de sus datos en los términos aquí descritos.</p>
  `;
}

if (typeof module !== "undefined") {
  module.exports = { buildConsentHTML };
}
