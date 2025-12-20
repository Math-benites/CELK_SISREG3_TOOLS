# 🧰 Toolkits Tampermonkey – CELK / SISREG3

Conjunto de **UserScripts (Tampermonkey)** para agilizar tarefas de **regulação e recepção**, integrando **SISREG3 → CELK → WhatsApp Web**.

---

## 📦 Scripts

### 🔹 CELK GEM Toolkit
**URL:** `https://florianopolis.celk.com.br/gem/*`

Popup flutuante na tela de agendamentos para:
- 💬 Abrir WhatsApp com mensagem pronta
- 📝 Lançar ocorrência rapidamente
- 🖨️ Imprimir comprovantes

---

### 🔹 CELK Recepção – Auto CNS
**URL:** `https://florianopolis.celk.com.br/atendimento/recepcao/recepcao*`

Automatiza a recepção:
- Preenche CNS automaticamente via URL (`autoCNS`)
- Busca o paciente
- Lista telefones
- Envia mensagem pelo WhatsApp Web

**Parâmetros de URL:**
- `autoCNS`, `procDesc`, `procCode`, `unitDesc`, `dataHora`, `patientName`

---

### 🔹 SISREG3 Toolkit
**URL:** `https://sisregiii.saude.gov.br/*`

Menu flutuante para:
- 📋 Copiar CNS do paciente
- 🔗 Abrir CELK Recepção já com dados preenchidos

Compatível com iframes e navegação interna do SISREG3.

---

## 🔄 Fluxo recomendado

1. Abrir o paciente no **SISREG3**
2. Clicar em **Abrir CELK**
3. Atualizar contatos na **Recepção CELK**
4. Enviar mensagem pelo WhatsApp

---

## 🧩 Instalação

1. Instale o **Tampermonkey**
2. Crie um novo script
3. Cole o arquivo `.user.js`
4. Salve

---

## ⚠️ Observações

- Uso restrito a ambientes autorizados
- Lida com dados sensíveis
- Mudanças no sistema podem exigir ajustes no script

---

## 📁 Estrutura

