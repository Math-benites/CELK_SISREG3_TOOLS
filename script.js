// ==UserScript==
// @name         CELK GEM - Popup Whats + Ocorrência
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Popup arrastável para abrir WhatsApp, lançar ocorrência e confirmar contato no CELK/GEM
// @match        https://florianopolis.celk.com.br/gem/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const optionsOcr = [
    { label: "Enviado via Whatsapp", value: "Mensagem enviada via whatsapp" },
    { label: "Impresso e entregue para ACS-CONTATO DESATUALIZADO", value: "Impresso e entregue para ACS-CONTATO DESATUALIZADO" },
    { label: "Impresso e entregue para ACS-SISCAN MAMOGRAFIA", value: "Impresso e entregue para ACS-SISCAN MAMOGRAFIA" },
  ];

  // ---------- CSS (injeção) ----------
  const css = `
#popup-whats {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999999;
  background-color: #f1f1f1;
  border: 1px solid #d3d3d3;
  text-align: center;
  top: 27%;
  left: 80%;
  box-shadow: 1px 1px 10px -1px #00000085;
  min-width: 220px;
  padding: 8px;
  border-radius: 6px;
  font-family: Arial, sans-serif;
}
#popup-whatsheader {
  display: flex;
  padding: 10px;
  cursor: move;
  z-index: 10;
  background-color: #2196F3;
  color: #fff;
  border-radius: 4px;
  margin-bottom: 8px;
}
#selectTel {
  margin-top: 5px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  outline: none;
  height: 36px;
  border-radius: 4px;
  padding: 0 6px;
}
.tm-btn {
  display: block;
  text-decoration: none;
  padding: 8px 10px;
  margin: 4px 0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}
.tm-blue { background: #3aa0ff; color: white; }
.tm-green { background: #19b66b; color: white; }
.tm-btn:active { transform: translateY(1px); }
  `.trim();

  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------- HTML (injeção) ----------
  function ensurePopup() {
    let popup = document.getElementById("popup-whats");
    if (popup) return popup;

    popup = document.createElement("div");
    popup.id = "popup-whats";
    popup.innerHTML = `
      <div id="popup-whatsheader">Whats / Ocorrência</div>
      <div class="field-select">
        <select id="selectTel">
          <option value="0" selected>Selecione um contato</option>
        </select>
      </div>
      <a href="#" class="tm-btn tm-blue" id="open-whats">Abrir WhatsApp</a>
      <a href="#" class="tm-btn tm-blue" id="btn-ocr">Lançar Ocorrência</a>
      <a href="#" class="tm-btn tm-blue" id="btn-imprimir">Imprimir Comprovantes</a>
      <a href="#" class="tm-btn tm-green" id="btn-confirmar">Confirmar Contato</a>
    `;
    document.body.appendChild(popup);
    dragElement(popup);
    return popup;
  }

  // ---------- Helpers ----------
  function waitForElement(selector, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(timer);
          reject(new Error(`Elemento não encontrado: ${selector}`));
        }
      }, 150);
    });
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

  async function typeText(input, text) {
    input.focus();
    input.value = text;

    // Wicket/React/Vue normalmente escutam input/change
    input.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true, data: text }));
    input.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  // ---------- Regra de página ----------
  function isPaginaAgenda() {
    const labelTitle = document.querySelector('label[wicketpath="section_breadcrumbs"]');
    return labelTitle && labelTitle.innerText.trim() === "Agenda / Consultas / Acompanhamento dos Agendamentos";
  }

  function getPacienteData() {
    const pacienteName = document.querySelector('label[wicketpath="form_usuarioCadsus.nomeSocial"]')?.innerText?.trim() || "";

    // Seu seletor original tinha um ] faltando. Ajustei aqui:
    const tbody = document.querySelector('tbody[wicketpath="form_containerTableAgendamentos_tableAgendamento_table_body"]');
    const dataAgendamento = tbody?.querySelectorAll("td")?.[1]?.innerText?.trim() || "";

    const procedimento = document.querySelector('input[wicketpath="form_tipoProcedimento.descricao"]')?.value?.trim() || "";

    return { pacienteName, dataAgendamento, procedimento };
  }

  function collectNumbers() {
    const labels = Array.from(document.querySelectorAll("label"));
    const contatosLabel = labels.find(l => l.innerText.trim() === "Contatos");
    if (!contatosLabel) return [];

    const container = contatosLabel.parentElement?.parentElement;
    if (!container) return [];

    const inputs = Array.from(container.querySelectorAll("input"));

    let numbers = inputs.map(i => {
      if (!i.name?.includes("email") && i.value?.trim()) {
        const digits = (i.value.match(/\d/g) || []).join("");
        if (digits) return { label: i.value, value: digits };
      }
      return null;
    }).filter(Boolean);

    // dedup
    const seen = new Set();
    numbers = numbers.filter(n => {
      if (seen.has(n.value)) return false;
      seen.add(n.value);
      return true;
    });

    return numbers;
  }

  // ---------- Ações ----------
  async function lncOcr() {
    const btn = document.querySelector('a[name="btnLancarOcorrencia"]');
    if (!btn) return;

    btn.click();

    try {
      const textArea = await waitForElement('textarea[wicketpath="formModal_modals_3_content_ocorrencia"]', 8000);

      // evita duplicar select
      if (!document.getElementById("tm-select-ocr")) {
        const selectOcr = document.createElement("select");
        selectOcr.id = "tm-select-ocr";
        selectOcr.style.height = "40px";
        selectOcr.style.width = "100%";
        selectOcr.style.marginTop = "8px";

        for (const opt of optionsOcr) {
          const o = document.createElement("option");
          o.innerText = opt.label;
          o.value = opt.value;
          selectOcr.appendChild(o);
        }

        textArea.parentElement.appendChild(selectOcr);

        await typeText(textArea, selectOcr.value);

        selectOcr.addEventListener("change", async () => {
          await typeText(textArea, selectOcr.value);
        });

        // esconde textarea se você quiser manter igual ao seu
        textArea.style.visibility = "hidden";
        textArea.style.height = "0px";
      }
    } catch (e) {
      console.log("Falhou ao achar textarea da ocorrência:", e);
    }
  }

  async function imprimirComprovantes() {
    const btn = document.querySelector('a[name="btnImprimir"]');
    if (!btn) return;

    btn.click();

    try {
      const btnModal = await waitForElement('a[wicketpath*="formModal"][wicketpath*="btnImprimir"]', 8000);
      const href = btnModal.getAttribute("href");

      if (href && href !== "#") {
        const url = new URL(href, window.location.href).toString();
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        btnModal.click();
      }

      // fecha modal para manter tela limpa
      const closeBtn = document.querySelector('a[wicketpath*="formModal"][wicketpath*="btnFechar"], a[name*="btnFechar"]');
      closeBtn?.click();
    } catch (e) {
      console.log("Falhou ao acionar impressão:", e);
    }
  }

  function btnConfirmarFnc() {
    const btn = document.querySelector('a[name="btnConfirmarContato"]');
    if (btn) btn.click();
  }

  function openWhats(selectTel) {
    const { pacienteName, dataAgendamento, procedimento } = getPacienteData();

    if (selectTel.value === "0") return;

    const text = encodeURIComponent(`*Olá ${pacienteName}.*

*Somos do Centro de Saúde Itacorubi/Regulaçao.*

🚨 *ATENÇÃO* 🚨️
*Data do agendamento:* ${dataAgendamento}
Sua consulta com especialista ou exame foi AUTORIZADO.
${procedimento}

*🚨FAVOR CONFIRMAR O RECEBIMENTO DESTA MENSAGEM.🚨*
👉 A autorização deve ser retirada na recepção do Centro de Saúde Itacorubi, no horário das 7h às 16h30. Se preferir, podemos enviar o documento em PDF para que você possa imprimir.
👉 Em caso de cancelamento, avisar com 3 dias de antecedência.
👉 Se o seu agendamento estiver marcado para sábado ou domingo, essa data é apenas fictícia. Por favor, siga as orientações indicadas na sua autorização

🚨 *IMPORTANTE: LEVAR PEDIDO MÉDICO + ESTE COMPROVANTE DE AGENDAMENTO.*

*Atenciosamente,*
*ADM-Regulação.*
*48-92004 9305*`);

    window.open(`https://web.whatsapp.com/send?phone=${selectTel.value}&text=${text}`, "_blank", "noopener,noreferrer");
  }

  // ---------- Boot ----------
  async function init() {
    const popup = ensurePopup();

    if (!isPaginaAgenda()) {
      popup.style.display = "none";
      return;
    }

    popup.style.display = "flex";

    const selectTel = popup.querySelector("#selectTel");
    const btnWhats = popup.querySelector("#open-whats");
    const btnOcr = popup.querySelector("#btn-ocr");
    const btnImprimir = popup.querySelector("#btn-imprimir");
    const btnConfirmar = popup.querySelector("#btn-confirmar");

    // popular contatos
    const numbers = collectNumbers();
    numbers.forEach(n => {
      const option = document.createElement("option");
      option.value = n.value;
      option.innerText = n.label;
      selectTel.appendChild(option);
    });

    btnWhats.addEventListener("click", (e) => {
      e.preventDefault();
      openWhats(selectTel);
    });

    btnOcr.addEventListener("click", (e) => {
      e.preventDefault();
      lncOcr();
    });

    btnImprimir.addEventListener("click", (e) => {
      e.preventDefault();
      imprimirComprovantes();
    });

    btnConfirmar.addEventListener("click", (e) => {
      e.preventDefault();
      btnConfirmarFnc();
    });
  }

  // Wicket às vezes troca DOM depois do load: tenta iniciar e, se falhar, tenta de novo
  init();
  setTimeout(init, 2000);
})();
