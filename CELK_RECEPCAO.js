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

  const css = `
#celk-recepcao-toolkit {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999999;
  background: linear-gradient(180deg, #ffffff, #eef3fb);
  border: 1px solid #d7e0ef;
  text-align: center;
  top: 30%;
  left: 78%;
  box-shadow: 2px 4px 16px -4px rgba(0, 0, 0, 0.45);
  min-width: 220px;
  padding: 10px;
  border-radius: 10px;
  font-family: Arial, sans-serif;
}
#celk-recepcao-toolkitheader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  cursor: move;
  background: #02a093;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  font-weight: bold;
  letter-spacing: 0.4px;
}
#celk-recepcao-toolkit select {
  margin-bottom: 8px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #cbd5f5;
}
.celk-recepcao-loader {
  display: none;
  font-size: 12px;
  color: #02a093;
  margin-bottom: 6px;
}
.celk-recepcao-refresh {
  margin-bottom: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #a9d8ff, #6bb4ff);
  color: #042746;
  font-weight: bold;
}
.celk-recepcao-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  color: #053a1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  background: linear-gradient(135deg, #b1ffcf, #7beaa2);
  border: none;
  transition: transform 0.12s ease;
}
.celk-recepcao-btn:hover { transform: translateY(-1px); }
.celk-recepcao-btn:active { transform: translateY(1px); }
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

  function ensurePopup() {
    let popup = document.getElementById("celk-recepcao-toolkit");
    if (popup) return popup;

    popup = document.createElement("div");
    popup.id = "celk-recepcao-toolkit";
    popup.innerHTML = `
      <div id="celk-recepcao-toolkitheader">💬 WhatsApp</div>
      <div class="celk-recepcao-loader" id="celk-recepcao-loader">Atualizando contatos...</div>
      <button type="button" class="celk-recepcao-refresh" id="celk-recepcao-refresh">Atualizar contatos</button>
      <select id="celk-recepcao-select">
        <option value="">Clique em "Atualizar contatos"</option>
      </select>
      <button type="button" class="celk-recepcao-btn" id="celk-recepcao-open">
        <span>📱</span><span>Enviar Mensagem</span>
      </button>
    `;
    document.body.appendChild(popup);
    const select = popup.querySelector("#celk-recepcao-select");
    if (select) select.dataset.loaded = "false";
    dragElement(popup);
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
👉 Em caso de cancelamento, avisar com 3 dias de antecedência.
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
