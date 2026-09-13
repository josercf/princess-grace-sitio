# ADR-006: renderização na resolução do aparelho

- **Data:** 2026-09-12
- **Status:** Aceita
- **Decisores:** José Romualdo

## Contexto

O canvas tinha 320×180 px internos e era ampliado pelo CSS (ADR-005). A arte em pixel resistia à ampliação, mas o texto do `Phaser.GameObjects.Text` (Pixelify Sans, 8 a 20 px) era rasterizado em 320×180 e depois esticado. No iPhone 13 na horizontal (fator 1,9, densidade 3) e em navegadores de desktop o texto aparecia borrado ou com traços de larguras desiguais.

## Decisão

Desenhar o canvas na densidade real de pixels da tela e manter todas as coordenadas do jogo na base de 320×180, com a câmera de cada cena ampliada pela resolução interna.

## Motivações

- `renderScale` em `src/core/scale.ts` calcula `displayZoom` (tamanho CSS, igual ao da ADR-005) e `resolution = min(8, max(1, round(displayZoom × devicePixelRatio)))`, a quantidade de pixels internos por pixel base.
- O canvas tem `320×resolution` por `180×resolution` px internos e é exibido com `scale.zoom = displayZoom / resolution`, então o tamanho na tela não muda.
- Cada cena troca a câmera principal por uma câmera com origem em (0, 0) e zoom igual à resolução (`useDeviceResolution` em `src/game/resolution.ts`). No Phaser 3.90 o zoom é aplicado em torno da origem da câmera (`Camera.preRender`), e objetos com `scrollFactor 0` ignoram a rolagem. Com a origem no centro, o HUD do mapa sairia da tela; com a origem no canto, desenho, entrada (`getWorldPoint`, `hitTest`) e `scrollFactor 0` ficam corretos em coordenadas base.
- Os métodos do Phaser que supõem origem no centro (`clampX`, `clampY`, `centerOnX`, `centerOnY`, `startFollow` e `worldView`, usado no corte de tiles) são ajustados na subclasse para a origem no canto. Limites e acompanhamento da câmera no mapa continuam iguais.
- `addText` cria cada texto com `resolution` igual à do canvas, e cada pixel da textura dos glifos corresponde a um pixel interno.

## Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Canvas grande consome memória de GPU e reduz a taxa de quadros em aparelhos fracos (em 1920×1080 com densidade 2, 2560×1440 px) | `MAX_RESOLUTION = 8` limita o canvas a 2560×1440 px; o jogo tem poucos objetos e nenhum efeito de pós-processamento |
| Arredondamento de `displayZoom × devicePixelRatio` gera diferença de até 5% entre pixels internos e pixels do aparelho (iPhone 13: 6 internos para 5,7 do aparelho) | `image-rendering: pixelated` no canvas; teste e2e exige canvas interno com pelo menos 90% da largura CSS vezes `devicePixelRatio` |
| Atualização do Phaser mudar os métodos de câmera que a subclasse sobrescreve | Versão do Phaser fixada em 3.90.0; testes e2e tocam botões fixos (HUD) e móveis (esconderijos) pelas coordenadas da câmera |
| Textos criados antes de uma mudança de resolução (rotação, zoom do navegador, troca de monitor) ficam com a resolução antiga | Aceito: a cena seguinte cria textos na resolução nova; a ampliação CSS e a câmera são atualizadas na hora |
| Sprites em movimento podem parar entre pixels base, em frações de pixel interno | `roundPixels` na câmera do mapa arredonda a rolagem em pixels base; a filtragem continua nearest-neighbour (`pixelArt: true`) |

## Consequências

- **Positivas:** texto nítido em celulares e desktops; nenhuma cena precisou mudar coordenadas; o posicionamento dos elementos é o mesmo de antes.
- **Negativas:** mais memória de GPU por quadro; toda cena nova precisa chamar `useDeviceResolution` no início do `create`; a câmera depende de uma subclasse que conhece detalhes internos do Phaser 3.90.

## ADRs relacionadas

- ADR-004
- ADR-005
