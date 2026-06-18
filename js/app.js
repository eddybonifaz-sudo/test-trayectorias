/**
 * app.js
 * ------------------------------------------------------------------
 * Orquestador principal: maneja el estado de las respuestas, el
 * scroll-snap entre preguntas, la validación, el cálculo del baremo
 * y el envío a Google Sheets vía Apps Script.
 * ------------------------------------------------------------------
 */

(function () {
  "use strict";

  const state = {
    answers: {},      // { questionId: value | value[] }
    textAnswers: {},  // { questionId: { optionValue: freeText } }
    profile: null,
    visibleQuestions: [],
    consentGiven: false,
    submitted: false,
  };

  const scrollContainer = document.getElementById("scrollContainer");
  const progressFill = document.getElementById("progressFill");
  const scrollHint = document.getElementById("scrollHint");

  // ---------------------------------------------------------------
  // Inicialización
  // ---------------------------------------------------------------
  function init() {
    document.getElementById("introDuracion").textContent = APP_CONFIG.PROJECT_INFO.duracionEstimada;
    document.getElementById("introMeta").textContent = `${APP_CONFIG.PROJECT_INFO.instituciones}`;
    document.getElementById("consentText").innerHTML = buildConsentHTML();

    bindIntro();
    bindConsent();
    bindGlobalNav();
    observeScroll();
  }

  // ---------------------------------------------------------------
  // Slide: Intro
  // ---------------------------------------------------------------
  function bindIntro() {
    document.getElementById("btnStart").addEventListener("click", () => {
      goToSlide("slide-consent");
    });
  }

  // ---------------------------------------------------------------
  // Slide: Consentimiento
  // ---------------------------------------------------------------
  function bindConsent() {
    const checks = ["chkProposito", "chkVoluntario", "chkDatos", "chkEdad"].map((id) =>
      document.getElementById(id)
    );
    const btnAccept = document.getElementById("btnAcceptConsent");
    const consentError = document.getElementById("consentError");

    function updateAcceptState() {
      const allChecked = checks.every((c) => c.checked);
      btnAccept.disabled = !allChecked;
      if (allChecked) consentError.classList.remove("is-visible");
    }

    checks.forEach((c) => c.addEventListener("change", updateAcceptState));

    btnAccept.addEventListener("click", () => {
      if (checks.every((c) => c.checked)) {
        state.consentGiven = true;
        startQuestionnaire();
      } else {
        consentError.textContent = "Debes aceptar todas las condiciones para continuar.";
        consentError.classList.add("is-visible");
      }
    });

    document.getElementById("btnDeclineConsent").addEventListener("click", () => {
      document.getElementById("slide-declined").hidden = false;
      goToSlide("slide-declined");
    });
  }

  // ---------------------------------------------------------------
  // Construcción inicial del cuestionario
  // ---------------------------------------------------------------
  function startQuestionnaire() {
    state.visibleQuestions = Render.renderAll(state.profile, state.answers);
    bindQuestionInputs();
    requestAnimationFrame(() => goToSlide(`slide-${state.visibleQuestions[0].id}`));
  }

  /**
   * Reconstruye el conjunto de preguntas visibles (cuando cambia el
   * perfil en P14 o una respuesta de la que depende otra pregunta,
   * p.ej. P4 -> P5, P16 -> P17, P21 -> P22).
   * Conserva la posición relativa del usuario cuando es posible.
   */
  function rebuildQuestions(currentQuestionId) {
    state.visibleQuestions = Render.renderAll(state.profile, state.answers);
    bindQuestionInputs();
    const stillExists = state.visibleQuestions.find((q) => q.id === currentQuestionId);
    const targetId = stillExists ? currentQuestionId : (state.visibleQuestions[0] && state.visibleQuestions[0].id);
    if (targetId) {
      const el = document.getElementById(`slide-${targetId}`);
      if (el) el.scrollIntoView({ block: "start" });
    }
  }

  // ---------------------------------------------------------------
  // Inputs de preguntas: selección, texto libre, validación inline
  // ---------------------------------------------------------------
  function bindQuestionInputs() {
    const container = document.getElementById("questionsContainer");

    container.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((input) => {
      input.addEventListener("change", (e) => onOptionChange(e, input));
    });

    container.querySelectorAll('input[type="text"].q-input, input[type="number"].q-input').forEach((input) => {
      input.addEventListener("input", () => {
        state.answers[input.dataset.question] = input.value;
      });
    });

    container.querySelectorAll(".option-text-input").forEach((input) => {
      input.addEventListener("input", () => {
        const qId = input.dataset.question;
        const optValue = input.dataset.optionText;
        if (!state.textAnswers[qId]) state.textAnswers[qId] = {};
        state.textAnswers[qId][optValue] = input.value;
        state.answers[`${qId}__text`] = state.textAnswers[qId];
      });
    });

    container.querySelectorAll('[data-action="next"]').forEach((btn) => {
      btn.addEventListener("click", () => handleNext(btn));
    });
    container.querySelectorAll('[data-action="prev"]').forEach((btn) => {
      btn.addEventListener("click", () => handlePrev(btn));
    });
  }

  function onOptionChange(e, input) {
    const qId = input.dataset.question;
    const question = QUESTIONS.find((q) => q.id === qId);
    const row = input.closest(".option-row");

    if (input.type === "radio") {
      document.querySelectorAll(`.option-row[data-question="${qId}"]`).forEach((r) => r.classList.remove("is-selected"));
      row.classList.add("is-selected");
      state.answers[qId] = input.value;
      toggleTextInput(question, input.value, true);
    } else {
      if (input.dataset.exclusive === "true" && input.checked) {
        document.querySelectorAll(`input[name="${qId}[]"]`).forEach((other) => {
          if (other !== input) {
            other.checked = false;
            other.closest(".option-row").classList.remove("is-selected");
          }
        });
      } else if (input.checked) {
        document.querySelectorAll(`input[name="${qId}[]"][data-exclusive="true"]`).forEach((excl) => {
          excl.checked = false;
          excl.closest(".option-row").classList.remove("is-selected");
        });
      }

      row.classList.toggle("is-selected", input.checked);
      const checked = Array.from(document.querySelectorAll(`input[name="${qId}[]"]:checked`)).map((i) => i.value);
      state.answers[qId] = checked;
      toggleTextInput(question, input.value, input.checked);
    }

    if (question.isProfileSelector) {
      state.profile = input.value;
      rebuildQuestions(qId);
      return;
    }
    if (hasDependents(qId)) {
      rebuildQuestions(qId);
    }

    clearError(qId);
  }

  function toggleTextInput(question, optionValue, show) {
    const opt = question.options && question.options.find((o) => o.value === optionValue);
    if (!opt || !opt.hasText) return;
    const textInput = document.querySelector(`[data-question="${question.id}"][data-option-text="${optionValue}"]`);
    if (textInput) {
      textInput.style.display = show ? "block" : "none";
      if (!show) textInput.value = "";
    }
  }

  function hasDependents(questionId) {
    return QUESTIONS.some((q) => q.dependsOn && q.dependsOn.id === questionId);
  }

  // ---------------------------------------------------------------
  // Validación y navegación pregunta-a-pregunta
  // ---------------------------------------------------------------
  function validateQuestion(q) {
    const value = state.answers[q.id];
    if (q.type === "multi") {
      if (!Array.isArray(value) || value.length === 0) return "Selecciona al menos una opción.";
    } else if (q.type === "number") {
      if (value === undefined || value === null || value === "") return "Este campo es obligatorio.";
      const num = Number(value);
      if (Number.isNaN(num)) return "Ingresa un número válido.";
      if (q.min && num < q.min) return `El valor debe ser mayor o igual a ${q.min}.`;
      if (q.max && num > q.max) return `El valor debe ser menor o igual a ${q.max}.`;
    } else {
      if (value === undefined || value === null || String(value).trim() === "") return "Este campo es obligatorio.";
    }
    return null;
  }

  function showError(qId, message) {
    const el = document.getElementById(`err-${qId}`);
    if (el) el.textContent = message || "";
  }
  function clearError(qId) {
    showError(qId, "");
  }

  function handleNext(btn) {
    const slide = btn.closest(".slide");
    const qId = slide.dataset.questionId;
    const question = QUESTIONS.find((q) => q.id === qId);
    const error = validateQuestion(question);

    if (error) {
      showError(qId, error);
      return;
    }
    clearError(qId);

    const idx = state.visibleQuestions.findIndex((q) => q.id === qId);
    const next = state.visibleQuestions[idx + 1];
    if (next) {
      goToSlide(`slide-${next.id}`);
    } else {
      goToReview();
    }
  }

  function handlePrev(btn) {
    const slide = btn.closest(".slide");
    const qId = slide.dataset.questionId;
    const idx = state.visibleQuestions.findIndex((q) => q.id === qId);
    if (idx === 0) {
      goToSlide("slide-consent");
    } else {
      goToSlide(`slide-${state.visibleQuestions[idx - 1].id}`);
    }
  }

  // ---------------------------------------------------------------
  // Revisión final y envío
  // ---------------------------------------------------------------
  function goToReview() {
    const missing = state.visibleQuestions.filter((q) => validateQuestion(q));
    const reviewSummary = document.getElementById("reviewSummary");

    if (missing.length > 0) {
      reviewSummary.innerHTML = `
        <p class="error-text is-visible">Tienes ${missing.length} pregunta(s) sin responder. Vuelve a revisar antes de enviar.</p>
        ${missing.map((q) => `<div class="review-item is-missing">${escapeHtml(q.text)}</div>`).join("")}
      `;
    } else {
      reviewSummary.innerHTML = `<p>Has respondido todas las preguntas requeridas (${state.visibleQuestions.length} de ${state.visibleQuestions.length}). Puedes enviar tus respuestas.</p>`;
    }

    document.getElementById("slide-review").hidden = false;
    goToSlide("slide-review");
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function bindGlobalNav() {
    document.getElementById("btnBackToForm").addEventListener("click", () => {
      const last = state.visibleQuestions[state.visibleQuestions.length - 1];
      if (last) goToSlide(`slide-${last.id}`);
    });
    document.getElementById("btnSubmit").addEventListener("click", submitForm);
  }

  async function submitForm() {
    const missing = state.visibleQuestions.filter((q) => validateQuestion(q));
    const submitError = document.getElementById("submitError");
    const submitStatus = document.getElementById("submitStatus");
    const btnSubmit = document.getElementById("btnSubmit");

    if (missing.length > 0) {
      submitError.textContent = "Aún hay preguntas obligatorias sin responder.";
      submitError.classList.add("is-visible");
      return;
    }
    submitError.classList.remove("is-visible");

    const barema = computeBarema(state.answers, state.visibleQuestions);
    const payload = buildPayload(barema);

    btnSubmit.disabled = true;
    submitStatus.innerHTML = '<span class="spinner"></span> Enviando respuestas…';

    try {
      await sendToSheets(payload);
      submitStatus.textContent = "";
      showResult(barema);
    } catch (err) {
      console.error("Error al enviar:", err);
      submitStatus.textContent = "";
      submitError.textContent = "No se pudo enviar el formulario. Verifica tu conexión a internet e inténtalo de nuevo.";
      submitError.classList.add("is-visible");
      btnSubmit.disabled = false;
    }
  }

  function buildPayload(barema) {
    const flatAnswers = {};
    QUESTIONS.forEach((q) => {
      const v = state.answers[q.id];
      flatAnswers[q.id] = Array.isArray(v) ? v.join("; ") : (v ?? "");
    });
    const flatTextAnswers = {};
    Object.keys(state.textAnswers).forEach((qId) => {
      flatTextAnswers[`${qId}_otro_texto`] = Object.values(state.textAnswers[qId]).join("; ");
    });

    return {
      timestamp: new Date().toISOString(),
      perfil: state.profile,
      ...flatAnswers,
      ...flatTextAnswers,
      indice_riesgo: barema.normalized,
      nivel_riesgo: barema.level.level,
      puntaje_crudo: barema.raw,
      puntaje_maximo: barema.max,
    };
  }

  async function sendToSheets(payload) {
    if (!APP_CONFIG.SHEETS_WEB_APP_URL || APP_CONFIG.SHEETS_WEB_APP_URL.includes("REEMPLAZAR")) {
      throw new Error("SHEETS_WEB_APP_URL no configurada. Revisa js/config.js");
    }
    // Apps Script Web Apps no maneja bien preflight CORS con
    // application/json desde fetch en todos los casos; usamos
    // 'text/plain' como content-type para evitar el preflight, y el
    // propio Apps Script parsea el body como JSON (ver doGet/doPost).
    const response = await fetch(APP_CONFIG.SHEETS_WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Respuesta del servidor: ${response.status}`);
    }
    return response.json().catch(() => ({}));
  }

  function showResult(barema) {
    state.submitted = true;
    document.getElementById("resultLevel").textContent = barema.level.level;
    document.getElementById("resultLevel").style.color = barema.level.color;
    document.getElementById("resultScore").textContent = `Índice: ${barema.normalized} / 100`;
    document.getElementById("resultDesc").textContent = barema.level.description;

    const fill = document.getElementById("resultBarFill");
    fill.style.background = barema.level.color;

    document.getElementById("slide-result").hidden = false;
    goToSlide("slide-result");

    requestAnimationFrame(() => {
      setTimeout(() => {
        fill.style.width = `${barema.normalized}%`;
      }, 150);
    });
  }

  // ---------------------------------------------------------------
  // Navegación / scroll-snap
  // ---------------------------------------------------------------
  function goToSlide(id) {
    const el = document.getElementById(id);
    if (el) {
      el.hidden = false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function observeScroll() {
    let hinted = false;
    scrollContainer.addEventListener(
      "scroll",
      () => {
        if (!hinted) {
          hinted = true;
          scrollHint.classList.add("is-hidden");
        }
        updateProgress();
      },
      { passive: true }
    );
    setTimeout(() => scrollHint.classList.add("is-hidden"), 6000);
  }

  function updateProgress() {
    const slides = Array.from(document.querySelectorAll(".slide")).filter((s) => !s.hidden);
    if (slides.length === 0) return;
    const containerRect = scrollContainer.getBoundingClientRect();
    let currentIndex = 0;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.top - containerRect.top < containerRect.height / 2) currentIndex = i;
    });
    const pct = slides.length > 1 ? (currentIndex / (slides.length - 1)) * 100 : 0;
    progressFill.style.width = `${pct}%`;
  }

  document.addEventListener("DOMContentLoaded", init);
})();
