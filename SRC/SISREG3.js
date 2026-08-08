// ==UserScript==
// @name         SISREG3 - Toolkit
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Menu flutuante para copiar rapidamente o CNS do paciente dentro do SISREG3 (funciona na raiz e no /cgi-bin)
// @match        https://sisregiii.saude.gov.br/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // =========================
  // 0) TRAVA GLOBAL (ANTI-DUPLICAÇÃO)
  // =========================
  function getTopWin() {
    try {
      return window.top || window;
    } catch {
      return window;
    }
  }

  const TOP = getTopWin();

  // Se o script rodar de novo (top + iframe, ou navegação interna), não duplica UI
  if (TOP.__SISREG_TOOLKIT_LOADED__) return;
  TOP.__SISREG_TOOLKIT_LOADED__ = true;

  // =========================
  // 1) Ícones (SVG inline do Bootstrap Icons, MIT)
  // =========================
  const ICONS = {
    grip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg>',
    clipboard: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5z"/><path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5z"/><path d="M10.854 7.854a.5.5 0 0 0-.708-.708L7.5 9.793 6.354 8.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z"/></svg>',
    link: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/></svg>',
  };

  function svg(name) {
    return `<span class="svgicon">${ICONS[name]}</span>`;
  }

  // =========================
  // 2) CSS (injeta no documento do topo)
  // =========================
  const css = `
#sisreg-toolkit {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999999;
  background: #ffffff;
  border: 1px solid #e7eaf0;
  top: 25%;
  left: 80%;
  box-shadow: 0 10px 28px -8px rgba(15, 23, 42, 0.18);
  width: 200px;
  padding: 12px;
  border-radius: 16px;
  font-family: 'Poppins', Arial, sans-serif;
}
.svgicon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.svgicon svg { width: 100%; height: 100%; display: block; }
#sisreg-toolkitheader {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: move;
  padding-bottom: 9px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f0f2f6;
}
.sisreg-drag-grip { color: #c7cdd7; width: 13px; height: 13px; flex-shrink: 0; }
.sisreg-title {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #4b5563;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.action-list { display: flex; flex-direction: column; gap: 6px; }
.toolkit-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  background: #f3f5f8;
  color: #3d4650;
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  border: none;
  cursor: pointer;
  user-select: none;
  width: 100%;
  box-sizing: border-box;
  transition: background 0.12s ease, transform 0.12s ease, color 0.12s ease;
}
.toolkit-btn .svgicon { width: 16px; height: 16px; }
.toolkit-btn:hover, .toolkit-btn:focus { background: #e8ecf1; transform: translateX(1px); outline: none; }
.toolkit-btn:active { transform: translateX(0); }
.toolkit-btn-primary { background: #02a093; color: #fff; }
.toolkit-btn-primary:hover { background: #028f84; }
@keyframes toolkitCopiedPop {
  0% { transform: scale(1); }
  40% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.toolkit-btn-success {
  background: #25d366 !important;
  color: #fff !important;
  animation: toolkitCopiedPop 0.35s ease;
}
#toolkit-feedback {
  display: none;
  font-size: 11.5px;
  font-weight: 600;
  margin-top: 8px;
  text-align: left;
}
  `.trim();

  function getHostDocument() {
    try {
      return TOP.document;
    } catch {
      return document;
    }
  }

  function ensureStyle() {
    const hostDoc = getHostDocument();
    if (hostDoc.getElementById("sisreg-toolkit-style")) return;

    const styleEl = hostDoc.createElement("style");
    styleEl.id = "sisreg-toolkit-style";
    styleEl.textContent = css;
    hostDoc.head.appendChild(styleEl);
  }

  function ensureGoogleFont() {
    const hostDoc = getHostDocument();
    if (hostDoc.getElementById("sisreg-toolkit-font")) return;

    const link = hostDoc.createElement("link");
    link.id = "sisreg-toolkit-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
    hostDoc.head.appendChild(link);
  }

  // =========================
  // 3) HELPERS: IFRAME / EXTRAÇÃO
  // =========================
  function getFrameDocument() {
    // SISREG geralmente usa name="f_principal" e/ou id="f_main"
    const hostDoc = getHostDocument();
    const iframe = hostDoc.querySelector('iframe[name="f_principal"], iframe#f_main, iframe#iframePrincipal');
    if (!iframe) return hostDoc;

    try {
      return iframe.contentDocument || iframe.contentWindow?.document || hostDoc;
    } catch (e) {
      console.warn("Não foi possível acessar o documento do iframe:", e);
      return hostDoc;
    }
  }

  function extractCNS(rootDoc = document) {
    // 1) Tentativa pelo layout “FichaCompleta”
    const body = rootDoc.querySelector("tbody.FichaCompleta");
    if (body) {
      const labelRow = Array.from(body.querySelectorAll("tr")).find((tr) =>
        tr.textContent?.replace(/\s+/g, "").toUpperCase().includes("CNS:")
      );
      const valueRow = labelRow?.nextElementSibling;
      const text = valueRow?.innerText?.trim() || "";
      const digits = text.replace(/\D+/g, "");
      if (digits) return digits;
      if (text) return text;
    }

    // 2) Fallback por regex no texto todo
    const bodyText = rootDoc.body?.innerText || "";
    const match = bodyText.match(/CNS\s*:?\s*([\d\.\/\-\s]{10,})/i);
    if (match) {
      const digits = match[1].replace(/\D+/g, "");
      return digits || match[1].trim();
    }

    return "";
  }

  function extractProcedureInfo(rootDoc = document) {
    const info = {
      procedure: "",
      procedureCode: "",
      unit: "",
      dataHora: "",
      patientName: "",
    };

    const allBodies = Array.from(rootDoc.querySelectorAll("tbody"));

    function getRowTexts(row) {
      if (!row) return [];
      return Array.from(row.querySelectorAll("td")).map((td) => td.innerText.trim());
    }

    allBodies.forEach((tbody) => {
      const rows = Array.from(tbody.querySelectorAll("tr"));
      rows.forEach((row, idx) => {
        const rowText = row.innerText.replace(/\s+/g, " ").trim();
        const normalized = rowText
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase();

        if (!info.procedure && normalized.includes("procedimentos solicitados")) {
          const texts = getRowTexts(rows[idx + 1]);
          if (texts.length) {
            info.procedure = texts[0] || info.procedure;
            info.procedureCode = texts[1] || info.procedureCode;
          }
        }

        if (!info.unit && normalized.includes("unidade executante")) {
          const texts = getRowTexts(rows[idx + 1]);
          if (texts.length) {
            info.unit = texts[0] || info.unit;
          }
        }

        if (!info.dataHora && normalized.includes("data e horario de atendimento")) {
          const texts = getRowTexts(rows[idx + 1]);
          if (texts.length) {
            info.dataHora = texts[texts.length - 1] || info.dataHora;
          }
        }

        if (!info.patientName && normalized.includes("nome do paciente")) {
          const texts = getRowTexts(rows[idx + 1]);
          if (texts.length) {
            info.patientName = texts[0] || info.patientName;
          }
        }
      });
    });

    return info;
  }

  function getCurrentCNS(feedbackEl) {
    const frameDoc = getFrameDocument();
    const cns = extractCNS(frameDoc);
    if (!cns) {
      feedbackEl.style.display = "block";
      feedbackEl.style.color = "#c92a2a";
      feedbackEl.textContent = "CNS não encontrado na página.";
      return "";
    }
    return cns;
  }

  let copiedTimeout = null;
  function showCopiedState(btn) {
    if (!btn) return;
    if (!btn.dataset.originalHtml) {
      btn.dataset.originalHtml = btn.innerHTML;
    }
    clearTimeout(copiedTimeout);
    btn.classList.remove("toolkit-btn-success");
    // força reflow pra reiniciar a animação caso o usuário clique de novo rápido
    void btn.offsetWidth;
    btn.classList.add("toolkit-btn-success");
    btn.innerHTML = `${svg("check")}<span>Copiado!</span>`;
    copiedTimeout = setTimeout(() => {
      btn.classList.remove("toolkit-btn-success");
      btn.innerHTML = btn.dataset.originalHtml;
    }, 1600);
  }

  async function copyCNS(btn, feedbackEl) {
    const cns = getCurrentCNS(feedbackEl);
    if (!cns) return;

    try {
      await navigator.clipboard.writeText(cns);
      showCopiedState(btn);
      feedbackEl.style.display = "block";
      feedbackEl.style.color = "#02a093";
      feedbackEl.textContent = `CNS ${cns} copiado!`;
      setTimeout(() => (feedbackEl.style.display = "none"), 2500);
    } catch (err) {
      feedbackEl.style.display = "block";
      feedbackEl.style.color = "#c92a2a";
      feedbackEl.textContent = "Não foi possível copiar automaticamente.";
      console.error("Falha ao copiar CNS:", err);
    }
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function extractInfoWithRetry(maxAttempts = 5, delay = 400) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const info = extractProcedureInfo(getFrameDocument());
      if (info.patientName && info.procedure && info.dataHora) return info;
      if (attempt < maxAttempts - 1) await wait(delay);
    }
    return extractProcedureInfo(getFrameDocument());
  }

  async function openCelk(feedbackEl) {
    const cns = getCurrentCNS(feedbackEl);
    if (!cns) return;

    const url = new URL("https://florianopolis.celk.com.br/atendimento/recepcao/recepcao");
    url.search = "?39&cdPrg=318";
    url.search += `&autoCNS=${encodeURIComponent(cns)}`;

    const procInfo = await extractInfoWithRetry();
    if (procInfo.procedure) url.search += `&procDesc=${encodeURIComponent(procInfo.procedure)}`;
    if (procInfo.procedureCode) url.search += `&procCode=${encodeURIComponent(procInfo.procedureCode)}`;
    if (procInfo.unit) url.search += `&unitDesc=${encodeURIComponent(procInfo.unit)}`;
    if (procInfo.dataHora) url.search += `&dataHora=${encodeURIComponent(procInfo.dataHora)}`;
    if (procInfo.patientName) url.search += `&patientName=${encodeURIComponent(procInfo.patientName)}`;

    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  // =========================
  // 4) UI (sempre no topo)
  // =========================
  function bindPopupActions(popup) {
    const btnCopy = popup.querySelector("#btn-copy-cns");
    const btnOpenCelk = popup.querySelector("#btn-open-celk");
    const feedbackEl = popup.querySelector("#toolkit-feedback");

    // usa onclick para evitar duplicar listeners em reinicializações
    btnCopy.onclick = (e) => {
      e.preventDefault();
      copyCNS(btnCopy, feedbackEl);
    };

    btnOpenCelk.onclick = (e) => {
      e.preventDefault();
      openCelk(feedbackEl);
    };
  }

  function dragElement(elmnt, hostDoc) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    const header = hostDoc.getElementById(elmnt.id + "header");
    (header || elmnt).onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      hostDoc.onmouseup = closeDragElement;
      hostDoc.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elmnt.style.top = elmnt.offsetTop - pos2 + "px";
      elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
      hostDoc.onmouseup = null;
      hostDoc.onmousemove = null;
    }
  }

  function ensurePopup() {
    const hostDoc = getHostDocument();

    let popup = hostDoc.getElementById("sisreg-toolkit");
    if (popup) return popup;

    popup = hostDoc.createElement("div");
    popup.id = "sisreg-toolkit";
    popup.innerHTML = `
      <div id="sisreg-toolkitheader">
        <span class="sisreg-drag-grip">${svg("grip")}</span>
        <span class="sisreg-title">Regulação/SISREG</span>
      </div>
      <div class="action-list">
        <button type="button" class="toolkit-btn" id="btn-copy-cns">${svg("clipboard")}<span>Copiar CNS</span></button>
        <button type="button" class="toolkit-btn toolkit-btn-primary" id="btn-open-celk">${svg("link")}<span>Abrir CELK</span></button>
      </div>
      <div id="toolkit-feedback"></div>
    `;

    hostDoc.body.appendChild(popup);
    dragElement(popup, hostDoc);
    bindPopupActions(popup);
    return popup;
  }

  function init() {
    ensureGoogleFont();
    ensureStyle();
    ensurePopup();
  }

  // =========================
  // 5) INIT + REINJEÇÃO SEM DUPLICAR
  // =========================
  init();

  // Debounce para evitar spam
  let t = null;
  function scheduleReinit() {
    clearTimeout(t);
    t = setTimeout(() => {
      const hostDoc = getHostDocument();
      if (!hostDoc.getElementById("sisreg-toolkit")) init();
    }, 200);
  }

  // Quando navega por hash
  try {
    TOP.addEventListener("hashchange", scheduleReinit, true);
  } catch {}

  // Quando o DOM do topo muda (SPA / frames etc.)
  try {
    const hostDoc = getHostDocument();
    const MO = hostDoc.defaultView.MutationObserver;
    if (MO) {
      const mo = new MO(scheduleReinit);
      mo.observe(hostDoc.documentElement, { childList: true, subtree: true });
    }
  } catch {}
})();
