# ADR-002: pixel art gerada por código a partir de matrizes de caracteres

- **Data:** 2026-09-12
- **Status:** Aceita
- **Decisores:** José Romualdo

## Contexto

O jogo precisa de sprites, retratos de 96×96 px e tiles. Não há ilustrador no projeto, e a arte precisa ser ajustada várias vezes até a personagem se parecer com a criança.

## Decisão

Descrever cada imagem como uma matriz de caracteres em `art/sprites/*.txt`, mapeada em uma paleta de 32 cores em `art/palette.json`, e gerar os PNGs com o script `tools/build-sprites.ts`.

Os mapas seguem o mesmo princípio: cada mapa é um arquivo ASCII em `maps/`, convertido por `tools/build-maps.ts` para o formato JSON do Tiled. O JSON gerado abre no editor Tiled para inspeção, mas a fonte versionada é o arquivo ASCII.

## Motivações

- Ajustes pedidos em texto ("cabelo mais claro", "óculos maiores") viram edições pequenas e revisáveis em diff.
- A paleta única garante coerência visual entre todos os personagens e cenários.
- O formato permite validação automática de dimensões e cores.

## Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Retratos grandes ficarem pouco expressivos | Produzir e aprovar o retrato da Grace antes dos demais |
| Arquivos de texto grandes para retratos de 96×96 | Um arquivo por expressão; se virar gargalo, permitir retoque em Aseprite e importar o PNG como fonte |

## Consequências

- **Positivas:** arte versionada, revisável e testável; sem dependência de ferramenta externa.
- **Negativas:** desenhar pixel a pixel em texto é mais lento que em editor gráfico.

## ADRs relacionadas

- ADR-001
- ADR-003
