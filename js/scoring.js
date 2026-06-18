/**
 * scoring.js
 * ------------------------------------------------------------------
 * Motor de baremación: convierte las respuestas crudas en un
 * "Índice de Riesgo de Discontinuidad Académica" (IRDA) y lo
 * clasifica en niveles (Bajo / Medio / Alto / Muy alto).
 *
 * CRITERIO (editable por Edison):
 *  - Cada opción de respuesta puede declarar una propiedad `risk`
 *    (entero >= 0) en questions.js. Si no la declara, se asume 0.
 *  - Para preguntas tipo "multi", se suman los riesgos de todas las
 *    opciones marcadas (excepto si se marcó una opción `exclusive`,
 *    p.ej. "Ninguna de las anteriores", que anula el resto).
 *  - El puntaje crudo total se normaliza a una escala 0-100 dividiendo
 *    entre el riesgo máximo teórico alcanzable por ese perfil, y
 *    multiplicando por 100. Esto permite comparar entre perfiles que
 *    responden distinto número de preguntas (activo, graduado,
 *    retirado, interrupción).
 *  - Los puntos de corte de nivel (0-25 / 25-50 / 50-75 / 75-100) están
 *    en RISK_LEVELS y se pueden mover libremente.
 *
 * Para cambiar el peso de un factor, edita el campo `risk` de la
 * opción correspondiente en questions.js. Para cambiar los puntos de
 * corte de nivel, edita RISK_LEVELS más abajo. No es necesario tocar
 * ninguna otra parte del código.
 * ------------------------------------------------------------------
 */

const RISK_LEVELS = [
  { max: 25, level: "Bajo", color: "#2e7d32", description: "Baja probabilidad de discontinuidad académica." },
  { max: 50, level: "Medio", color: "#f9a825", description: "Riesgo moderado; se recomienda seguimiento preventivo." },
  { max: 75, level: "Alto", color: "#ef6c00", description: "Riesgo alto; se recomienda intervención y acompañamiento prioritario." },
  { max: 100.01, level: "Muy alto", color: "#c62828", description: "Riesgo crítico; se recomienda intervención inmediata y referido a bienestar estudiantil." },
];

/**
 * Calcula el puntaje de riesgo crudo y el máximo teórico para el
 * conjunto de preguntas EFECTIVAMENTE mostradas a este participante
 * (según perfil y dependsOn), de modo que perfiles que ven menos
 * preguntas no queden artificialmente "más sanos".
 *
 * @param {Object} answers - { [questionId]: value | value[] }
 * @param {Array} visibleQuestions - preguntas que se mostraron a este usuario
 * @returns {{ raw: number, max: number, normalized: number, level: Object, breakdown: Array }}
 */
function computeBarema(answers, visibleQuestions) {
  let raw = 0;
  let max = 0;
  const breakdown = [];

  visibleQuestions.forEach((q) => {
    if (!q.options) return; // preguntas numéricas/texto libre no puntúan
    const optionRisks = q.options.map((o) => o.risk || 0);
    const questionMax =
      q.type === "multi"
        ? optionRisks.reduce((a, b) => a + b, 0)
        : Math.max(...optionRisks, 0);

    if (questionMax <= 0) return; // pregunta sin componente de riesgo

    max += questionMax;

    const value = answers[q.id];
    let questionRaw = 0;

    if (q.type === "multi" && Array.isArray(value)) {
      const exclusiveSelected = q.options.find(
        (o) => o.exclusive && value.includes(o.value)
      );
      if (exclusiveSelected) {
        questionRaw = exclusiveSelected.risk || 0;
      } else {
        questionRaw = value.reduce((sum, v) => {
          const opt = q.options.find((o) => o.value === v);
          return sum + (opt && opt.risk ? opt.risk : 0);
        }, 0);
      }
    } else if (value) {
      const opt = q.options.find((o) => o.value === value);
      questionRaw = opt && opt.risk ? opt.risk : 0;
    }

    raw += questionRaw;
    breakdown.push({
      id: q.id,
      text: q.text,
      raw: questionRaw,
      max: questionMax,
    });
  });

  const normalized = max > 0 ? Math.round((raw / max) * 1000) / 10 : 0;
  const level = RISK_LEVELS.find((l) => normalized <= l.max) || RISK_LEVELS[RISK_LEVELS.length - 1];

  return { raw, max, normalized, level, breakdown };
}

if (typeof module !== "undefined") {
  module.exports = { computeBarema, RISK_LEVELS };
}
