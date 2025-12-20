// ==UserScript==
// @name         CELK Recepção - Auto CNS
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Preenche automaticamente o CNS no formulário de recepção quando informado via querystring
// @match        https://florianopolis.celk.com.br/atendimento/recepcao/recepcao*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const autoCNS = params.get("autoCNS");
  if (!autoCNS) return;

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

  function typeText(input, text) {
    input.focus();
    input.value = text;
    input.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true, data: text }));
    input.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  async function fillForm() {
    try {
      const cnsInput = await waitForElement('input[wicketpath="panelContainer_nodePanel_form_numeroCartao"]');
      typeText(cnsInput, autoCNS);
      const btnProcurar = document.querySelector('input[wicketpath="panelContainer_nodePanel_form_btnProcurar"]');
      btnProcurar?.click();
    } catch (err) {
      console.warn("Falhou ao preencher CNS automaticamente:", err);
    }
  }

  fillForm();
})();
