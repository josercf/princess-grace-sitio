# Pendências registradas ao fim do plano 1

- **Data:** 2026-09-12
- **Origem:** revisões por tarefa e revisão final do plano 1 (`2026-09-12-fundacao-e-fase-1.md`)

## Requisitos do spec ainda não atendidos

| Item | Referência no spec | Plano |
|---|---|---|
| Setas do teclado e barra de espaço como alternativa no computador | Seção 5, Controles | 2 |
| Palavras-chave do vocabulário sempre nos dois idiomas (ex.: "onça / jaguar") nas frases, esconderijos e lenda | Seção 3, Idioma | 2 |
| Área de toque de 44×44 px na tela: teclas do nome (21 px de largura) e peças do desafio de montar palavra (22 px) | Seção 5, Controles | 2 |
| Troca de idioma durante diálogos e na abertura | Seção 1, critério 2 | 2 |

## Comportamento a ajustar no plano 2

| Item | Arquivo |
|---|---|
| Passo concluído só é salvo depois do diálogo final; recarregar nesse momento repete o desafio | `src/scenes/MapScene.ts` |
| Ligar idiomas só funciona tocando primeiro na coluna da esquerda; cores dos pares mudam ao religar | `src/scenes/challenges/WordMatchView.ts` |
| Toque duplo rápido pula falas de diálogo, inclusive a dica | `src/scenes/DialogueScene.ts` |
| Modo de teste liga com qualquer `?e2e`, inclusive `?e2e=0`; `?seed=` vazio vira semente 0 | `src/game/testHook.ts`, `src/game/context.ts` |
| `translate` não usa o outro idioma como reserva nem avisa chave ausente | `src/core/strings.ts` |
| Chave de teste `.probe` fica no `localStorage`; `load()` com erro não marca o armazenamento como indisponível | `src/core/progress.ts` |
| Dica de completar frase converte para maiúscula com regra pt-BR também em inglês | `src/core/challenges/fillSentence.ts` |
| Contagem mínima de esconderijos e perguntas da lenda sem verificação explícita | `src/core/challenges/clueHunt.ts`, `comprehension.ts` |
| `setButtonFill` depende da posição do fundo na lista do contêiner | `src/game/ui.ts` |
| Um ouvinte de `shutdown` é criado a cada abertura do menu | `src/scenes/MapScene.ts` |
| Sem teste de navegador para o botão Recomeçar | `tests/e2e/` |
| Actions v4 com aviso de descontinuação do Node 20 | `.github/workflows/ci.yml` |
| `tools/build-maps.ts` usa o tileset `pomar` para todo mapa | `tools/build-maps.ts` |
| Rótulo "sweetcorn field" pode quebrar em duas linhas no marcador; conferir com captura em inglês | `src/content/en.json` |

## Arte e ferramentas, plano 3

| Item | Arquivo |
|---|---|
| Marcador "pedra grande" cobre o nome do Saci durante a caça | `src/scenes/MapScene.ts` |
| `@types/pngjs` 6 com `pngjs` 7 | `package.json` |
| `SpriteError` e `MapError` sem `name`; validação de paleta repetida no renderizador | `tools/sprites/`, `tools/maps/` |
| Erro de largura do mapa informa índice filtrado, não a linha do arquivo | `tools/maps/parse.ts` |
| Cor amarela nas flores do retrato fora da tabela do brief; asserções não nulas no script de desenho | `tools/draw/grace-portrait.ts` |
