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
  // 1) CSS (injeta no documento do topo)
  // =========================
  const css = `
#sisreg-toolkit {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999999;
  background: linear-gradient(180deg, #ffffff, #eef3fb);
  border: 1px solid #d7e0ef;
  text-align: center;
  top: 25%;
  left: 80%;
  box-shadow: 2px 4px 16px -4px rgba(0, 0, 0, 0.45);
  min-width: 220px;
  padding: 10px;
  border-radius: 10px;
  font-family: Arial, sans-serif;
}
#sisreg-toolkitheader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  cursor: move;
  z-index: 10;
  background: #02a093;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  font-weight: bold;
  letter-spacing: 0.4px;
}
.toolkit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
  padding: 9px 12px;
  margin: 4px 0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  background: linear-gradient(135deg, #b1ffcf, #7beaa2);
  border: none;
}
.toolkit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
.toolkit-btn:active {
  transform: translateY(1px);
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

  // =========================
  // 2) HELPERS: IFRAME / EXTRAÇÃO
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

  async function copyCNS(feedbackEl) {
    const cns = getCurrentCNS(feedbackEl);
    if (!cns) return;

    try {
      await navigator.clipboard.writeText(cns);
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
  // 3) UI (sempre no topo)
  // =========================
  function bindPopupActions(popup) {
    const btnCopy = popup.querySelector("#btn-copy-cns");
    const btnOpenCelk = popup.querySelector("#btn-open-celk");
    const feedbackEl = popup.querySelector("#toolkit-feedback");

    // usa onclick para evitar duplicar listeners em reinicializações
    btnCopy.onclick = (e) => {
      e.preventDefault();
      copyCNS(feedbackEl);
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
      <div id="sisreg-toolkitheader">📌 CNS Toolkit</div>
      <button type="button" class="toolkit-btn" id="btn-copy-cns">
        <span>📋</span><span>Copiar CNS</span>
      </button>
      <button type="button" class="toolkit-btn" id="btn-open-celk">
        <span>🔗</span><span>Abrir CELK</span>
      </button>
      <div id="toolkit-feedback" style="font-size:12px;color:#02a093;margin-top:6px;display:none;"></div>
    `;

    hostDoc.body.appendChild(popup);
    dragElement(popup, hostDoc);
    bindPopupActions(popup);
    return popup;
  }

  function init() {
    ensureStyle();
    ensurePopup();
  }

  // =========================
  // 4) INIT + REINJEÇÃO SEM DUPLICAR
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
