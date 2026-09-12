# Princess Grace no Sítio: design do jogo

- **Data:** 2026-09-12
- **Status:** aprovado em conversa, aguardando revisão do documento
- **Repositório:** `josercf/princess-grace-sitio` (público)
- **Publicação:** GitHub Pages, `https://josercf.github.io/princess-grace-sitio/`

## 1. Objetivo

Jogo educativo em pixel art, jogado no navegador do celular, com duas fases. A personagem principal é a Princess Grace, inspirada na sobrinha do autor (8 anos, bilíngue, mora no Reino Unido, cursa o Year 3). O jogo leva elementos da cultura brasileira até ela usando os personagens dos livros do Sítio do Picapau Amarelo, de Monteiro Lobato.

### Público e contexto de uso

- Criança de 8 anos, leitora em português e inglês
- Celular na horizontal, controle por toque
- Sessões de 10 a 15 minutos por fase

### Critérios de sucesso

1. As duas fases são concluídas do começo ao fim no celular, sem teclado.
2. Todo texto existe em português e inglês, com escolha na tela inicial e troca a qualquer momento pelo menu.
3. A criança reconhece a si mesma no retrato da personagem (óculos lilás, cabelo comprido, sorriso sem os dentes da frente).
4. Os desafios de matemática ficam dentro do conteúdo do Year 3.
5. O jogo não tem game over: todo erro leva a uma dica e a uma nova tentativa.

### Fora do escopo desta versão

- Música de fundo
- Mais de duas fases
- Contas de usuário, ranking ou sincronização entre aparelhos
- Narração falada (áudio gravado ou voz sintetizada)
- Modo retrato (vertical)

## 2. História

### Abertura

Grace está no quarto dela, na Inglaterra, lendo um livro antigo vindo do Brasil. As páginas brilham e ela e a coelha de pelúcia são puxadas para dentro da história. As duas chegam ao Sítio do Picapau Amarelo, onde a coelha ganha vida e passa a falar. A Emília explica o problema: a Cuca fez um feitiço que apagou as palavras do livro da Dona Benta e bagunçou a cozinha da Tia Nastácia antes da festa do Sítio.

A coelha não tem nome definido. Na abertura, Grace digita o nome da coelha (máximo de 12 letras, com sugestões em botões para quem não quiser digitar). Esse nome é usado em todos os diálogos.

### Fase 1: o pomar das palavras (leitura e vocabulário bilíngue)

Cenário: pomar de jabuticabeiras e beira do ribeirão. As palavras apagadas viraram letras soltas penduradas nas árvores, e o Saci esconde algumas delas.

| # | Desafio | Personagem | Mecânica |
|---|---|---|---|
| 1 | Montar palavra | Emília | Tocar nas letras coletadas na ordem certa para formar uma palavra (ex.: JABUTICABA, MILHO, ONÇA) |
| 2 | Ligar idiomas | Visconde | Ligar cada palavra em português à palavra correspondente em inglês (ex.: onça e jaguar, milho e corn) |
| 3 | Completar frase | Dona Benta | Escolher, entre três opções, a palavra que completa uma frase da história |
| 4 | Caça ao Saci | Saci | Ler três pistas escritas e tocar no lugar do mapa onde o Saci está |
| 5 | Página restaurada | Dona Benta | Ler a lenda curta restaurada e responder duas perguntas de compreensão |

### Fase 2: a cozinha da Tia Nastácia (matemática do Year 3)

Cenário: cozinha e quintal da casa. Faltam doces para a festa e o Saci trocou os ingredientes de lugar.

| # | Desafio | Personagem | Conteúdo |
|---|---|---|---|
| 1 | Bolinhos de chuva | Tia Nastácia | Adição e subtração com resultado entre 0 e 100 |
| 2 | Bandejas de brigadeiro | Visconde | Multiplicação nas tabelas de 2, 3, 4, 5 e 10 |
| 3 | Repartir pão de queijo | Emília | Divisão exata por 2, 3, 4, 5 ou 10, com dividendo até 50 |
| 4 | Receita | Tia Nastácia | Medidas: somar xícaras e colheres, ler escala simples de 0 a 1000 g em múltiplos de 100 |
| 5 | Enigma da Cuca | Cuca | Sequência numérica de três etapas combinando as operações anteriores |

Os problemas são gerados a partir de modelos com semente aleatória, para variar a cada partida.

### Final

Festa junina no terreiro, com fogueira e bandeirinhas. Narizinho e Pedrinho aparecem. A Dona Benta conta a história salva e Grace recebe uma coroa de flores de jabuticaba.

## 3. Regras de aprendizagem

