/**
 * consent.js
 * ------------------------------------------------------------------
 * Texto del consentimiento informado. Aplica para participantes de
 * Ecuador (LOPDP) y Colombia (Ley 1581 de 2012).
 * ------------------------------------------------------------------
 */

function buildConsentHTML() {
  const info = APP_CONFIG.PROJECT_INFO;
  const contacto = info.contactoCorreo
    ? `el correo <strong>${info.contactoCorreo}</strong>${info.contactoTelefono ? ` o el teléfono <strong>${info.contactoTelefono}</strong>` : ""}`
    : "el equipo de investigación a través de los canales institucionales de la Universidad de Otavalo / UNAD";

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
    étnica, situación familiar y laboral), información sobre trayectoria académica y condiciones
    de estudio en línea. <strong>No se solicitan nombres, números de cédula ni datos de contacto
    directo</strong>; las respuestas se tratan de forma agregada y con fines estrictamente
    académicos.</p>
    <p>Algunas preguntas (sobre experiencias de violencia o problemas de salud) constituyen
    <strong>datos sensibles</strong>. Su respuesta es completamente voluntaria y puede omitirlas
    sin que esto afecte su participación en el resto del estudio.</p>

    <h3>4. Duración y procedimiento</h3>
    <p>Completar el formulario toma aproximadamente <strong>${info.duracionEstimada}</strong>.
    Puede avanzar a su propio ritmo y revisar sus respuestas antes de enviarlas definitivamente.</p>

    <h3>5. Carácter voluntario y derecho de retiro</h3>
    <p>Su participación es <strong>completamente voluntaria</strong>. Puede dejar de responder
    en cualquier momento antes de enviar el formulario cerrando esta ventana, sin ninguna
    consecuencia. Una vez enviadas las respuestas de forma anónima, no será técnicamente posible
    identificar ni retirar un registro individual.</p>

    <h3>6. Marco legal de protección de datos</h3>
    <p>Este estudio se desarrolla con participantes de Ecuador y Colombia; por tanto, aplica la
    siguiente normativa según el país de residencia del participante:</p>
    <ul>
      <li><strong>Ecuador:</strong> Ley Orgánica de Protección de Datos Personales (LOPDP),
      Registro Oficial Suplemento 459 del 26 de mayo de 2021, y su Reglamento General.</li>
      <li><strong>Colombia:</strong> Ley Estatutaria 1581 de 2012 (Régimen General de Protección
      de Datos Personales), reglamentada por el Decreto 1377 de 2013, y demás normas concordantes
      emitidas por la Superintendencia de Industria y Comercio (SIC).</li>
    </ul>
    <p>En ambos casos, sus datos serán tratados bajo los mismos principios:</p>
    <ul>
      <li>Tratamiento únicamente para los fines académicos descritos en este documento
      (principio de <em>finalidad</em>).</li>
      <li>Recopilación solo de los datos estrictamente necesarios (principio de
      <em>minimización / necesidad</em>).</li>
      <li>Almacenamiento con acceso restringido al equipo de investigación; resultados
      reportados únicamente de forma agregada o estadística.</li>
      <li>No se realizarán transferencias de datos a terceros ajenos al equipo de investigación,
      salvo requerimiento legal expreso.</li>
      <li>Como titular de los datos, usted tiene derecho a: <strong>conocer, actualizar,
      rectificar, suprimir, revocar la autorización y solicitar prueba de la misma</strong>
      (derechos ARCO según Ley 1581/2012) y, en Ecuador, también a la
      <strong>portabilidad, limitación del tratamiento y a no ser objeto de decisiones
      automatizadas</strong> (LOPDP). El índice de riesgo calculado al final de este formulario
      es referencial y de uso agregado; no constituye una decisión individual automatizada
      sobre usted.</li>
      <li>Puede ejercer estos derechos contactando a ${contacto}.</li>
    </ul>

    <h3>7. Riesgos y beneficios</h3>
    <p>No se prevén riesgos más allá de la posible incomodidad al responder preguntas sobre
    temas personales, que puede omitir libremente. Su participación contribuirá a mejorar las
    estrategias institucionales de acompañamiento y permanencia estudiantil.</p>

    <h3>8. Aceptación</h3>
    <p>Al marcar las casillas a continuación y pulsar "Acepto y continúo", declara haber leído
    y comprendido esta información, y otorga su consentimiento libre, expreso e informado para
    participar y para el tratamiento de sus datos en los términos aquí descritos.</p>
  `;
}

if (typeof module !== "undefined") {
  module.exports = { buildConsentHTML };
}
