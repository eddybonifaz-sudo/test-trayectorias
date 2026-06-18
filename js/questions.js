/**
 * questions.js
 * ------------------------------------------------------------------
 * Modelo de datos del instrumento "Trayectorias Estudiantiles".
 * Cada pregunta declara: id, dimensión, tipo de control, opciones,
 * a qué perfil(es) de participante aplica (showIf) y, si corresponde,
 * el peso de riesgo de abandono usado por el motor de baremos
 * (ver scoring.js).
 *
 * NOTA PARA EDISON: los pesos de "risk" son un punto de partida
 * razonable basado en literatura de deserción universitaria, pero
 * son EDITABLES. Cambia cualquier número en este archivo y el cálculo
 * se actualiza solo. No se requiere tocar app.js ni scoring.js.
 * ------------------------------------------------------------------
 */

// Perfiles posibles según P14 (Estado académico actual)
const PROFILE = {
  ACTIVO: "activo",
  GRADUADO: "graduado",
  RETIRADO: "retirado",
  INTERRUPCION: "interrupcion",
};

// Estructura de cada pregunta:
// {
//   id: "p8",
//   dim: 1,                      // dimensión 1-4
//   text: "...",
//   type: "single" | "multi" | "text" | "number",
//   options: [{ value, label, risk? }],
//   showIf: null | (profile) => boolean,
//   requiredIf: null | (profile) => boolean,  // si no se define, requerido siempre que se muestre
//   dependsOn: { id, equals } // visibilidad condicionada a otra respuesta (no solo perfil)
// }

