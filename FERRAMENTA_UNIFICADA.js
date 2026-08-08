// ==UserScript==
// @name         Ferramenta da Íris - Toolkit Unificado (CELK + SISREG3)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Popup de WhatsApp/Ocorrência no CELK GEM, Auto-CNS na Recepção CELK e atalho de CNS no SISREG3 — tudo em um único script
// @match        https://florianopolis.celk.com.br/gem/*
// @match        https://florianopolis.celk.com.br/atendimento/recepcao/recepcao*
// @match        https://sisregiii.saude.gov.br/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // ==========================================================================
  // MÓDULO 1 — CELK GEM: popup de WhatsApp / Lançar Ocorrência / Imprimir
  // Roda em: https://florianopolis.celk.com.br/gem/*
  // ==========================================================================
  function iniciarCelkGem() {
    const optionsOcr = [
      { label: "Enviado via Whatsapp", value: "Mensagem enviada via whatsapp" },
      { label: "Impresso e entregue para ACS-CONTATO DESATUALIZADO", value: "Impresso e entregue para ACS-CONTATO DESATUALIZADO" },
      { label: "Impresso e entregue para ACS-SISCAN MAMOGRAFIA", value: "Impresso e entregue para ACS-SISCAN MAMOGRAFIA" },
    ];

    // ---------- Ícones (SVG inline do Bootstrap Icons, MIT) ----------
    // Embutidos diretamente no script (em vez de CDN de fonte de ícone) para não
    // depender de rede externa liberada pelo proxy corporativo.
    const ICONS = {
      pin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146"/></svg>',
      gear: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/></svg>',
      whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>',
      edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></svg>',
      printer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1"/><path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/></svg>',
      save: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6c-.314.418-.5.937-.5 1.5v6h-2a.5.5 0 0 0-.354.854l2.5 2.5a.5.5 0 0 0 .708 0l2.5-2.5A.5.5 0 0 0 10.5 7.5h-2z"/></svg>',
      close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>',
      braces: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2.114 8.063V7.9c1.005-.102 1.497-.615 1.497-1.6V4.503c0-1.094.39-1.538 1.354-1.538h.273V2h-.376C3.25 2 2.49 2.759 2.49 4.352v1.524c0 1.094-.376 1.456-1.49 1.456v1.299c1.114 0 1.49.362 1.49 1.456v1.524c0 1.593.759 2.352 2.372 2.352h.376v-.964h-.273c-.964 0-1.354-.444-1.354-1.538V9.663c0-.984-.492-1.497-1.497-1.6M13.886 7.9v.163c-1.005.103-1.497.616-1.497 1.6v1.798c0 1.094-.39 1.538-1.354 1.538h-.273v.964h.376c1.613 0 2.372-.759 2.372-2.352v-1.524c0-1.094.376-1.456 1.49-1.456V7.332c-1.114 0-1.49-.362-1.49-1.456V4.352C13.51 2.759 12.75 2 11.138 2h-.376v.964h.273c.964 0 1.354.444 1.354 1.538V6.3c0 .984.492 1.497 1.497 1.6"/></svg>',
      phone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/></svg>',
      grip: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg>',
      chevron: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/></svg>',
      check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/></svg>',
    };

    function svg(name) {
      return `<span class="svgicon">${ICONS[name]}</span>`;
    }

    // ---------- Configuração (unidade/telefone/template) ----------
    // Persistida em localStorage para permitir reaproveitar o mesmo script em
    // outra unidade de saúde sem precisar editar o código.
    const CONFIG_STORAGE_KEY = "celkGemToolkitConfig";
    const defaultConfig = {
      unidade: "Centro de Saúde Itacorubi",
      telefoneContato: "48-92004 9305",
      mensagemTemplate: `*Olá {{paciente}}.*

*Somos do {{unidade}}/Regulaçao.*

🚨 *ATENÇÃO* 🚨️
*Data do agendamento:* {{data}}
Sua consulta com especialista ou exame foi AUTORIZADO.
{{procedimento}}

*🚨FAVOR CONFIRMAR O RECEBIMENTO DESTA MENSAGEM.🚨*
👉 A autorização deve ser retirada na recepção do {{unidade}}, no horário das 7h às 16h30. Se preferir, podemos enviar o documento em PDF para que você possa imprimir.
👉 Em caso de cancelamento, avisar com 3 dias de antecedência.
👉 Se o seu agendamento estiver marcado para sábado ou domingo, essa data é apenas fictícia. Por favor, siga as orientações indicadas na sua autorização

🚨 *IMPORTANTE: LEVAR PEDIDO MÉDICO + ESTE COMPROVANTE DE AGENDAMENTO.*

*Atenciosamente,*
*ADM-Regulação.*
*{{telefone}}*`,
    };

    function loadConfig() {
      try {
        const saved = JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY) || "{}");
        return { ...defaultConfig, ...saved };
      } catch (e) {
        return { ...defaultConfig };
      }
    }

    function saveConfig(cfg) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfg));
    }

    let config = loadConfig();

    function preencherTemplate(template, dados) {
      return template.replace(/\{\{(\w+)\}\}/g, (_, chave) => dados[chave] ?? "");
    }

    // ---------- Fontes do Google (injeção) ----------
    function ensureGoogleAssets() {
      if (document.getElementById("tm-google-fonts")) return;

      const fontLink = document.createElement("link");
      fontLink.id = "tm-google-fonts";
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
      document.head.appendChild(fontLink);
    }

    ensureGoogleAssets();

    // ---------- CSS (injeção) ----------
    const css = `
#popup-whats {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999999;
  background: #ffffff;
  border: 1px solid #e7eaf0;
  top: 27%;
  left: 80%;
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
.svgicon svg {
  width: 100%;
  height: 100%;
  display: block;
}
#popup-whatsheader {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: move;
  padding-bottom: 9px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f0f2f6;
}
.drag-grip {
  color: #c7cdd7;
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}
.popup-title {
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
.config-gear {
  cursor: pointer;
  color: #9aa5b5;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: color 0.12s ease, transform 0.12s ease;
}
.config-gear:hover {
  color: #02a093;
  transform: rotate(30deg);
}
#selectTel { display: none; }
.combo {
  position: relative;
  margin-bottom: 10px;
}
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
.combo-trigger-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.combo-chevron {
  color: #9aa5b5;
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  transition: transform 0.12s ease;
}
.combo.open .combo-chevron { transform: rotate(180deg); }
.combo-chevron svg { width: 100%; height: 100%; display: block; }
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
  max-height: 180px;
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
.action-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
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
  cursor: pointer;
  user-select: none;
  transition: background 0.12s ease, transform 0.12s ease, color 0.12s ease;
}
.action-item .svgicon { width: 16px; height: 16px; }
.action-item:hover, .action-item:focus { background: #e8ecf1; transform: translateX(1px); text-decoration: none; outline: none; }
.action-item:active { transform: translateX(0); }
.action-item-primary { background: #25d366; color: #fff; }
.action-item-primary:hover { background: #1fbd59; }
#popup-config-overlay {
  display: none !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  background: rgba(15, 23, 42, 0.55);
  z-index: 1000000;
  align-items: center !important;
  justify-content: center !important;
}
#popup-config-overlay.show { display: flex !important; }
#popup-config {
  position: relative;
  background: #fff;
  border: 1px solid #e7eaf0;
  border-radius: 18px;
  padding: 26px 24px 20px;
  width: 560px;
  max-width: 92vw;
  margin: 0 !important;
  box-shadow: 0 16px 40px -10px rgba(15, 23, 42, 0.25);
  font-family: 'Poppins', Arial, sans-serif;
  text-align: left;
}
.config-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f1f4f9;
  color: #555;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.12s ease;
}
.config-close:hover { background: #e3e8f0; }
.config-icon-badge {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e6f7f5;
  color: #02a093;
  margin-bottom: 12px;
}
.config-icon-badge .svgicon { width: 20px; height: 20px; }
#popup-config h3 {
  margin: 0 0 4px 0;
  font-size: 19px;
  font-weight: 700;
  color: #3d4650;
}
.config-subtitle {
  margin: 0 0 18px 0;
  font-size: 13px;
  color: #7a8699;
}
#popup-config label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}
.input-icon {
  position: relative;
  margin-bottom: 14px;
}
.input-icon .svgicon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: #9aa5b5;
  width: 16px;
  height: 16px;
}
#popup-config input[type="text"] {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dde3ec;
  border-radius: 10px;
  padding: 9px 12px 9px 34px;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.12s ease;
}
#popup-config input[type="text"]:focus { border-color: #02a093; }
.config-body {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}
#cfg-template {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid #dde3ec;
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
  font-family: 'Consolas', monospace;
  font-size: 12.5px;
  line-height: 1.5;
  resize: vertical;
  min-height: 200px;
}
#cfg-template:focus { border-color: #02a093; }
.config-macros {
  width: 190px;
  flex-shrink: 0;
  border-left: 1px solid #eef1f6;
  padding-left: 14px;
  max-height: 240px;
  overflow-y: auto;
}
.macros-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #02a093;
  margin-bottom: 8px;
}
.macros-title .svgicon { width: 15px; height: 15px; }
.macro-chip {
  display: flex;
  flex-direction: column;
  padding: 7px 9px;
  border: 1px solid #e3e8f0;
  border-radius: 8px;
  margin-bottom: 7px;
  cursor: pointer;
  user-select: none;
  background: #f7f9fc;
  transition: background 0.12s ease, border-color 0.12s ease;
}
.macro-chip:hover, .macro-chip:focus { background: #eef8f7; border-color: #02a093; outline: none; }
.macro-token {
  font-family: 'Consolas', monospace;
  font-weight: 700;
  color: #02a093;
  font-size: 11.5px;
}
.macro-preview {
  font-size: 10.5px;
  color: #7a8699;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
.config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}
.tm-btn-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 12.5px;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  text-decoration: none;
}
.tm-btn-inline:hover, .tm-btn-inline:focus { text-decoration: none; outline: none; }
.tm-btn-cancel { background: #f3f5f8; color: #3d4650; }
.tm-btn-cancel:hover { background: #e8ecf1; }
.tm-btn-save { background: #25d366; color: #fff; }
.tm-btn-save:hover { background: #1fbd59; }
.config-credit {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid #f0f2f6;
  text-align: center;
  font-size: 10.5px;
  color: #aab2bf;
}
.config-credit a {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}
.config-credit a:hover { color: #7a8699; text-decoration: none; }
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
        <div id="popup-whatsheader">
          <span class="drag-grip">${svg("grip")}</span>
          <span class="popup-title">Regulação</span>
          <span class="config-gear" id="btn-config" title="Configurar unidade">${svg("gear")}</span>
        </div>
        <select id="selectTel">
          <option value="0" selected>Selecione um contato</option>
        </select>
        <div class="combo" id="telCombo">
          <button type="button" class="combo-trigger" id="telComboTrigger">
            <span class="combo-trigger-label">Selecione um contato</span>
            <span class="combo-chevron">${ICONS.chevron}</span>
          </button>
          <div class="combo-list" id="telComboList"></div>
        </div>
        <div class="action-list">
          <a href="#" class="action-item action-item-primary" id="open-whats">${svg("whatsapp")}<span>Abrir WhatsApp</span></a>
          <a href="#" class="action-item" id="btn-ocr">${svg("edit")}<span>Lançar Ocorrência</span></a>
          <a href="#" class="action-item" id="btn-imprimir">${svg("printer")}<span>Imprimir Comprovantes</span></a>
        </div>
      `;
      document.body.appendChild(popup);
      dragElement(popup);

      // Listeners são vinculados só aqui (uma vez), já que ensurePopup() retorna
      // antecipadamente se o popup já existir. Evita duplicar handlers a cada init().
      const selectTel = popup.querySelector("#selectTel");
      popup.querySelector("#open-whats").addEventListener("click", (e) => {
        e.preventDefault();
        openWhats(selectTel);
      });
      popup.querySelector("#btn-ocr").addEventListener("click", (e) => {
        e.preventDefault();
        lncOcr();
      });
      popup.querySelector("#btn-imprimir").addEventListener("click", (e) => {
        e.preventDefault();
        imprimirComprovantes();
      });

      const gear = popup.querySelector("#btn-config");
      // impede que o clique na engrenagem inicie o arrasto do popup (header tem onmousedown)
      gear.addEventListener("mousedown", (e) => e.stopPropagation());
      gear.addEventListener("click", (e) => {
        e.preventDefault();
        abrirConfig();
      });

      // popup._renderCombo é chamado pelo init() sempre que os contatos são
      // repopulados, pra manter a lista visual customizada sincronizada com o
      // <select> real (que continua sendo a fonte de verdade do valor).
      popup._renderCombo = setupCombo(popup, selectTel);

      return popup;
    }

    // Dropdown customizado por cima do <select> nativo (escondido), já que o
    // navegador não permite estilizar a lista de opções de um <select> real.
    function setupCombo(popup, selectTel) {
      const combo = popup.querySelector("#telCombo");
      const trigger = popup.querySelector("#telComboTrigger");
      const label = trigger.querySelector(".combo-trigger-label");
      const list = popup.querySelector("#telComboList");

      const abrir = () => combo.classList.add("open");
      const fechar = () => combo.classList.remove("open");

      function render() {
        list.innerHTML = "";

        Array.from(selectTel.options).forEach(opt => {
          const item = document.createElement("div");
          const selecionado = opt.value === selectTel.value;
          item.className = "combo-option" + (selecionado ? " selected" : "");
          item.tabIndex = 0;

          const textoSpan = document.createElement("span");
          textoSpan.textContent = opt.text;
          item.appendChild(textoSpan);
          if (selecionado) item.insertAdjacentHTML("beforeend", svg("check"));

          item.addEventListener("click", () => {
            selectTel.value = opt.value;
            selectTel.dispatchEvent(new Event("change", { bubbles: true }));
            render();
            fechar();
          });

          list.appendChild(item);
        });

        const selectedOption = selectTel.options[selectTel.selectedIndex];
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

    // ---------- Modal de configuração ----------
    const MACROS = [
      { chave: "paciente", rotulo: "{{paciente}}" },
      { chave: "data", rotulo: "{{data}}" },
      { chave: "procedimento", rotulo: "{{procedimento}}" },
      { chave: "unidade", rotulo: "{{unidade}}" },
      { chave: "telefone", rotulo: "{{telefone}}" },
    ];

    function ensureConfigModal() {
      let overlay = document.getElementById("popup-config-overlay");
      if (overlay) return overlay;

      overlay = document.createElement("div");
      overlay.id = "popup-config-overlay";
      overlay.innerHTML = `
        <div id="popup-config">
          <button type="button" class="config-close" id="cfg-close" title="Fechar">${svg("close")}</button>
          <div class="config-icon-badge">${svg("gear")}</div>
          <h3>Configurar Unidade</h3>
          <p class="config-subtitle">Personalize os dados e o modelo de mensagem usados nas confirmações.</p>

          <label for="cfg-unidade">Nome da unidade</label>
          <div class="input-icon">${svg("pin")}<input type="text" id="cfg-unidade" /></div>

          <label for="cfg-telefone">Telefone de contato</label>
          <div class="input-icon">${svg("phone")}<input type="text" id="cfg-telefone" /></div>

          <label for="cfg-template">Modelo da mensagem</label>
          <div class="config-body">
            <textarea id="cfg-template" rows="10"></textarea>
            <div class="config-macros">
              <div class="macros-title">${svg("braces")}<span>Macros</span></div>
              ${MACROS.map(m => `
                <div class="macro-chip" data-macro="${m.chave}" title="Clique para inserir no texto">
                  <span class="macro-token">${m.rotulo}</span>
                  <span class="macro-preview" data-preview="${m.chave}">—</span>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="config-actions">
            <a href="#" class="tm-btn-inline tm-btn-cancel" id="cfg-cancelar">Cancelar</a>
            <a href="#" class="tm-btn-inline tm-btn-save" id="cfg-salvar">${svg("save")}<span>Salvar</span></a>
          </div>

          <p class="config-credit">By <a href="https://www.linkedin.com/in/matheus-benites/" target="_blank" rel="noopener noreferrer">Matheus Benites</a></p>
        </div>
      `;
      document.body.appendChild(overlay);

      const fechar = () => overlay.classList.remove("show");

      // fecha ao clicar fora do modal (no backdrop)
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) fechar();
      });

      overlay.querySelector("#cfg-close").addEventListener("click", (e) => {
        e.preventDefault();
        fechar();
      });

      overlay.querySelector("#cfg-cancelar").addEventListener("click", (e) => {
        e.preventDefault();
        fechar();
      });

      overlay.querySelector("#cfg-salvar").addEventListener("click", (e) => {
        e.preventDefault();
        const unidade = overlay.querySelector("#cfg-unidade").value.trim();
        const telefone = overlay.querySelector("#cfg-telefone").value.trim();
        const template = overlay.querySelector("#cfg-template").value.trim();

        config = {
          unidade: unidade || defaultConfig.unidade,
          telefoneContato: telefone || defaultConfig.telefoneContato,
          mensagemTemplate: template || defaultConfig.mensagemTemplate,
        };
        saveConfig(config);
        fechar();
      });

      // clicar num macro insere o token na posição do cursor do textarea
      overlay.querySelectorAll(".macro-chip").forEach(chip => {
        chip.addEventListener("click", (e) => {
          e.preventDefault();
          const textarea = overlay.querySelector("#cfg-template");
          const token = `{{${chip.dataset.macro}}}`;
          const start = textarea.selectionStart ?? textarea.value.length;
          const end = textarea.selectionEnd ?? textarea.value.length;
          textarea.value = textarea.value.slice(0, start) + token + textarea.value.slice(end);
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + token.length;
        });
      });

      // atualiza o preview dos macros ao digitar unidade/telefone
      ["cfg-unidade", "cfg-telefone"].forEach(id => {
        overlay.querySelector(`#${id}`).addEventListener("input", () => atualizarPreviewMacros(overlay));
      });

      return overlay;
    }

    function atualizarPreviewMacros(overlay) {
      const { pacienteName, dataAgendamento, procedimento } = getPacienteData();
      const preview = {
        paciente: pacienteName,
        data: dataAgendamento,
        procedimento: procedimento,
        unidade: overlay.querySelector("#cfg-unidade").value,
        telefone: overlay.querySelector("#cfg-telefone").value,
      };

      overlay.querySelectorAll("[data-preview]").forEach(el => {
        const valor = preview[el.dataset.preview];
        el.textContent = valor && valor.trim() ? valor : "— (sem dado na página atual)";
      });
    }

    function abrirConfig() {
      const overlay = ensureConfigModal();
      overlay.querySelector("#cfg-unidade").value = config.unidade;
      overlay.querySelector("#cfg-telefone").value = config.telefoneContato;
      overlay.querySelector("#cfg-template").value = config.mensagemTemplate;
      atualizarPreviewMacros(overlay);
      overlay.classList.add("show");
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
      // Texto do breadcrumb pode variar entre versões do GEM, então usamos match parcial
      // e, como reforço, checamos elementos funcionais que só existem nesta tela específica.
      const labelTitle = document.querySelector('label[wicketpath="section_breadcrumbs"]');
      const breadcrumbText = labelTitle?.innerText?.trim() || "";
      const breadcrumbMatch = /Agenda\s*\/\s*Consultas/i.test(breadcrumbText);

      const temTabelaAgendamento = !!document.querySelector('tbody[wicketpath="form_containerTableAgendamentos_tableAgendamento_table_body"]');
      const temBtnOcorrencia = !!document.querySelector('a[name="btnLancarOcorrencia"]');
      const temNomePaciente = !!document.querySelector('input[wicketpath="form_usuarioCadsus.descricaoSocialFormatadoParametroReferencia"], label[wicketpath="form_usuarioCadsus.nomeSocial"]');

      const isAgenda = breadcrumbMatch || temTabelaAgendamento || temBtnOcorrencia || temNomePaciente;

      console.log("[CELK GEM TOOLKIT] isPaginaAgenda:", {
        breadcrumbText,
        breadcrumbMatch,
        temTabelaAgendamento,
        temBtnOcorrencia,
        temNomePaciente,
        isAgenda,
      });

      return isAgenda;
    }

    // Remove prefixo "Paciente", código "( 123456 )" entre parênteses e aspas,
    // deixando só o nome. Ex: '( 1306046 ) NEIMAR BISEWSKI LUIZ' -> 'NEIMAR BISEWSKI LUIZ'
    function extractNomePaciente(raw) {
      if (!raw) return "";
      const match = raw.match(/\(\s*\d+\s*\)\s*(.+)/);
      let nome = match ? match[1] : raw;
      nome = nome.replace(/^Paciente\s*/i, "");
      nome = nome.replace(/["“”]/g, "");
      return nome.trim();
    }

    // O nome/código do paciente fica num <input> (não <label>), com o wicketpath
    // abaixo. Mantemos seletores alternativos como fallback caso o CELK renomeie
    // o campo de novo, mas evitamos busca por texto livre (já gerou falso
    // positivo pegando um botão "Paciente Simplificado" que não tem relação).
    function encontrarCampoPaciente() {
      return (
        document.querySelector('input[wicketpath="form_usuarioCadsus.descricaoSocialFormatadoParametroReferencia"]') ||
        document.querySelector('label[wicketpath="form_usuarioCadsus.nomeSocial"]') ||
        document.querySelector('[wicketpath*="usuarioCadsus.descricaoSocial"]') ||
        document.querySelector('[wicketpath*="usuarioCadsus.nomeSocial"]')
      );
    }

    function obterTextoCampo(el) {
      if (!el) return "";
      if ("value" in el && el.value) return el.value.trim();
      return el.innerText?.trim() || "";
    }

    // Procura a célula que contenha uma data (dd/mm/aaaa) em vez de confiar na
    // posição fixa da coluna, já que a ordem/conteúdo das colunas pode mudar.
    function extrairDataAgendamento(tbody) {
      if (!tbody) return "";
      const celulas = Array.from(tbody.querySelectorAll("td"));
      const celulaData = celulas.find(td => /\d{2}\/\d{2}\/\d{4}/.test(td.innerText || ""));
      return (celulaData || celulas[1])?.innerText?.trim() || "";
    }

    function getPacienteData() {
      const campoPaciente = encontrarCampoPaciente();
      const pacienteNameRaw = obterTextoCampo(campoPaciente);
      const pacienteName = extractNomePaciente(pacienteNameRaw);

      const tbody = document.querySelector('tbody[wicketpath="form_containerTableAgendamentos_tableAgendamento_table_body"]');
      const dataAgendamento = extrairDataAgendamento(tbody);

      const procedimento = document.querySelector('input[wicketpath="form_tipoProcedimento.descricao"]')?.value?.trim() || "";

      console.log("[CELK GEM TOOLKIT] getPacienteData:", { pacienteNameRaw, pacienteName, dataAgendamento, procedimento });

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

    function openWhats(selectTel) {
      const { pacienteName, dataAgendamento, procedimento } = getPacienteData();

      if (selectTel.value === "0") return;

      const mensagem = preencherTemplate(config.mensagemTemplate, {
        paciente: pacienteName,
        data: dataAgendamento,
        procedimento,
        unidade: config.unidade,
        telefone: config.telefoneContato,
      });

      const text = encodeURIComponent(mensagem);
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

      // remove opções antigas (mantém "Selecione um contato") antes de repopular,
      // já que init() agora pode ser chamado várias vezes pelo MutationObserver
      while (selectTel.options.length > 1) {
        selectTel.remove(1);
      }

      collectNumbers().forEach(n => {
        const option = document.createElement("option");
        option.value = n.value;
        option.innerText = n.label;
        selectTel.appendChild(option);
      });

      popup._renderCombo?.();
    }

    function debounce(fn, waitMs) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), waitMs);
      };
    }

    const debouncedInit = debounce(init, 300);

    init();

    // Wicket troca o DOM via AJAX após o load, em momentos imprevisíveis.
    // Observar mutações no body reage a qualquer atualização, em vez de confiar
    // numa janela fixa de tempo (setTimeout) que pode não bater com a resposta AJAX.
    const bodyObserver = new MutationObserver((mutations) => {
      const popupEl = document.getElementById("popup-whats");
      const configEl = document.getElementById("popup-config-overlay");
      // ignora mutações originadas dentro do próprio popup ou do modal de config
      // (ex: repopular o select), senão o observer reagiria às mudanças que o
      // próprio init()/abrirConfig() provoca
      const relevante = mutations.some(m =>
        (!popupEl || !popupEl.contains(m.target)) &&
        (!configEl || !configEl.contains(m.target))
      );
      if (relevante) debouncedInit();
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ==========================================================================
  // MÓDULO 2 — CELK Recepção: Auto CNS + atalho de WhatsApp
  // Roda em: https://florianopolis.celk.com.br/atendimento/recepcao/recepcao*
  // ==========================================================================
  function iniciarCelkRecepcao() {
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
  }

  // ==========================================================================
  // MÓDULO 3 — SISREG3: copiar CNS / abrir CELK
  // Roda em: https://sisregiii.saude.gov.br/*
  // ==========================================================================
  function iniciarSisreg3() {
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
  }

  // ==========================================================================
  // ROTEAMENTO — decide qual módulo ativar de acordo com a URL atual
  // ==========================================================================
  const host = window.location.hostname;
  const path = window.location.pathname;

  if (host === "florianopolis.celk.com.br" && path.startsWith("/gem/")) {
    iniciarCelkGem();
  } else if (host === "florianopolis.celk.com.br" && path.startsWith("/atendimento/recepcao/recepcao")) {
    iniciarCelkRecepcao();
  } else if (host === "sisregiii.saude.gov.br") {
    iniciarSisreg3();
  }
})();
