# Trayectorias Estudiantiles — Encuesta web

Aplicación web para recoger respuestas del instrumento **"Trayectorias Estudiantiles: Permanencia y Discontinuidad Académica"**, con consentimiento informado, lógica condicional según el perfil de cada participante, cálculo de un índice de riesgo de discontinuidad académica, y almacenamiento automático en Google Sheets.

Es una aplicación 100% estática (HTML, CSS y JavaScript puro, sin frameworks ni paso de compilación), pensada para publicarse gratuitamente en GitHub Pages.

## Antes de publicar: 3 cosas que debes revisar

| # | Qué | Dónde | Por qué |
|---|-----|-------|---------|
| 1 | Conectar tu Google Sheet | `js/config.js` → `SHEETS_WEB_APP_URL` | Sin esto, las respuestas no se guardan. Ver guía paso a paso: [`docs/CONFIGURACION_GOOGLE_SHEETS.md`](docs/CONFIGURACION_GOOGLE_SHEETS.md) |
| 2 | Tu correo/teléfono de contacto | `js/config.js` → `PROJECT_INFO.contactoCorreo` y `contactoTelefono` | Aparece en el texto de consentimiento informado para que los participantes puedan ejercer sus derechos sobre sus datos (LOPDP) |
| 3 | Revisar los pesos de riesgo | `js/questions.js` → propiedad `risk` en cada opción | Define qué tan grave es cada respuesta para el índice final. Ver sección "Cómo funciona el índice de riesgo" más abajo |

Mientras el punto 1 no esté configurado, el formulario funcionará con normalidad pero mostrará un mensaje de error al intentar enviarlo (a propósito, para que no pierdas datos sin darte cuenta).

## Estructura del proyecto

```
trayectorias-app/
├── index.html                  Estructura general de la app (portada, consentimiento, preguntas, resultado)
├── css/
│   └── styles.css              Todos los estilos visuales
├── js/
│   ├── config.js               ⚙️ EDITA AQUÍ: URL de Sheets y datos de contacto
│   ├── questions.js             ⚙️ EDITA AQUÍ: preguntas, opciones y pesos de riesgo
│   ├── scoring.js               Motor de cálculo del índice de riesgo
│   ├── consent.js               Texto del consentimiento informado
│   ├── render.js                Construye las preguntas dinámicamente en pantalla
│   └── app.js                   Lógica de navegación, validación y envío
├── google-apps-script/
│   └── Código.gs                Código a pegar en Google Apps Script (ver guía)
└── docs/
    └── CONFIGURACION_GOOGLE_SHEETS.md   Guía paso a paso con instrucciones detalladas
```

## Cómo funciona el flujo del formulario

1. **Portada** con información general y duración estimada.
2. **Consentimiento informado**, redactado conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP). El participante debe marcar 4 casillas de conformidad antes de continuar, o puede declinar participar.
3. **Preguntas**, una por pantalla, con desplazamiento tipo "una tarjeta a la vez" (`scroll-snap`), pensado especialmente para uso en celular.
4. **Selector de perfil** (pregunta "Estado académico actual"): según si la persona responde Activo, Graduado, Retirado o En interrupción, el formulario muestra automáticamente solo las preguntas relevantes para ese perfil, ocultando el resto.
5. **Revisión final**, donde se le indica al participante si quedó alguna pregunta obligatoria sin responder.
6. **Envío** a Google Sheets.
7. **Pantalla de resultado**, donde se muestra el índice de riesgo calculado (ver más abajo) — esto es informativo para el equipo de investigación, no constituye una evaluación individual del participante.

## Cómo funciona el índice de riesgo ("baremo")

El instrumento original no incluye una escala Likert, así que se diseñó un sistema de puntaje propio y totalmente editable:

- Cada opción de respuesta relevante a la permanencia académica tiene asignado un peso de riesgo (`risk`) en `js/questions.js`, de 0 (sin riesgo) a 4 (riesgo muy alto).
- Al finalizar el formulario, se suman los pesos de todas las respuestas dadas y se comparan contra el máximo puntaje posible **para las preguntas que efectivamente se mostraron a esa persona** (así, alguien que ve menos preguntas por su perfil no queda artificialmente con menor riesgo).
- El resultado se expresa en una escala de 0 a 100 y se clasifica en 4 niveles: **Bajo**, **Medio**, **Alto** y **Muy alto**.