- **Erro:** a coelha dá uma dica específica do desafio e a tentativa recomeça. Não existe perda de vida nem reinício de fase.
- **Dificuldade adaptativa:** três níveis por desafio (1 fácil, 2 normal, 3 difícil). O jogo começa no nível 2. Dois erros seguidos baixam um nível no desafio seguinte. Três acertos seguidos sem dica sobem um nível.
- **Idioma:** narração, diálogos e enunciados seguem o idioma escolhido. Palavras-chave do vocabulário aparecem sempre nos dois idiomas (ex.: "onça / jaguar").
- **Progresso:** salvo no `localStorage` do aparelho ao fim de cada desafio. Guarda idioma, nome da coelha, desafios concluídos e nível de dificuldade atual. O menu permite reiniciar.

## 4. Personagens e arte

### Tela

- Orientação horizontal, resolução base de 320×180 px, ampliação em múltiplos inteiros (`pixelArt: true`)
- Com o celular na vertical, aparece um aviso pedindo para girar
- Paleta única de 32 cores, com rosa e lilás (Grace), verdes (Sítio) e roxo (jabuticaba)

### Grace

| Elemento | Tamanho | Conteúdo |
|---|---|---|
| Sprite no mapa | 24×32 px | Cabelo castanho claro comprido, óculos lilás, vestido rosa com flores, coroa pequena. Quatro direções, quatro quadros de caminhada por direção. |
| Retrato | 96×96 px | Óculos lilás, sorriso sem os dentes da frente, presilhas de flor |
| Expressões | 5 | Feliz, surpresa, careta com a língua de fora, pensando, comemorando |

### Coelha

Sprite de 16×16 px que segue a Grace. Retrato de 96×96 px com óculos rosa, vestido de lantejoulas e patins coloridos. Três expressões: feliz, dando dica, preocupada.

### Personagens do Sítio

Desenhados a partir das descrições dos livros, sem referência ao visual das adaptações da TV Globo.

| Personagem | Aparência | Função | Arte |
|---|---|---|---|
| Emília | Boneca de pano, olhos de retrós, vestido de chita | Guia da história | Sprite e retrato |
| Dona Benta | Avó de óculos redondos e coque | Conta as lendas | Sprite e retrato |
| Tia Nastácia | Cozinheira de avental e lenço | Dona da fase 2 | Sprite e retrato |
| Visconde de Sabugosa | Sabugo de milho de cartola | Explica os desafios | Sprite e retrato |
| Saci | Menino de uma perna só, gorro vermelho, sem cachimbo | Esconde letras e ingredientes | Sprite e retrato |
| Cuca | Jacaré bruxa | Vilã do enigma final | Sprite e retrato |
| Narizinho, Pedrinho | Crianças do Sítio | Presentes na festa final | Só sprite |

A Tia Nastácia é retratada com respeito, sem os estereótipos presentes em edições antigas dos livros. Diálogos novos são escritos para o jogo; nenhum trecho original com linguagem racista é reproduzido.

### Cenários

Tiles de 16×16 px para cinco áreas: casa do Sítio, pomar de jabuticabeiras, beira do ribeirão, cozinha, terreiro da festa. Mapas montados no editor Tiled e exportados em JSON.

### Texto e som

- Fonte bitmap com suporte a acentos e cedilha (á, â, ã, é, ê, í, ó, ô, õ, ú, ç)
- Efeitos sonoros sintetizados com Web Audio (acerto, erro, passo, coleta), sem arquivos de áudio

## 5. Arquitetura

### Stack

- Vite, TypeScript (modo `strict`), Phaser 3
- Vitest para testes de unidade, Playwright para testes no navegador
- GitHub Actions para CI e deploy no GitHub Pages

### Organização

```
src/
  main.ts              configuração do Phaser e registro das cenas
  scenes/
    BootScene.ts       carrega assets e progresso
    LanguageScene.ts   escolha de idioma
    IntroScene.ts      abertura e nome da coelha
    MapScene.ts        exploração, movimento e gatilhos de desafio
    DialogueScene.ts   caixa de diálogo com retrato (sobreposta ao mapa)
    ChallengeScene.ts  apresenta um desafio a partir do módulo em core/challenges
    EndingScene.ts     festa final
  core/                TypeScript puro, sem importar Phaser
    i18n.ts            carregar textos, trocar idioma, interpolar variáveis
    progress.ts        serializar, validar e salvar progresso
    difficulty.ts      regra de subir e descer nível
    rng.ts             gerador pseudoaleatório com semente
    pathfinding.ts     busca de caminho A* em grade
    challenges/
      types.ts         interface Challenge
      wordBuild.ts
      wordMatch.ts
      fillSentence.ts
      clueHunt.ts
      comprehension.ts
      addSub.ts
      multiply.ts
      divide.ts
      measure.ts
      riddle.ts
  content/
    pt.json, en.json   todos os textos, com as mesmas chaves
    phase1.json        palavras, frases, pistas e lenda
    phase2.json        modelos de problemas
art/
  palette.json         32 cores nomeadas
  sprites/*.txt        cada sprite como matriz de caracteres mapeados na paleta
tools/
  build-sprites.ts     converte art/ em PNG em public/assets/
maps/                  mapas Tiled em JSON
tests/
  unit/                Vitest
  e2e/                 Playwright
docs/
  adrs/
  superpowers/specs/
```

