// ==UserScript==
// @name         SISREG3 - Toolkit
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Menu flutuante para copiar rapidamente o CNS do paciente dentro do SISREG3
// @match        https://sisregiii.saude.gov.br/cgi-bin/index*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

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

  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  function getFrameDocument() {
    const iframe = document.querySelector('iframe[name="f_principal"], iframe#f_main');
    if (!iframe) return document;
    try {
      return iframe.contentDocument || iframe.contentWindow?.document || document;
    } catch (e) {
      console.warn("Não foi possível acessar o documento do iframe:", e);
      return document;
    }
  }

  function ensurePopup() {
    let popup = document.getElementById("sisreg-toolkit");
    if (popup) return popup;

    popup = document.createElement("div");
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
    document.body.appendChild(popup);
    dragElement(popup);
    return popup;
  }

  function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = document.getElementById(elmnt.id + "header");
    (header || elmnt).onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function extractCNS(rootDoc = document) {
    const body = rootDoc.querySelector("tbody.FichaCompleta");
    if (body) {
      const labelRow = Array.from(body.querySelectorAll("tr")).find(tr =>
        tr.textContent?.replace(/\s+/g, "").toUpperCase().includes("CNS:")
      );
      const valueRow = labelRow?.nextElementSibling;
      const text = valueRow?.innerText?.trim() || "";
      const digits = text.replace(/\D+/g, "");
      if (digits) return digits;
      if (text) return text;
    }

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
    };

    const allBodies = Array.from(rootDoc.querySelectorAll("tbody"));

    allBodies.forEach((tbody) => {
      const rows = Array.from(tbody.querySelectorAll("tr"));
      rows.forEach((row, idx) => {
        const rowText = row.innerText.replace(/\s+/g, " ").trim();

        if (!info.procedure && rowText.includes("Procedimentos Solicitados")) {
          const next = rows[idx + 1];
          const cells = next?.querySelectorAll("td");
          if (cells?.length) {
            info.procedure = cells[0]?.innerText?.trim() || "";
            info.procedureCode = cells[3]?.innerText?.trim() || "";
          }
        }

        if (!info.unit && rowText.includes("Unidade Executante:")) {
          const next = rows[idx + 1];
          const cells = next?.querySelectorAll("td");
          if (cells?.length) {
            info.unit = cells[0]?.innerText?.trim() || "";
          }
        }

        if (!info.dataHora && rowText.includes("Data e Horário de Atendimento:")) {
          const next = rows[idx + 1];
          const cells = next?.querySelectorAll("td");
          if (cells?.length) {
            info.dataHora = cells[3]?.innerText?.trim() || "";
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

  function openCelk(feedbackEl) {
    const cns = getCurrentCNS(feedbackEl);
    if (!cns) return;
    const url = new URL("https://florianopolis.celk.com.br/atendimento/recepcao/recepcao");
    url.search = "?39&cdPrg=318";
    url.search += `&autoCNS=${encodeURIComponent(cns)}`;
    const frameDoc = getFrameDocument();
    const procInfo = extractProcedureInfo(frameDoc);
    if (procInfo.procedure) url.search += `&procDesc=${encodeURIComponent(procInfo.procedure)}`;
    if (procInfo.procedureCode) url.search += `&procCode=${encodeURIComponent(procInfo.procedureCode)}`;
    if (procInfo.unit) url.search += `&unitDesc=${encodeURIComponent(procInfo.unit)}`;
    if (procInfo.dataHora) url.search += `&dataHora=${encodeURIComponent(procInfo.dataHora)}`;
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function init() {
    const popup = ensurePopup();
    const btnCopy = popup.querySelector("#btn-copy-cns");
    const btnOpenCelk = popup.querySelector("#btn-open-celk");
    const feedbackEl = popup.querySelector("#toolkit-feedback");

    btnCopy.addEventListener("click", (e) => {
      e.preventDefault();
      copyCNS(feedbackEl);
    });

    btnOpenCelk.addEventListener("click", (e) => {
      e.preventDefault();
      openCelk(feedbackEl);
    });
  }

  init();
})();