const QUESTIONS = [
  // ===================== DIMENSIÓN 1 =====================
  {
    id: "p1",
    dim: 1,
    text: "Universidad a la que pertenece",
    type: "single",
    options: [
      { value: "otavalo", label: "Universidad de Otavalo" },
      { value: "unad", label: "UNAD" },
    ],
  },
  {
    id: "p2",
    dim: 1,
    text: "Género con el que se identifica",
    type: "single",
    options: [
      { value: "mujer", label: "Mujer" },
      { value: "hombre", label: "Hombre" },
      { value: "mujer_trans", label: "Mujer Trans" },
      { value: "hombre_trans", label: "Hombre Trans" },
      { value: "no_binarie", label: "No binarie" },
      { value: "autoidentifica", label: "Prefiero autoidentificarme como", hasText: true },
      { value: "no_responde", label: "Prefiero no responder" },
    ],
  },
  {
    id: "p3",
    dim: 1,
    text: "¿Cuál es el tipo de familia al que pertenece?",
    type: "single",
    options: [
      { value: "nuclear", label: "Familia nuclear (madre, padre e hijos en el mismo hogar)" },
      { value: "monopaternal", label: "Familia monopaternal (uno de los padres con sus hijos)" },
      { value: "extensa", label: "Familia extensa (incluye otros familiares en el hogar)" },
      { value: "unipersonal", label: "Unipersonal (vive solo/a)" },
      { value: "otro", label: "Otro", hasText: true },
    ],
  },
  {
    id: "p4",
    dim: 1,
    text: "¿Tiene usted hijos o hijas?",
    type: "single",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "p5",
    dim: 1,
    text: "Si respondió sí, indique cuántos hijos tiene",
    type: "single",
    dependsOn: { id: "p4", equals: "si" },
    options: [
      { value: "1", label: "1 hijo" },
      { value: "2", label: "2 hijos" },
      { value: "3+", label: "3 o más" },
    ],
  },
  {
    id: "p6",
    dim: 1,
    text: "¿En qué rango de edad se encuentra usted?",
    type: "single",
    options: [
      { value: "17-20", label: "17–20" },
      { value: "21-25", label: "21–25" },
      { value: "26-30", label: "26–30" },
      { value: "31-40", label: "31–40" },
      { value: "40+", label: "Más de 40" },
    ],
  },
  {
    id: "p7",
    dim: 1,
    text: "¿Se autoidentifica con algún pueblo o nacionalidad?",
    type: "single",
    options: [
      { value: "indigena", label: "Indígena" },
      { value: "afrodescendiente", label: "Afrodescendiente" },
      { value: "montubio", label: "Montubio" },
      { value: "mestizo", label: "Mestizo/a" },
      { value: "otro", label: "Otro", hasText: true },
      { value: "ninguno", label: "Ninguno" },
    ],
  },
  {
    id: "p8",
    dim: 1,
    text: "¿Considera que alguna de las siguientes situaciones de violencia o conflictos sociales y/o políticos han afectado su proceso formativo?",
    type: "multi",
    multiHint: true,
    options: [
      { value: "desplazamiento", label: "Desplazamiento o cambio de residencia por violencia/inseguridad", risk: 2 },
      { value: "estigmatizacion", label: "Estigmatización o discriminación", risk: 2 },
      { value: "violencia_fisica", label: "Violencia física", risk: 3 },
      { value: "violencia_emocional", label: "Violencia emocional o psicológica", risk: 3 },
      { value: "violencia_genero", label: "Violencias basadas en género", risk: 3 },
      { value: "amenazas", label: "Amenazas o intimidación", risk: 2 },
      { value: "grupos_armados", label: "Presencia de grupos armados, bandas criminales o violencia organizada", risk: 3 },
      { value: "afectacion_familia", label: "Afectaciones a su familia o comunidad por hechos de violencia", risk: 2 },
      { value: "ninguna", label: "Ninguna de las anteriores", risk: 0, exclusive: true },
      { value: "otro", label: "Otro", hasText: true, risk: 1 },
    ],
  },
  {
    id: "p9",
    dim: 1,
    text: "Lugar de residencia actual",
    type: "single",
    options: [
      { value: "ecuador", label: "Ecuador" },
      { value: "colombia", label: "Colombia" },
    ],
  },
  {
    id: "p10",
    dim: 1,
    text: "Zona de residencia",
    type: "single",
    options: [
      { value: "urbana", label: "Urbana" },
      { value: "rural", label: "Rural", risk: 1 },
    ],
  },
  {
    id: "p11",
    dim: 1,
    text: "Nivel educativo del padre/madre o tutor principal",
    type: "single",
    options: [
      { value: "sin_escolaridad", label: "Sin escolaridad" },
      { value: "basica", label: "Educación básica" },
      { value: "bachillerato", label: "Bachillerato" },
      { value: "superior", label: "Educación superior" },
      { value: "posgrado", label: "Posgrado" },
      { value: "no_se", label: "No lo sé" },
    ],
  },
  {
    id: "p12",
    dim: 1,
    text: "¿Cuál es su situación o actividad principal en la actualidad? (Marque la opción que mejor describa su situación)",
    type: "single",
    options: [
      { value: "solo_estudia", label: "Solo estudia" },
      { value: "estudia_trabaja_medio", label: "Estudia y trabaja medio tiempo", risk: 1 },
      { value: "estudia_trabaja_completo", label: "Estudia y trabaja tiempo completo", risk: 2 },
      { value: "estudia_independiente", label: "Estudia y trabaja independiente o tiene emprendimiento propio", risk: 1 },
      { value: "estudia_busca_trabajo", label: "Estudia y está buscando trabajo", risk: 1 },
      { value: "estudia_oficios_hogar", label: "Estudia y se dedica principalmente a oficios del hogar", risk: 1 },
      { value: "solo_trabaja_dependiente", label: "Únicamente trabaja dependiente", risk: 2 },
      { value: "solo_trabaja_independiente", label: "Únicamente trabaja independiente o tiene un emprendimiento", risk: 2 },
      { value: "busca_trabajo", label: "Está buscando trabajo", risk: 1 },
      { value: "pensionado", label: "Pensionado/a o jubilado/a" },
      { value: "otro", label: "Otro", hasText: true },
    ],
  },

  // ===================== DIMENSIÓN 2 =====================
  {
    id: "p13",
    dim: 2,
    text: "Año de ingreso a la carrera",
    type: "select",
    options: Array.from({ length: 2026 - 1990 + 1 }, (_, i) => {
      const y = String(2026 - i);
      return { value: y, label: y };
    }),
  },
  {
    id: "p14",
    dim: 2,
    text: "Estado académico actual",
    type: "single",
    isProfileSelector: true,
    options: [
      { value: PROFILE.ACTIVO, label: "Estudiante activo/a" },
      { value: PROFILE.GRADUADO, label: "Graduado/a" },
      { value: PROFILE.RETIRADO, label: "Retirado/a (abandono definitivo)" },
      { value: PROFILE.INTERRUPCION, label: "En interrupción temporal de estudios" },
    ],
  },

  // --- Para estudiantes activos (15-17) ---
  {
    id: "p15",
    dim: 2,
    section: "Para estudiantes activos",
    text: "Semestre que cursa actualmente",
    type: "select",
    showIf: (p) => p === PROFILE.ACTIVO || p === PROFILE.INTERRUPCION,
    options: [
      { value: "1", label: "1° semestre" },
      { value: "2", label: "2° semestre" },
      { value: "3", label: "3° semestre" },
      { value: "4", label: "4° semestre" },
      { value: "5", label: "5° semestre" },
      { value: "6", label: "6° semestre" },
      { value: "7", label: "7° semestre" },
      { value: "8", label: "8° semestre" },
      { value: "9", label: "9° semestre" },
      { value: "10", label: "10° semestre" },
    ],
  },
  {
    id: "p16",
    dim: 2,
    section: "Para estudiantes activos",
    text: "¿Ha interrumpido sus estudios en algún momento desde su ingreso?",
    type: "single",
    showIf: (p) => p === PROFILE.ACTIVO || p === PROFILE.INTERRUPCION,
    options: [
      { value: "si", label: "Sí", risk: 2 },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "p17",
    dim: 2,
    section: "Para estudiantes activos",
    text: "Si interrumpió sus estudios de manera temporal o definitiva, ¿cuál fue la causa principal?",
    type: "single",
    showIf: (p) => p === PROFILE.ACTIVO || p === PROFILE.INTERRUPCION,
    dependsOn: { id: "p16", equals: "si" },
    options: [
      { value: "economica", label: "Económica", risk: 2 },
      { value: "familiar", label: "Familiar", risk: 2 },
      { value: "laboral", label: "Laboral", risk: 1 },
      { value: "academica", label: "Académica", risk: 2 },
      { value: "conectividad", label: "Problemas de conectividad", risk: 2 },
      { value: "equipos", label: "Falta de equipos tecnológicos", risk: 2 },
      { value: "materiales", label: "Falta de materiales didácticos disponibles", risk: 1 },
      { value: "salud", label: "Salud", risk: 2 },
      { value: "otro", label: "Otro", hasText: true, risk: 1 },
    ],
  },

  // --- Para graduados (18-21) ---
  {
    id: "p18",
    dim: 2,
    section: "Para graduados/as",
    text: "Año de graduación",
    type: "number",
    min: 1990,
    max: 2026,
    showIf: (p) => p === PROFILE.GRADUADO,
  },
  {
    id: "p19",
    dim: 2,
    section: "Para graduados/as",
    text: "¿Se encuentra actualmente trabajando?",
    type: "single",
    showIf: (p) => p === PROFILE.GRADUADO,
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "p20",
    dim: 2,
    section: "Para graduados/as",
    text: "¿El trabajo que desempeña está relacionado con su formación en Educación?",
    type: "single",
    showIf: (p) => p === PROFILE.GRADUADO,
    dependsOn: { id: "p19", equals: "si" },
    options: [
      { value: "directamente", label: "Sí, directamente relacionado" },
      { value: "parcialmente", label: "Parcialmente relacionado" },
      { value: "no_relacionado", label: "No relacionado" },
    ],
  },

  // --- Comunes a activos / graduados / interrupción (21-23) ---
  {
    id: "p21",
    dim: 2,
    text: "¿Reprobó asignaturas durante el proceso académico?",
    type: "single",
    showIf: (p) => p === PROFILE.ACTIVO || p === PROFILE.GRADUADO || p === PROFILE.INTERRUPCION,
    options: [
      { value: "ninguna", label: "Ninguna" },
      { value: "1-2", label: "1–2", risk: 1 },
      { value: "3-4", label: "3–4", risk: 2 },
      { value: "4+", label: "Más de 4", risk: 3 },
    ],
  },
  {
    id: "p22",
    dim: 2,
    text: "De haber reprobado al menos una asignatura, marque la causa principal",
    type: "single",
    showIf: (p) => p === PROFILE.ACTIVO || p === PROFILE.GRADUADO || p === PROFILE.INTERRUPCION,
    dependsOn: { id: "p21", notEquals: "ninguna" },
    options: [
      { value: "asistencia", label: "Falta de asistencia a las jornadas de estudio", risk: 1 },
      { value: "acompanamiento", label: "Poco acompañamiento por parte de la Universidad", risk: 1 },
      { value: "academica", label: "Académica", risk: 1 },
      { value: "personal", label: "Personal", risk: 1 },
      { value: "salud", label: "Salud", risk: 2 },
      { value: "otra", label: "Otra", hasText: true, risk: 1 },
    ],
  },
  {
    id: "p23",
    dim: 2,
    text: "¿Considera que su avance académico fue?",
    type: "single",
    showIf: (p) => p === PROFILE.ACTIVO || p === PROFILE.GRADUADO || p === PROFILE.INTERRUPCION,
    options: [
      { value: "excelente", label: "Excelente (con méritos)", risk: 0 },
      { value: "bueno", label: "Bueno (sin retrasos)", risk: 0 },
      { value: "regular", label: "Regular (ligeros retrasos)", risk: 1 },
      { value: "deficiente", label: "Deficiente (con retraso significativo/permanente)", risk: 3 },
    ],
  },

  // --- Para retirados (24) ---
  {
    id: "p24",
    dim: 2,
    section: "Para estudiantes retirados",
    text: "En caso de que usted haya abandonado el proceso formativo, ¿cuál fue la principal razón por la que decidió retirarse de la carrera? (Puede seleccionar varias)",
    type: "multi",
    multiHint: true,
    showIf: (p) => p === PROFILE.RETIRADO,
    options: [
      { value: "economicos", label: "Motivos económicos", risk: 2 },
      { value: "laborales", label: "Motivos laborales (cambio o aumento de trabajo)", risk: 2 },
      { value: "responsabilidades_familiares", label: "Responsabilidades familiares o personales", risk: 2 },
      { value: "salud_fisica", label: "Problemas de salud física", risk: 2 },
      { value: "salud_mental", label: "Problemas de salud mental", risk: 3 },
      { value: "modalidad_linea", label: "Dificultades con la modalidad de estudio en línea", risk: 2 },
      { value: "falta_tiempo", label: "Falta de tiempo para cumplir con las actividades académicas", risk: 2 },
      { value: "cambio_intereses", label: "Cambio de intereses académicos o profesionales", risk: 1 },
      { value: "conectividad", label: "Problemas de conectividad o acceso a tecnología", risk: 2 },
      { value: "dificultades_academicas", label: "Dificultades académicas", risk: 2 },
      { value: "dificultades_financieras", label: "Dificultades financieras/económicas", risk: 2 },
      { value: "otro", label: "Otro", hasText: true, risk: 1 },
    ],
  },

  // ===================== DIMENSIÓN 3 =====================
  {
    id: "p25",
    dim: 3,
    text: "Tipo de conexión a internet que utiliza con mayor frecuencia",
    type: "single",
    options: [
      { value: "fijo_hogar", label: "Internet fijo en el hogar" },
      { value: "datos_moviles", label: "Datos móviles", risk: 1 },
      { value: "compartida", label: "Conexión compartida", risk: 1 },
      { value: "publico", label: "Acceso público (cafés internet, universidad, etc.)", risk: 2 },
      { value: "inestable", label: "Conexión inestable o intermitente", risk: 2 },
    ],
  },
  {
    id: "p26",
    dim: 3,
    text: "Dispositivo principal para estudiar",
    type: "single",
    options: [
      { value: "laptop", label: "Computadora portátil" },
      { value: "desktop", label: "Computadora de escritorio" },
      { value: "tablet", label: "Tablet/iPad" },
      { value: "celular", label: "Celular", risk: 1 },
    ],
  },
  {
    id: "p27",
    dim: 3,
    text: "¿Dispone de un espacio exclusivo con condiciones adecuadas (iluminación, comodidad y poco ruido)?",
    type: "single",
    options: [
      { value: "si", label: "Sí" },
      { value: "parcialmente", label: "Parcialmente", risk: 1 },
      { value: "no", label: "No", risk: 2 },
    ],
  },
  {
    id: "p28",
    dim: 3,
    text: "Horas promedio dedicadas al estudio semanal",
    type: "single",
    options: [
      { value: "1-5", label: "1–5", risk: 2 },
      { value: "6-10", label: "6–10", risk: 1 },
      { value: "11-20", label: "11–20" },
      { value: "20+", label: "Más de 20" },
    ],
  },
  {
    id: "p29",
    dim: 3,
    text: "¿Cómo describiría su nivel de dominio de herramientas y recursos digitales?",
    type: "single",
    options: [
      { value: "basico", label: "Básico: utilizo herramientas digitales elementales con apoyo frecuente", risk: 1 },
      { value: "intermedio", label: "Intermedio: manejo herramientas digitales de uso común de manera autónoma" },
      { value: "avanzado", label: "Avanzado: utilizo diversas herramientas digitales de forma estratégica y eficiente" },
      { value: "experto", label: "Experto: además de dominar herramientas digitales, puedo orientar o formar a otras personas en su uso" },
    ],
  },
  {
    id: "p30",
    dim: 3,
    text: "¿Tiene responsabilidades familiares de cuidado?",
    type: "single",
    options: [
      { value: "si", label: "Sí", risk: 1 },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "p31",
    dim: 3,
    text: "¿Tiene otras responsabilidades a cargo que interfieren con sus estudios?",
    type: "single",
    options: [
      { value: "si", label: "Sí", risk: 1, hasText: true, textLabel: "Otra, ¿cuál?" },
      { value: "no", label: "No" },
    ],
  },

  // ===================== DIMENSIÓN 4 =====================
  {
    id: "p32",
    dim: 4,
    text: "¿Se ha sentido apoyado/a por la institución?",
    type: "single",
    options: [
      { value: "siempre", label: "Siempre" },
      { value: "casi_siempre", label: "Casi siempre" },
      { value: "a_veces", label: "A veces", risk: 1 },
      { value: "nunca", label: "Nunca", risk: 2 },
    ],
  },
  {
    id: "p33",
    dim: 4,
    text: "Principal dificultad en la modalidad en línea",
    type: "single",
    options: [
      { value: "tiempo", label: "Organización del tiempo", risk: 1 },
      { value: "conectividad", label: "Conectividad", risk: 2 },
      { value: "tecnologia", label: "Manejo de tecnología", risk: 1 },
      { value: "financiera", label: "Capacidad financiera/económica", risk: 2 },
      { value: "carga", label: "Carga académica", risk: 1 },
      { value: "acompanamiento", label: "Falta de acompañamiento institucional", risk: 2 },
    ],
  },
  {
    id: "p34",
    dim: 4,
    text: "¿Ha pensado en abandonar la carrera?",
    type: "single",
    options: [
      { value: "nunca", label: "Nunca", risk: 0 },
      { value: "raramente", label: "Raramente", risk: 1 },
      { value: "ocasionalmente", label: "Ocasionalmente", risk: 2 },
      { value: "frecuentemente", label: "Frecuentemente", risk: 3 },
      { value: "muy_frecuentemente", label: "Muy frecuentemente", risk: 4 },
    ],
  },
  {
    id: "p35",
    dim: 4,
    text: "¿Qué factor ha sido clave para que continúe estudiando? (Puede seleccionar varias)",
    type: "multi",
    multiHint: true,
    options: [
      { value: "apoyo_familiar", label: "Apoyo familiar" },
      { value: "motivacion_personal", label: "Motivación personal" },
      { value: "superacion_personal", label: "Deseo de superación personal" },
      { value: "metas_vida", label: "Cumplimiento de metas y proyectos de vida" },
      { value: "capacidad_financiera", label: "Capacidad financiera/económica" },
      { value: "oportunidades_laborales", label: "Mejores oportunidades laborales" },
      { value: "crecimiento_profesional", label: "Crecimiento profesional" },
      { value: "apoyo_institucional", label: "Apoyo institucional" },
      { value: "subsidios", label: "Subsidios de matrículas" },
      { value: "becas", label: "Becas de estudio" },
      { value: "flexibilidad", label: "Flexibilidad de la modalidad" },
      { value: "tutorias", label: "Apoyos tutoriales sincrónicos" },
      { value: "trabajo_colaborativo", label: "Trabajo colaborativo" },
      { value: "pautas_estudio", label: "Pautas de estudio" },
      { value: "otro", label: "Otro", hasText: true },
    ],
  },
];

const DIMENSION_LABELS = {
  1: "Información sociodemográfica e intercultural",
  2: "Trayectoria académica",
  3: "Condiciones de estudio en línea",
  4: "Factores de permanencia",
};

// Las preguntas 5 y 17 y similares ya usan dependsOn; p5 depende de p4.
QUESTIONS.find((q) => q.id === "p5").dependsOn = { id: "p4", equals: "si" };

if (typeof module !== "undefined") {
  module.exports = { QUESTIONS, PROFILE, DIMENSION_LABELS };
}