### Contrato dos desafios

Cada módulo em `core/challenges/` implementa:

```ts
interface Challenge<Q, A> {
  id: string;
  generate(level: 1 | 2 | 3, rng: Rng, locale: Locale): Q;
  check(question: Q, answer: A): boolean;
  hint(question: Q, locale: Locale): string;
}
```

As cenas do Phaser só apresentam a pergunta e coletam a resposta. Toda regra fica em `core/`.

### Fluxo de dados

1. `BootScene` lê o progresso. Se ele não existir ou falhar na validação, começa um progresso novo.
2. `MapScene` detecta quando a Grace chega a um gatilho e abre `DialogueScene` e depois `ChallengeScene`.
3. `ChallengeScene` pede o nível atual a `difficulty.ts`, gera a pergunta, confere a resposta e devolve o resultado.
4. O resultado atualiza o nível e marca o desafio como concluído em `progress.ts`, que salva no `localStorage`.

### Controles

- Toque no chão: a Grace anda até o ponto usando A* na grade de colisão do mapa
- Toque em personagem ou objeto: a Grace anda até ele e inicia a interação
- Setas do teclado e barra de espaço como alternativa no computador
- Botões de resposta com área mínima de 44×44 px na tela

### Pixel art gerada por código

Cada arquivo em `art/sprites/` descreve uma imagem como linhas de caracteres, onde cada caractere corresponde a uma cor de `palette.json` e `.` representa transparência. `tools/build-sprites.ts` valida e gera os PNGs e as spritesheets. O script roda antes de `dev` e de `build`. Os PNGs gerados não são versionados.

As fotos de referência da criança não entram no repositório nem na pasta do projeto.

### Tratamento de erros

| Situação | Comportamento |
|---|---|
| `localStorage` indisponível (modo privado) | O jogo funciona sem salvar e mostra um aviso discreto no menu |
| Progresso salvo inválido ou de versão antiga | Descartado, começa um progresso novo |
| Chave de texto ausente no idioma escolhido | Usa o texto do outro idioma e registra aviso no console (os testes impedem que isso chegue à produção) |
| Asset que falha ao carregar | `BootScene` mostra mensagem com botão para tentar de novo |

## 6. Testes

| Camada | Ferramenta | Casos |
|---|---|---|
| Textos | Vitest | `pt.json` e `en.json` têm exatamente as mesmas chaves; nenhuma string vazia; interpolação de `{nome}` funciona |
| Desafios de leitura | Vitest | Palavras montáveis com as letras oferecidas; pares pt/en sem duplicata; opção correta presente entre as três; resposta certa aceita e erradas rejeitadas |
| Desafios de matemática | Vitest | Para 1000 sementes por nível: resultados de adição e subtração entre 0 e 100; multiplicação só nas tabelas 2, 3, 4, 5 e 10; divisões exatas com dividendo até 50; enigma com resposta inteira única |
| Dificuldade | Vitest | Dois erros baixam o nível; três acertos sobem; limites 1 e 3 respeitados |
| Progresso | Vitest | Ida e volta de serialização; JSON corrompido gera progresso novo; versão antiga é descartada |
| Caminho | Vitest | A* encontra caminho existente, contorna obstáculo e retorna vazio sem caminho |
| Arquitetura | Vitest | Nenhum arquivo em `src/core/` importa `phaser` |
| Arte | Vitest | Todas as linhas de um sprite com a mesma largura; dimensões iguais às declaradas; só caracteres da paleta |
| Jogo no navegador | Playwright, perfis Pixel 7 e iPhone 13 em paisagem | Jogo abre sem erro no console; escolha e troca de idioma; roteiro automático conclui as duas fases usando um modo de teste que expõe as respostas via `window.__GAME_TEST__` apenas quando a URL contém `?e2e=1` |

A CI roda lint, verificação de tipos, Vitest, build e Playwright. O deploy no GitHub Pages só acontece se tudo passar na branch `main`.

## 7. Decisões registradas em ADR

1. ADR-001: Phaser 3 com TypeScript e Vite
2. ADR-002: pixel art gerada por código a partir de matrizes de caracteres
3. ADR-003: personagens de Lobato em domínio público, visual próprio e fotos fora do repositório

## 8. Riscos

| Risco | Mitigação |
|---|---|
| Retrato gerado por código não parecer com a criança | Iterar o retrato primeiro, com prévia no navegador, antes de produzir os demais sprites |
| Volume de arte (8 personagens, 5 cenários) atrasar o jogo | Construir a fase 1 inteira com arte provisória simples e trocar a arte depois |
| Texto pequeno demais em celular | Fonte base de 8 px na resolução 320×180. Celulares comuns em paisagem têm cerca de 390 px CSS de altura, o que dá ampliação 2× e texto de 16 px na tela. Validar com captura de tela no Playwright e aumentar a fonte base para 10 px se a leitura ficar difícil |
| Uso dos personagens contestado | Base exclusiva nos livros em domínio público, sem nomes ou visual da marca da TV |