### Para ajustar los pesos de riesgo

Abre `js/questions.js` y modifica el número en cualquier propiedad `risk` de cualquier opción, por ejemplo:

```js
{ value: "muy_frecuentemente", label: "Muy frecuentemente", risk: 4 },
```

Subir ese número hace que esa respuesta pese más en el índice final; bajarlo (o quitarlo) la hace pesar menos o nada. No es necesario tocar ningún otro archivo.

### Para ajustar los niveles (Bajo/Medio/Alto/Muy alto)

Abre `js/scoring.js` y modifica los valores `max` dentro de `RISK_LEVELS`:

```js
const RISK_LEVELS = [
  { max: 25, level: "Bajo", ... },
  { max: 50, level: "Medio", ... },
  { max: 75, level: "Alto", ... },
  { max: 100.01, level: "Muy alto", ... },
];
```

## Cómo agregar, quitar o modificar preguntas

Todo el contenido del cuestionario vive en `js/questions.js`, como una lista de objetos. Cada pregunta tiene esta forma general:

```js
{
  id: "p8",                 // identificador único, se usa como nombre de columna en Sheets
  dim: 1,                   // a qué dimensión (1-4) pertenece, solo afecta la etiqueta visual
  text: "Texto de la pregunta...",
  type: "single",           // "single" (una opción), "multi" (varias), "text" o "number"
  options: [
    { value: "opcion_a", label: "Texto que ve el usuario", risk: 2 },
    ...
  ],
}
```

Para que una pregunta solo aparezca para ciertos perfiles, se usa `showIf`:

```js
showIf: (perfil) => perfil === PROFILE.RETIRADO,
```

Para que una pregunta dependa de la respuesta a otra (por ejemplo, "¿cuántos hijos tiene?" solo si "¿tiene hijos?" fue "Sí"):

```js
dependsOn: { id: "p4", equals: "si" },
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público o privado; GitHub Pages funciona en ambos casos si tienes una cuenta con ese plan habilitado).
2. Sube todo el contenido de esta carpeta al repositorio.
3. En GitHub, ve a **Settings** → **Pages**.
4. En "Source", elige la rama `main` (o la que uses) y la carpeta `/ (root)`.
5. Guarda. GitHub te dará una URL pública, normalmente con este formato:

   ```
   https://tu-usuario.github.io/nombre-del-repositorio/
   ```

6. Esa es la URL que puedes compartir con los participantes del estudio.

Ten en cuenta que GitHub Pages puede tardar uno o dos minutos en publicar los cambios la primera vez, y cada vez que actualices el contenido del repositorio.

## Privacidad y protección de datos

- El formulario **no recoge nombres, cédulas ni datos de contacto directo** de los participantes.
- El texto de consentimiento informado (en `js/consent.js`) está redactado conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP), e incluye los derechos ARCO+ (acceso, rectificación, eliminación, oposición, portabilidad, limitación, y no ser objeto de decisiones automatizadas).
- El índice de riesgo se calcula en el propio navegador del participante (no en un servidor), y se envía junto con el resto de las respuestas únicamente para uso agregado del equipo de investigación.
- Recuerda completar tus datos de contacto en `config.js` para que los participantes puedan ejercer sus derechos sobre sus datos.

## Soporte técnico básico

Si necesitas hacer cambios y no tienes experiencia previa con código:

- Cambios de texto (preguntas, opciones, consentimiento) son seguros de editar directamente en los archivos `.js` mencionados arriba, siempre dentro de las comillas `"..."`.
- Evita borrar comas, comillas o llaves `{ }` al editar, ya que esto puede romper el formulario.
- Después de cualquier cambio, abre `index.html` en tu navegador (o la URL publicada) para confirmar que todo sigue funcionando antes de compartirlo con los participantes.
