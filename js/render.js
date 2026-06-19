/**
 * render.js
 * ------------------------------------------------------------------
 * Construye dinámicamente los slides de preguntas dentro de
 * #questionsContainer.
 * Cambios v2:
 *  - Soporte tipo "select" (lista desplegable) para años y semestres
 *  - Mensaje de ayuda en preguntas multi (multiHint)
 *  - Capitalización automática de la primera letra en texto libre
 * ------------------------------------------------------------------
 */

const Render = (() => {
  const container = () => document.getElementById("questionsContainer");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function isVisible(q, profile, answers) {
    if (q.showIf && !q.showIf(profile)) return false;
    if (q.dependsOn) {
      const dep = answers[q.dependsOn.id];
      if (q.dependsOn.equals !== undefined) {
        if (Array.isArray(dep)) {
          if (!dep.includes(q.dependsOn.equals)) return false;
        } else if (dep !== q.dependsOn.equals) {
          return false;
        }
      }
      if (q.dependsOn.notEquals !== undefined) {
        if (dep === q.dependsOn.notEquals || dep === undefined) return false;
      }
    }
    return true;
  }

  function getVisibleQuestions(profile, answers) {
    return QUESTIONS.filter((q) => isVisible(q, profile, answers));
  }

  function renderOption(q, opt, index) {
    const inputType = q.type === "multi" ? "checkbox" : "radio";
    const name = q.type === "multi" ? `${q.id}[]` : q.id;
    const inputId = `${q.id}_opt${index}`;
    return `
      <label class="option-row" data-option-row data-question="${q.id}" data-value="${escapeHtml(opt.value)}">
        <input type="${inputType}" id="${inputId}" name="${name}" value="${escapeHtml(opt.value)}" data-question="${q.id}" data-exclusive="${!!opt.exclusive}" />
        <span class="option-label">${escapeHtml(opt.label)}</span>
      </label>
      ${opt.hasText ? `<input type="text" class="option-text-input" id="${q.id}_opt${index}_text" data-question="${q.id}" data-option-text="${escapeHtml(opt.value)}" placeholder="${escapeHtml(opt.textLabel || "Especifique")}" style="display:none;" />` : ""}
    `;
  }

  function renderSelect(q) {
    return `
      <select class="q-select" id="${q.id}" data-question="${q.id}">
        <option value="">— Seleccione una opción —</option>
        ${q.options.map(opt => `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`).join("")}
      </select>
    `;
  }

  function renderLikert(q) {
    const cols = q.likertScale;
    return `
      <div class="likert-table-wrap">
        <table class="likert-table">
          <thead>
            <tr>
              <th class="likert-factor-head">Factor</th>
              ${cols.map(c => `<th>${escapeHtml(c.label)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${q.items.map(item => `
              <tr>
                <td class="likert-factor-label">${escapeHtml(item.label)}</td>
                ${cols.map(c => `
                  <td class="likert-cell">
                    <input type="radio" name="${item.id}" value="${c.value}" data-likert-item="${item.id}" data-parent="${q.id}" />
                  </td>
                `).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderQuestionBody(q) {
    if (q.type === "select") {
      return renderSelect(q);
    }
    if (q.type === "likert") {
      return renderLikert(q);
    }
    if (q.type === "single" || q.type === "multi") {
      const hint = q.multiHint
        ? `<p class="q-multi-hint">Puedes seleccionar varias opciones.</p>`
        : "";
      return `${hint}<div class="options-list" data-options-list="${q.id}">
        ${q.options.map((opt, i) => renderOption(q, opt, i)).join("")}
      </div>`;
    }
    if (q.type === "number") {
      return `<input type="number" class="q-input" id="${q.id}" data-question="${q.id}" min="${q.min || ""}" max="${q.max || ""}" placeholder="Ej. ${q.max || "2024"}" />`;
    }
    return `<input type="text" class="q-input" id="${q.id}" data-question="${q.id}" placeholder="Escriba su respuesta" />`;
  }

  function renderQuestionSlide(q, index, total) {
    const dimLabel = DIMENSION_LABELS[q.dim];
    return `
      <section class="slide" id="slide-${q.id}" data-slide="question" data-question-id="${q.id}">
        <div class="card card-wide">
          <div class="q-meta">
            <span class="q-number">${String(index + 1).padStart(2, "0")} / ${total}</span>
            <span class="q-dimension">Dimensión ${q.dim} · ${dimLabel}</span>
          </div>
          ${q.section ? `<span class="q-section-tag">${escapeHtml(q.section)}</span>` : ""}
          <p class="q-text">${escapeHtml(q.text)}</p>
          ${renderQuestionBody(q)}
          <p class="q-error" id="err-${q.id}"></p>
          <div class="nav-row">
            <button class="btn btn-ghost" data-action="prev" type="button">Anterior</button>
            <button class="btn btn-primary" data-action="next" type="button">Siguiente</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderAll(profile, answers) {
    const visible = getVisibleQuestions(profile, answers);
    const html = visible.map((q, i) => renderQuestionSlide(q, i, visible.length)).join("");
    container().innerHTML = html;
    restoreAnswers(visible, answers);
    return visible;
  }

  function restoreAnswers(visibleQuestions, answers) {
    visibleQuestions.forEach((q) => {
      const value = answers[q.id];

      if (q.type === "likert") {
        // Restaurar cada fila de la tabla likert
        q.items.forEach(item => {
          const v = answers[item.id];
          if (v) {
            const input = container().querySelector(`input[name="${item.id}"][value="${v}"]`);
            if (input) input.checked = true;
          }
        });
        return;
      }

      if (value === undefined || value === null) return;

      if (q.type === "select") {
        const sel = container().querySelector(`#${q.id}`);
        if (sel) sel.value = value;
      } else if (q.type === "single") {
        const input = container().querySelector(`input[name="${q.id}"][value="${cssEscape(value)}"]`);
        if (input) {
          input.checked = true;
          input.closest(".option-row").classList.add("is-selected");
          revealTextInputIfNeeded(q, value);
        }
      } else if (q.type === "multi" && Array.isArray(value)) {
        value.forEach((v) => {
          const input = container().querySelector(`input[name="${q.id}[]"][value="${cssEscape(v)}"]`);
          if (input) {
            input.checked = true;
            input.closest(".option-row").classList.add("is-selected");
            revealTextInputIfNeeded(q, v);
          }
        });
      } else {
        const input = container().querySelector(`#${q.id}`);
        if (input) input.value = value;
      }

      const textAnswers = answers[`${q.id}__text`] || {};
      Object.keys(textAnswers).forEach((optValue) => {
        const textInput = container().querySelector(`[data-question="${q.id}"][data-option-text="${cssEscape(optValue)}"]`);
        if (textInput) {
          textInput.value = textAnswers[optValue];
          textInput.style.display = "block";
        }
      });
    });
  }

  function revealTextInputIfNeeded(q, value) {
    const opt = q.options && q.options.find((o) => o.value === value);
    if (opt && opt.hasText) {
      const textInput = container().querySelector(`[data-question="${q.id}"][data-option-text="${cssEscape(value)}"]`);
      if (textInput) textInput.style.display = "block";
    }
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, "\\$&");
  }

  return { getVisibleQuestions, renderAll, isVisible, capitalize };
})();

if (typeof module !== "undefined") {
  module.exports = { Render };
}
