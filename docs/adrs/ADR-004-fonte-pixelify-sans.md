# ADR-004: fonte Pixelify Sans no lugar de fonte bitmap própria

- **Data:** 2026-09-12
- **Status:** Aceita
- **Decisores:** José Romualdo

## Contexto

O spec previa uma fonte bitmap com acentos e cedilha. Desenhar uma fonte bitmap própria com todos os caracteres do português exigiria cerca de 90 glifos à mão antes de qualquer tela funcionar.

## Decisão

Usar a fonte Pixelify Sans (licença SIL Open Font License), empacotada pelo `@fontsource/pixelify-sans` e servida junto com o jogo, renderizada pelo `Phaser.GameObjects.Text`.

## Motivações

- Tem estética de pixel art e cobre os caracteres latinos estendidos (á, â, ã, é, ê, í, ó, ô, õ, ú, ç).
- É servida pelo próprio site, sem depender de CDN externa.
- A licença permite uso e redistribuição em projeto público.

## Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Texto pouco nítido com ampliação por CSS em fontes pequenas | Tamanho mínimo de 8 px na resolução base; verificação por captura de tela na task 13; se ilegível, aumentar o tamanho base |
| Fonte ainda não carregada na primeira cena | `BootScene` aguarda `document.fonts.load` antes de desenhar texto |

## Consequências

- **Positivas:** todas as telas com texto ficam prontas sem desenhar glifos.
- **Negativas:** o texto não segue exatamente a grade de pixels dos sprites.

## ADRs relacionadas

- ADR-002
