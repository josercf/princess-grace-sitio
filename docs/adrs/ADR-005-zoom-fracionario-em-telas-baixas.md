# ADR-005: ampliação fracionária em telas baixas

- **Data:** 2026-09-12
- **Status:** Aceita
- **Decisores:** José Romualdo

## Contexto

O jogo desenha em 320×180 px e ampliava a tela apenas por múltiplos inteiros (`Math.floor` do menor fator entre largura e altura). No iPhone 13 na horizontal a área visível tem 750×342 px CSS, o fator exato é 1,9 e a ampliação caía para 1x. O canvas ficava com 180 px de altura, e os textos apareciam com 8 a 11 px CSS, pequenos demais para uma criança de 8 anos.

## Decisão

Usar ampliação inteira a partir de 2x e o fator exato (mínimo 1) abaixo de 2x, calculados por `displayZoom` em `src/core/scale.ts`.

## Motivações

- Celulares comuns na horizontal têm altura útil entre 320 e 360 px CSS, faixa em que o arredondamento para baixo desperdiçava quase metade da tela.
- Com fator 1,9 o canvas passa a ocupar 342 px de altura e os textos voltam a ter tamanho legível.
- A partir de 2x o fator inteiro mantém os pixels uniformes, e a perda de área nessa faixa é pequena.

## Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Pixels com larguras desiguais abaixo de 2x (algumas colunas com 1 px CSS, outras com 2 px) | `image-rendering: pixelated` no canvas; verificação por captura de tela nos dois celulares de teste |
| Toques calculados com arredondamento diferente do desenho | O teste e2e converte coordenadas pela largura real do canvas (`getBoundingClientRect`), sem supor fator inteiro |
| Regressão para 1x em telas baixas | Teste e2e exige canvas com pelo menos 300 px de altura no Pixel 7 e no iPhone 13 na horizontal |

## Consequências

- **Positivas:** textos e botões legíveis em celulares baixos; o jogo usa quase toda a altura da tela.
- **Negativas:** abaixo de 2x a arte perde a grade de pixels perfeitamente uniforme.

## ADRs relacionadas

- ADR-004
