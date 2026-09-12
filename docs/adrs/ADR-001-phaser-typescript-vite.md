# ADR-001: Phaser 3 com TypeScript e Vite

- **Data:** 2026-09-12
- **Status:** Aceita
- **Decisores:** José Romualdo

## Contexto

O jogo precisa rodar no navegador do celular, com controle por toque, mapa com câmera e colisão, animação de sprites e publicação gratuita no GitHub Pages. As alternativas avaliadas foram Phaser 3, Canvas sem biblioteca e Godot com exportação web.

## Decisão

Construir o jogo com Phaser 3, TypeScript em modo `strict` e Vite.

## Motivações

- O pacote final tem cerca de 1 MB, contra 30 a 40 MB da exportação web do Godot, o que importa em conexão móvel.
- Toque, câmera, colisão, tweens e leitura de mapas do Tiled já vêm prontos, o que o Canvas puro exigiria escrever do zero.
- O código é todo em texto, sem depender de editor visual, o que facilita revisão e manutenção.
- A lógica educativa fica em módulos TypeScript puros, testáveis com Vitest sem abrir o navegador.

## Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Phaser 4 substituir o Phaser 3 | Fixar a versão no `package.json`; o jogo é pequeno e a migração, se necessária, fica restrita a `src/scenes/` |
| Acoplamento da lógica ao Phaser | Regra de arquitetura: `src/core/` não importa Phaser, verificada por teste |

## Consequências

- **Positivas:** carregamento rápido, testes de lógica isolados, deploy estático simples.
- **Negativas:** sem editor visual de cenas; posições de interface são definidas em código.

## ADRs relacionadas

- ADR-002
