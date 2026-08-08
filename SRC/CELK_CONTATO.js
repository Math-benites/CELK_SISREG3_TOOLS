// ==UserScript==
// @name         CELK GEM TOOLKIT
// @namespace    http://tampermonkey.net/
// @version      1.0
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
})();
