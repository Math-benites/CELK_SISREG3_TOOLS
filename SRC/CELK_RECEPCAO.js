// ==UserScript==
// @name         CELK Recepção - Auto CNS
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Automatiza busca por CNS e adiciona atalho de WhatsApp na recepção
// @match        https://florianopolis.celk.com.br/atendimento/recepcao/recepcao*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const autoCNS = params.get("autoCNS");
  const procDesc = params.get("procDesc") || "";
  const procCode = params.get("procCode") || "";
  const unitDesc = params.get("unitDesc") || "";
  const dataHora = params.get("dataHora") || "";
  const patientNameParam = (params.get("patientName") || "").trim();

  let alreadyProcessed = false;
  let selectedPatientName = patientNameParam;
  let lastContactValue = "";
  let lastPhones = [];

  // ---------- Ícones (SVG inline do Bootstrap Icons, MIT) ----------
  const ICONS = {
    grip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg>',
    whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>',
    refresh: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/></svg>',
    chevron: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/></svg>',
  };

  function svg(name) {
    return `<span class="svgicon">${ICONS[name]}</span>`;
  }

  function ensureGoogleFont() {
    if (document.getElementById("celk-recepcao-font")) return;
    const link = document.createElement("link");
    link.id = "celk-recepcao-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }

  ensureGoogleFont();

  const css = `
#celk-recepcao-toolkit {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999999;
  background: #ffffff;
  border: 1px solid #e7eaf0;
  top: 30%;
  left: 78%;
  box-shadow: 0 10px 28px -8px rgba(15, 23, 42, 0.18);
  width: 216px;
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
#celk-recepcao-toolkitheader {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: move;
  padding-bottom: 9px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f0f2f6;
}
.rc-drag-grip { color: #c7cdd7; width: 13px; height: 13px; flex-shrink: 0; }
.rc-title {
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
.celk-recepcao-loader {
  display: none;
  font-size: 11.5px;
  font-weight: 500;
  color: #02a093;
  margin-bottom: 8px;
  text-align: left;
}
.action-list { display: flex; flex-direction: column; gap: 6px; }
.action-item {
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
.action-item .svgicon { width: 16px; height: 16px; }
.action-item:hover, .action-item:focus { background: #e8ecf1; transform: translateX(1px); outline: none; }
.action-item:active { transform: translateX(0); }
.action-item-primary { background: #25d366; color: #fff; }
.action-item-primary:hover { background: #1fbd59; }
.action-item[disabled] { opacity: 0.5; cursor: not-allowed; transform: none !important; }
.combo { position: relative; margin-bottom: 6px; }
.combo-trigger {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #e2e6ed;
  border-radius: 9px;
  background: #fafbfc;
  color: #333;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.12s ease;
}
.combo-trigger:hover, .combo-trigger:focus { border-color: #c7cdd7; outline: none; }
.combo.open .combo-trigger { border-color: #02a093; }
.combo.disabled .combo-trigger { cursor: not-allowed; color: #9aa5b5; }
.combo-trigger-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.combo-chevron { color: #9aa5b5; width: 13px; height: 13px; flex-shrink: 0; transition: transform 0.12s ease; }
.combo-chevron svg { width: 100%; height: 100%; display: block; }
.combo.open .combo-chevron { transform: rotate(180deg); }
.combo-list {
  display: none;
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e7eaf0;
  border-radius: 10px;
  box-shadow: 0 10px 28px -8px rgba(15, 23, 42, 0.25);
  padding: 4px;
  max-height: 160px;
  overflow-y: auto;
  z-index: 20;
}
.combo.open .combo-list { display: block; }
.combo-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 7px 8px;
  border-radius: 7px;
  font-size: 12.5px;
  color: #3d4650;
  cursor: pointer;
  user-select: none;
}
.combo-option:hover, .combo-option:focus { background: #f3f5f8; outline: none; }
.combo-option.selected { background: #e6f7f5; color: #02a093; font-weight: 600; }
.combo-option .svgicon { width: 13px; height: 13px; color: #02a093; }
  `.trim();

  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

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

  // Dropdown customizado por cima do <select> nativo (escondido), pra não
  // depender do estilo padrão do navegador (inclusive o azul de hover nas opções).
  function setupCombo(popup, selectEl) {
    const combo = popup.querySelector("#celk-recepcao-combo");
    const trigger = popup.querySelector("#celk-recepcao-combo-trigger");
    const label = trigger.querySelector(".combo-trigger-label");
    const list = popup.querySelector("#celk-recepcao-combo-list");

    const abrir = () => { if (!selectEl.disabled) combo.classList.add("open"); };
    const fechar = () => combo.classList.remove("open");

    function render() {
      combo.classList.toggle("disabled", !!selectEl.disabled);
      list.innerHTML = "";

      Array.from(selectEl.options).forEach(opt => {
        const item = document.createElement("div");
        const selecionado = opt.value === selectEl.value;
        item.className = "combo-option" + (selecionado ? " selected" : "");
        item.tabIndex = 0;

        const textoSpan = document.createElement("span");
        textoSpan.textContent = opt.text;
        item.appendChild(textoSpan);
        if (selecionado) item.insertAdjacentHTML("beforeend", svg("check"));

        item.addEventListener("click", () => {
          if (selectEl.disabled) return;
          selectEl.value = opt.value;
          selectEl.dispatchEvent(new Event("change", { bubbles: true }));
          render();
          fechar();
        });

        list.appendChild(item);
      });

      const selectedOption = selectEl.options[selectEl.selectedIndex];
      label.textContent = selectedOption ? selectedOption.text : "Selecione um contato";
    }

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      combo.classList.contains("open") ? fechar() : abrir();
    });

    document.addEventListener("click", (e) => {
      if (!combo.contains(e.target)) fechar();
    });

    render();
    return render;
  }

  function ensurePopup() {
    let popup = document.getElementById("celk-recepcao-toolkit");
    if (popup) return popup;

    popup = document.createElement("div");
    popup.id = "celk-recepcao-toolkit";
    popup.innerHTML = `
      <div id="celk-recepcao-toolkitheader">
        <span class="rc-drag-grip">${svg("grip")}</span>
        <span class="rc-title">WhatsApp</span>
      </div>
      <div class="celk-recepcao-loader" id="celk-recepcao-loader">Atualizando contatos...</div>
      <div class="action-list">
        <button type="button" class="action-item" id="celk-recepcao-refresh">${svg("refresh")}<span>Atualizar contatos</span></button>
      </div>
      <select id="celk-recepcao-select" style="display:none;">
        <option value="">Clique em "Atualizar contatos"</option>
      </select>
      <div class="combo" id="celk-recepcao-combo">
        <button type="button" class="combo-trigger" id="celk-recepcao-combo-trigger">
          <span class="combo-trigger-label">Clique em "Atualizar contatos"</span>
          <span class="combo-chevron">${ICONS.chevron}</span>
        </button>
        <div class="combo-list" id="celk-recepcao-combo-list"></div>
      </div>
      <div class="action-list">
        <button type="button" class="action-item action-item-primary" id="celk-recepcao-open">${svg("whatsapp")}<span>Enviar Mensagem</span></button>
      </div>
    `;
    document.body.appendChild(popup);
    const select = popup.querySelector("#celk-recepcao-select");
    if (select) select.dataset.loaded = "false";
    dragElement(popup);
    popup._renderCombo = setupCombo(popup, select);
    return popup;
  }

  function waitForElement(selector, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(timer);
          reject(new Error(`Elemento não encontrado: ${selector}`));
        }
      }, 150);
    });
  }

  function waitForResultRow(timeout = 8000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const loop = () => {
        const table = document.querySelector('table[wicketpath="panelContainer_nodePanel_form_table_table"]');
        if (table) {
          const rows = Array.from(table.querySelectorAll("tbody tr")).filter(
            (tr) => !tr.querySelector(".dataTables_empty")
          );
          if (rows.length) {
            resolve(rows[0]);
            return;
          }
        }

        if (Date.now() - start > timeout) {
          reject(new Error("Nenhum resultado na tabela de pacientes."));
          return;
        }
        setTimeout(loop, 200);
      };
      loop();
    });
  }

  function typeText(input, text) {
    input.focus();
    input.value = text;
    input.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true, data: text }));
    input.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  function triggerClick(el) {
    if (!el) return false;
    ["mousedown", "mouseup", "click"].forEach(type => {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    });
    return true;
  }

  function extractPhones() {
    const input = document.querySelector('input[wicketpath="panelContainer_nodePanel_form_panelInformacoesPaciente_container_usuarioCadsus.telefonesCelularFormatado"]');
    const raw = input?.value?.trim();
    lastContactValue = raw || "";
    if (!raw) return [];
    const matches = raw.split(/[/|]/).map(str => str.trim()).filter(Boolean);
    const phones = [];
    const seen = new Set();
    matches.forEach(label => {
      const digits = (label.match(/\d+/g) || []).join("");
      if (!digits || seen.has(digits)) return;
      seen.add(digits);
      phones.push({ label, digits });
    });
    lastPhones = phones.length ? phones : lastPhones;
    return phones;
  }

  function formatPhone(digits) {
    if (!digits) return "";
    let phone = digits.replace(/\D+/g, "");
    if (phone.length <= 11 && !phone.startsWith("55")) {
      phone = "55" + phone;
    }
    return phone;
  }

  function getPatientNameFallback() {
    if (selectedPatientName) return selectedPatientName;
    const table = document.querySelector('table[wicketpath="panelContainer_nodePanel_form_table_table"]');
    if (table) {
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      const dataRows = rows.filter(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 3) return false;
        if (cells[0].classList.contains("dataTables_empty")) return false;
        return true;
      });

      const selectedRow = dataRows.find(row => row.classList.contains("selected"));
      const selectedName = selectedRow?.querySelector("td:nth-child(3)")?.textContent?.trim();
      if (selectedName) return selectedName;

      if (dataRows.length) {
        const firstName = dataRows[0]?.querySelector("td:nth-child(3)")?.textContent?.trim();
        if (firstName) return firstName;
      }
    }

    const searchName = document.querySelector('input[wicketpath="panelContainer_nodePanel_form_nome"]')?.value?.trim();
    return searchName || "paciente";
  }

  async function resolvePatientName() {
    let name = getPatientNameFallback();
    if (!name || name.toLowerCase() === "paciente") {
      try {
        const row = await waitForResultRow(3000);
        selectedPatientName = row.querySelector("td:nth-child(3)")?.textContent?.trim() || selectedPatientName;
        name = selectedPatientName;
      } catch (err) {
        console.warn("Não foi possível garantir nome do paciente:", err);
      }
    }
    return name || "paciente";
  }

  async function openWhatsApp() {
    const select = document.getElementById("celk-recepcao-select");
    const currentPhones = extractPhones();
    if (!currentPhones.length) {
      alert("Nenhum telefone de contato dispon?vel.");
      return;
    }
    if (!select.dataset.loaded || select.dataset.loaded !== "true") {
      alert('Clique em "Atualizar contatos" antes de enviar.');
      return;
    }
    const digits = select.value || currentPhones[0].digits;
    const phone = formatPhone(digits);
    if (!phone) {
      alert("Telefone inválido.");
      return;
    }

    const fallbackName = await resolvePatientName();
    const name =
      (patientNameParam && patientNameParam.trim()) ||
      (selectedPatientName && selectedPatientName.trim()) ||
      fallbackName;
    const dataTexto = dataHora ? dataHora.trim() : "____";
    const procedimentoTexto = procDesc ? procDesc.trim() : "____";

    const message = `*Olá ${name}.*

*Somos do Centro de Saúde Itacorubi/Regulação.*

🚨 *ATENÇÃO* 🚨️
*Data do agendamento:* ${dataTexto}
Sua consulta com especialista ou exame foi AUTORIZADO.
SES - ${procedimentoTexto}

*🚨FAVOR CONFIRMAR O RECEBIMENTO DESTA MENSAGEM.🚨*
👉 A autorização deve ser retirada na recepção do Centro de Saúde Itacorubi, no horário das 7h às 16h30. Se preferir, podemos enviar o documento em PDF para que você possa imprimir.
👉 Em caso de cancelamento, avisar com 4 dias de antecedência.
👉 Se o seu agendamento estiver marcado para sábado ou domingo, essa data é apenas fictícia. Por favor, siga as orientações indicadas na sua autorização.

🚨 *IMPORTANTE: LEVAR PEDIDO MÉDICO + ESTE COMPROVANTE DE AGENDAMENTO.*

*Atenciosamente,*
*ADM-Regulação.*
*48-92004 9305*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`, "_blank", "noopener");
  }

  function populatePhoneSelect(force = false) {
    const select = document.getElementById("celk-recepcao-select");
    const loader = document.getElementById("celk-recepcao-loader");
    const popup = document.getElementById("celk-recepcao-toolkit");
    if (!select) return;
    if (loader) loader.style.display = "block";
    select.disabled = true;
    select.dataset.loaded = "false";
    if (force || !lastPhones.length) {
      select.innerHTML = "";
      const phones = extractPhones();
      if (phones.length) {
        lastPhones = phones;
      }
      const currentList = lastPhones;
      if (!currentList.length) {
        const option = document.createElement("option");
        option.textContent = "Sem contatos";
        option.value = "";
        select.appendChild(option);
        select.disabled = true;
        if (loader) loader.style.display = "none";
        popup?._renderCombo?.();
        return;
      }
      select.disabled = false;
      currentList.forEach(phone => {
        const option = document.createElement("option");
        option.value = phone.digits;
        option.textContent = phone.label;
        select.appendChild(option);
      });
      select.dataset.loaded = "true";
      select.disabled = false;
    }
    if (loader) loader.style.display = "none";
    popup?._renderCombo?.();
  }

  function clearAutoCNSParam() {
    const url = new URL(window.location.href);
    url.searchParams.delete("autoCNS");
    window.history.replaceState({}, document.title, url.pathname + url.search + window.location.hash);
  }

  async function fillForm() {
    if (!autoCNS || alreadyProcessed) return;
    try {
      alreadyProcessed = true;
      lastPhones = [];
      const cnsInput = await waitForElement('input[wicketpath="panelContainer_nodePanel_form_numeroCartao"]');
      typeText(cnsInput, autoCNS);
      const btnProcurar = document.querySelector('input[wicketpath="panelContainer_nodePanel_form_btnProcurar"]');
      btnProcurar?.click();
      const row = await waitForResultRow();
      selectedPatientName = row.querySelector("td:nth-child(3)")?.textContent?.trim() || selectedPatientName;
      clearAutoCNSParam();
    } catch (err) {
      console.warn("Falhou ao preencher CNS automaticamente:", err);
    }
  }

  function setupRowSelectionCapture() {
    const table = document.querySelector('table[wicketpath="panelContainer_nodePanel_form_table_table"]');
    if (!table) return;
    table.addEventListener("click", (event) => {
      const row = event.target.closest("tr");
      if (!row) return;
      selectedPatientName = row.querySelector("td:nth-child(3)")?.textContent?.trim() || selectedPatientName;
      lastPhones = [];
    });
  }

  function init() {
    ensurePopup();
    setupRowSelectionCapture();
    const btn = document.getElementById("celk-recepcao-open");
    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      openWhatsApp();
    });
    const refreshBtn = document.getElementById("celk-recepcao-refresh");
    refreshBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      lastPhones = [];
      populatePhoneSelect(true);
    });
    fillForm();
  }

  init();
})();
