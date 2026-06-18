# Configurar el almacenamiento en Google Sheets

Esta guía explica cómo conectar el formulario a una hoja de Google Sheets usando Google Apps Script, sin necesidad de programar nada adicional ni pagar por un backend.

## Resumen del proceso

1. Crear una hoja de Google Sheets nueva.
2. Pegar el código ya preparado (`google-apps-script/Código.gs`) en el editor de Apps Script de esa hoja.
3. Publicar ese código como una "Aplicación web" y copiar la URL que te entrega Google.
4. Pegar esa URL en `js/config.js`.

Una vez hecho esto, cada vez que alguien complete el formulario, se agregará automáticamente una fila nueva en tu hoja de cálculo.

---

## Paso 1 — Crear la hoja de Google Sheets

1. Ve a [sheets.google.com](https://sheets.google.com) e inicia sesión con tu cuenta de Google (la misma que uses para Drive/Gmail).
2. Crea una hoja de cálculo nueva en blanco.
3. Ponle un nombre claro, por ejemplo: `Respuestas - Trayectorias Estudiantiles`.

No necesitas crear columnas ni encabezados manualmente: el script los genera automáticamente la primera vez que alguien envíe el formulario.

## Paso 2 — Abrir el editor de Apps Script

1. Con la hoja abierta, ve al menú **Extensiones** → **Apps Script**.
2. Se abrirá una nueva pestaña con el editor de código (puede aparecer un archivo llamado `Código.gs` ya creado, vacío o con una función de ejemplo).
3. Borra todo el contenido que aparezca por defecto en `Código.gs`.
4. Abre el archivo `google-apps-script/Código.gs` de este proyecto, copia **todo** su contenido, y pégalo en el editor de Apps Script.
5. Guarda el proyecto (icono de disquete o `Ctrl/Cmd + S`). Puedes ponerle un nombre al proyecto, por ejemplo "Backend Trayectorias".

## Paso 3 — Publicar como aplicación web

1. En la esquina superior derecha, haz clic en el botón azul **Implementar** → **Nueva implementación**.
2. Junto a "Selecciona el tipo", haz clic en el ícono de engranaje ⚙️ y elige **Aplicación web**.
3. Completa los campos:
   - **Descripción**: algo como "Recepción de respuestas del formulario".
   - **Ejecutar como**: *Yo* (tu propia cuenta de Google).
   - **Quién tiene acceso**: **Cualquier usuario**. Esto es necesario para que el formulario pueda enviar datos sin que cada persona encuestada necesite una cuenta de Google. (Tus datos siguen seguros: solo se puede *enviar* información a este endpoint, nadie puede leer tu hoja de cálculo a través de él).
4. Haz clic en **Implementar**.
5. Google te pedirá autorizar permisos la primera vez:
   - Si aparece una pantalla de advertencia ("Esta app no está verificada"), es normal porque es un script personal tuyo, no de un tercero. Haz clic en **Avanzado** (o "Configuración avanzada") y luego en **Ir a [nombre del proyecto] (no seguro)**, y concede los permisos solicitados (acceso a tus hojas de cálculo).
6. Cuando termine, Google te mostrará una **URL de la aplicación web**. Tendrá un formato similar a:

   ```
   https://script.google.com/macros/s/AKfycb........................../exec
   ```

7. Copia esa URL completa (debe terminar exactamente en `/exec`).

## Paso 4 — Conectar la URL con el formulario

1. Abre el archivo `js/config.js` de este proyecto.
2. Busca la línea:

   ```js
   SHEETS_WEB_APP_URL: "https://script.google.com/macros/s/REEMPLAZAR_CON_TU_ID/exec",
   ```

3. Reemplaza ese valor completo por la URL que copiaste en el paso anterior.
4. Guarda el archivo.

¡Listo! Ahora, cada vez que alguien complete y envíe el formulario, aparecerá una fila nueva en la hoja "Respuestas" de tu Google Sheet, con todas las respuestas y el índice de riesgo calculado.

---

## Muy importante: actualizar el script en el futuro

Si en algún momento modificas el archivo `Código.gs` (por ejemplo, para agregar alguna validación adicional), **no basta con guardar el archivo**. Apps Script requiere que crees una **nueva versión** de la implementación para que los cambios surtan efecto en la URL pública:

1. Ve a **Implementar** → **Gestionar implementaciones**.
2. Haz clic en el ícono de lápiz (editar) junto a tu implementación activa.
3. En "Versión", selecciona **Nueva versión**.
4. Haz clic en **Implementar**.

La URL `/exec` no cambia, así que no necesitas tocar `config.js` de nuevo, solo repetir este paso cada vez que edites el script.

## Verificar que funciona

Para probar que todo está conectado correctamente:

1. Publica el formulario (ver el `README.md` principal para las instrucciones de GitHub Pages) o ábrelo localmente.
2. Complétalo de principio a fin con respuestas de prueba.
3. Revisa tu Google Sheet: debería aparecer una fila nueva con esas respuestas, incluyendo las columnas `indice_riesgo`, `nivel_riesgo`, `puntaje_crudo` y `puntaje_maximo` al final.

Si el formulario muestra un mensaje de error al enviar, revisa:
- Que la URL en `config.js` termine en `/exec` y no tenga espacios ni texto adicional.
- Que la implementación tenga el acceso configurado como "Cualquier usuario".
- Que hayas creado una nueva versión si editaste el script después de la primera implementación.
