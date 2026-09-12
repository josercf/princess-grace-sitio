# ADR-003: personagens de Lobato em domínio público, visual próprio e fotos fora do repositório

- **Data:** 2026-09-12
- **Status:** Aceita
- **Decisores:** José Romualdo

## Contexto

O jogo usa personagens do Sítio do Picapau Amarelo e tem como protagonista uma criança real. O repositório é público.

Monteiro Lobato morreu em 1948. Os livros entraram em domínio público no Brasil em 1º de janeiro de 2019 (vida do autor mais 70 anos), e o mesmo prazo vale no Reino Unido. As adaptações para TV, com seus figurinos, caracterizações e marcas, continuam protegidas.

## Decisão

Usar apenas os personagens e as descrições dos livros, com visual desenhado do zero, e manter as fotos da criança fora do repositório, identificando a personagem só pelo apelido "Princess Grace".

## Motivações

- Os personagens literários podem ser usados livremente; o visual da TV não pode.
- Fotos de menor de idade em repositório público ficam indexadas e cacheadas mesmo depois de apagadas.
- O apelido reduz a exposição da criança.

## Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Sprite parecido demais com a caracterização da TV | Basear aparência só nas descrições dos livros; não consultar imagens das séries durante o desenho |
| Fotos adicionadas por engano | `.gitignore` bloqueia `references/`, `*.jpg`, `*.jpeg` e `*.heic` |
| Trechos dos livros com linguagem racista | Escrever diálogos novos; não reproduzir texto original; retratar a Tia Nastácia com respeito |

## Consequências

- **Positivas:** uso legal dos personagens; privacidade da criança preservada.
- **Negativas:** nenhuma referência visual pronta para os personagens do Sítio.

## ADRs relacionadas

- ADR-002
