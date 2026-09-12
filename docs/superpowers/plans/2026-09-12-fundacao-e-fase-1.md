# Princess Grace no Sítio: plano 1, fundação e fase 1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar no GitHub Pages uma versão jogável no celular com abertura, escolha de idioma, nome da coelha e a fase 1 completa (cinco desafios de leitura e vocabulário), com arte provisória nos personagens e o retrato definitivo da Grace.

**Architecture:** Phaser 3 cuida de cenas, mapa, toque e desenho. Toda a regra de jogo (desafios, idiomas, progresso, dificuldade, caminho, sequência da fase) fica em `src/core/`, em TypeScript puro testado com Vitest. A arte e os mapas são arquivos de texto convertidos em PNG e JSON do Tiled por scripts em `tools/`.

**Tech Stack:** Node 22+, Vite 8, TypeScript 5.9.3, Phaser 3.90.0, Vitest 5, Playwright 1.63, pngjs 7, tsx 4, ESLint 10 com typescript-eslint 8, @fontsource/pixelify-sans 5.

**Spec:** `docs/superpowers/specs/2026-09-12-princess-grace-sitio-design.md`

**Plano 1 de 3.** O plano 2 cobre a fase 2 e o final. O plano 3 cobre a arte definitiva dos demais personagens, cenários e expressões.

## Global Constraints

- Phaser fixado em `3.90.0` exato; TypeScript fixado em `5.9.3`.
- Resolução base 320×180, `pixelArt: true`, ampliação em múltiplos inteiros.
- Orientação horizontal; aviso para girar em celular na vertical.
- Nenhum arquivo em `src/core/` importa `phaser`.
- Todo texto visível existe em `src/content/pt.json` e `src/content/en.json`, com as mesmas chaves.
- Textos em pt-BR com acentuação completa. Nenhum texto do jogo, da documentação ou dos commits usa o caractere travessão (U+2014).
- Botões com altura mínima de 22 px na resolução base (44 px na tela com ampliação 2×).
- Fotos da criança nunca entram no repositório (ADR-003).
- `vite.config.ts` usa `base: '/princess-grace-sitio/'`.
- Repositório `josercf/princess-grace-sitio`, público. Push sempre como `josercf`:
  `GIT_SSH_COMMAND='ssh -i /Users/joseromualdocostafilho/.ssh/id_ed25519_josercf -o IdentitiesOnly=yes -F /dev/null' git push`
- Mensagens de commit terminam com:
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01Lf6p8JxQ9QGGeAb5say2qv
  ```
  Nos passos de commit abaixo, esse rodapé está omitido por brevidade e deve ser sempre incluído.

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/core/scale.ts` | Cálculo da ampliação inteira |
| `src/core/locale.ts` | Tipo `Locale` e idioma oposto |
| `src/core/rng.ts` | Gerador aleatório com semente |
| `src/core/difficulty.ts` | Níveis 1 a 3 e regra de subir e descer |
| `src/core/progress.ts` | Formato, validação e armazenamento do progresso |
| `src/core/i18n.ts` | Interpolação e troca de idioma |
| `src/core/strings.ts` | Dicionários carregados e `translate` |
| `src/core/names.ts` | Formatação do nome da coelha |
| `src/core/pathfinding.ts` | A* em grade |
| `src/core/phaseFlow.ts` | Sequência de passos da fase 1 |
| `src/core/navigation.ts` | Cena inicial a partir do progresso |
| `src/core/challenges/*.ts` | Um desafio por arquivo: gerar, conferir, dica |
| `src/content/*.json` | Textos e conteúdo da fase 1 |
| `src/game/*.ts` | Contexto do jogo, UI, placeholders, overlays, gancho de teste |
| `src/scenes/*.ts` | Cenas do Phaser |
| `src/scenes/challenges/*.ts` | Telas de cada desafio |
| `tools/sprites/*.ts`, `tools/build-sprites.ts` | Matriz de texto para PNG |
| `tools/maps/*.ts`, `tools/build-maps.ts` | Mapa ASCII para JSON do Tiled |
| `art/`, `maps/` | Fontes da arte e dos mapas |
| `tests/unit/`, `tests/e2e/` | Vitest e Playwright |

---

### Task 1: Estrutura do projeto e ampliação inteira

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `index.html`, `src/style.css`, `src/vite-env.d.ts`, `src/main.ts`, `src/core/scale.ts`, `src/scenes/BootScene.ts`
- Test: `tests/unit/scale.test.ts`, `tests/unit/architecture.test.ts`

**Interfaces:**
- Produces: `BASE_WIDTH = 320`, `BASE_HEIGHT = 180`, `integerZoom(viewWidth: number, viewHeight: number): number`

- [ ] **Step 1: Criar `package.json` e instalar dependências**

```json
{
  "name": "princess-grace-sitio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "art": "tsx tools/build-sprites.ts",
    "maps": "tsx tools/build-maps.ts",
    "assets": "npm run art && npm run maps",
    "dev": "npm run assets && vite",
    "build": "npm run assets && tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Os scripts `art` e `maps` só passam a existir nas tasks 3 e 7. Até lá, use `npx vite` e `npx vitest run` diretamente.

Run:
```bash
npm install --save-exact phaser@3.90.0 @fontsource/pixelify-sans@5
npm install --save-dev --save-exact typescript@5.9.3
npm install --save-dev vite@^8 vitest@^5 @playwright/test@^1.63 pngjs@^7 @types/pngjs tsx@^4 eslint@^10 typescript-eslint@^8 @types/node@^22
```
Expected: instalação sem erro de peer dependency.

- [ ] **Step 2: Criar configurações**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src", "tests", "tools", "vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/princess-grace-sitio/',
  build: { assetsInlineLimit: 0 },
});
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
```

`eslint.config.js`:
```js
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public/assets/generated', 'playwright-report', 'test-results'] },
  ...tseslint.configs.recommended,
);
```

`src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```

- [ ] **Step 3: Escrever os testes que falham**

`tests/unit/scale.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { integerZoom } from '../../src/core/scale';

describe('integerZoom', () => {
  it.each([
    [844, 390, 2],
    [915, 412, 2],
    [320, 180, 1],
    [1280, 720, 4],
    [1920, 1080, 6],
  ])('%i×%i usa ampliação %i', (w, h, expected) => {
    expect(integerZoom(w, h)).toBe(expected);
  });

  it('nunca retorna menos que 1', () => {
    expect(integerZoom(200, 100)).toBe(1);
  });

  it('usa o menor eixo', () => {
    expect(integerZoom(2000, 200)).toBe(1);
  });
});
```

`tests/unit/architecture.test.ts`:
```ts
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

function tsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return tsFiles(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

it('nenhum arquivo em src/core importa phaser', () => {
  const offenders = tsFiles('src/core').filter((file) =>
    /from\s+['"]phaser['"]/.test(readFileSync(file, 'utf8')),
  );
  expect(offenders).toEqual([]);
});
```

- [ ] **Step 4: Rodar e ver falhar**

Run: `npx vitest run`
Expected: FAIL em `scale.test.ts` (módulo não encontrado) e em `architecture.test.ts` (diretório `src/core` inexistente).

- [ ] **Step 5: Implementar `src/core/scale.ts`**

```ts
export const BASE_WIDTH = 320;
export const BASE_HEIGHT = 180;

export function integerZoom(viewWidth: number, viewHeight: number): number {
  const zoom = Math.floor(Math.min(viewWidth / BASE_WIDTH, viewHeight / BASE_HEIGHT));
  return Math.max(1, zoom);
}
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npx vitest run`
Expected: PASS, 7 testes.

- [ ] **Step 7: Criar página, estilo, cena inicial e `main.ts`**

`index.html`:
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#1a1423" />
    <title>Princess Grace no Sítio</title>
  </head>
  <body>
    <div id="game"></div>
    <div id="rotate">
      <p lang="pt-BR">Gire o celular para jogar</p>
      <p lang="en">Turn your phone sideways to play</p>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`src/style.css`:
```css
html,
body {
  margin: 0;
  height: 100%;
  background: #1a1423;
  overflow: hidden;
  touch-action: none;
}

#game {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

#game canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

#rotate {
  display: none;
  position: fixed;
  inset: 0;
  background: #1a1423;
  color: #fff8f0;
  font-family: 'Pixelify Sans', sans-serif;
  font-size: 24px;
  text-align: center;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

@media (orientation: portrait) and (pointer: coarse) {
  #rotate {
    display: flex;
  }
}
```

`src/scenes/BootScene.ts` (versão provisória, substituída na task 10):
```ts
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.add.text(160, 90, 'Princess Grace', { color: '#fff8f0' }).setOrigin(0.5);
  }
}
```

`src/main.ts` (versão provisória, ampliada na task 10):
```ts
import Phaser from 'phaser';
import './style.css';
import { BASE_HEIGHT, BASE_WIDTH, integerZoom } from './core/scale';
import { BootScene } from './scenes/BootScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  pixelArt: true,
  backgroundColor: '#1a1423',
  scale: { mode: Phaser.Scale.NONE, zoom: integerZoom(window.innerWidth, window.innerHeight) },
  scene: [BootScene],
});

window.addEventListener('resize', () => {
  game.scale.setZoom(integerZoom(window.innerWidth, window.innerHeight));
});
```

- [ ] **Step 8: Verificar tipos, lint e servidor local**

Run: `npx tsc --noEmit && npx eslint . && npx vite --port 5173`
Expected: sem erros; em `http://localhost:5173/princess-grace-sitio/` aparece "Princess Grace" centralizado. Encerrar o servidor com Ctrl+C.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts eslint.config.js index.html src tests
git commit -m "chore: estrutura do projeto com Vite, Phaser e ampliação inteira"
```

---

### Task 2: Repositório no GitHub, CI e publicação no Pages

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`, `.github/workflows/ci.yml`, `README.md`

**Interfaces:**
- Consumes: jogo da task 1
- Produces: pipeline que roda lint, tipos, Vitest, Playwright e publica `dist/` em `https://josercf.github.io/princess-grace-sitio/`

- [ ] **Step 1: Configurar Playwright**

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:4173/princess-grace-sitio/';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'pixel-7', use: { ...devices['Pixel 7 landscape'] } },
    { name: 'iphone-13', use: { ...devices['iPhone 13 landscape'] } },
  ],
});
```

Enquanto os scripts `art` e `maps` não existem, trocar temporariamente em `package.json` o script `build` por `"tsc --noEmit && vite build"`. A task 3 restaura a versão completa.

Run: `npx playwright install chromium webkit`

- [ ] **Step 2: Escrever o teste de fumaça**

`tests/e2e/smoke.spec.ts`:
```ts
import { expect, test } from '@playwright/test';

test('o jogo abre sem erros no console', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('./');
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.waitForTimeout(1500);

  expect(errors).toEqual([]);
});
```

- [ ] **Step 3: Rodar o teste no navegador**

Run: `npx playwright test`
Expected: PASS nos projetos `pixel-7` e `iphone-13`.

- [ ] **Step 4: Criar o workflow**

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npx playwright install --with-deps chromium webkit
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report
      - if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`npm run test:e2e` executa `npm run build` pelo `webServer`, que também roda `tsc --noEmit`; por isso `dist/` já existe no passo de upload.

- [ ] **Step 5: Criar `README.md`**

```markdown
# Princess Grace no Sítio

Jogo educativo em pixel art para celular. A Princesa Grace visita o Sítio do Picapau Amarelo e ajuda a Emília a desfazer o feitiço da Cuca com desafios de leitura, vocabulário bilíngue e matemática.

Jogar: https://josercf.github.io/princess-grace-sitio/

## Desenvolvimento

- `npm install`
- `npm run dev`: gera arte e mapas e abre o servidor local
- `npm test`: testes de unidade
- `npm run test:e2e`: testes no navegador com celular emulado

## Documentação

- Design: `docs/superpowers/specs/2026-09-12-princess-grace-sitio-design.md`
- Decisões: `docs/adrs/`

Personagens baseados nos livros de Monteiro Lobato, em domínio público desde 2019. O visual foi desenhado para este projeto.
```

- [ ] **Step 6: Commit, criar repositório e publicar**

```bash
git add playwright.config.ts tests/e2e .github README.md package.json
git commit -m "ci: testes, Playwright e publicação no GitHub Pages"
gh repo create josercf/princess-grace-sitio --public --description "Jogo educativo em pixel art: Princess Grace no Sítio do Picapau Amarelo"
git remote add origin git@github.com:josercf/princess-grace-sitio.git
GIT_SSH_COMMAND='ssh -i /Users/joseromualdocostafilho/.ssh/id_ed25519_josercf -o IdentitiesOnly=yes -F /dev/null' git push -u origin main
gh api -X POST repos/josercf/princess-grace-sitio/pages -f build_type=workflow
gh run rerun --failed "$(gh run list --repo josercf/princess-grace-sitio --limit 1 --json databaseId -q '.[0].databaseId')" || true
```

- [ ] **Step 7: Verificar a publicação**

Run: `gh run watch --repo josercf/princess-grace-sitio "$(gh run list --repo josercf/princess-grace-sitio --limit 1 --json databaseId -q '.[0].databaseId')"`
Expected: jobs `test` e `deploy` concluídos com sucesso; `curl -sI https://josercf.github.io/princess-grace-sitio/` retorna `200`.

---

### Task 3: Arte a partir de matrizes de texto

**Files:**
- Create: `art/palette.json`, `art/tiles/pomar.txt`, `tools/sprites/parse.ts`, `tools/sprites/render.ts`, `tools/build-sprites.ts`, `art-preview.html`
- Modify: `package.json` (restaurar script `build` completo com `npm run assets`, e script `maps` provisório)
- Test: `tests/unit/sprites.test.ts`

**Interfaces:**
- Produces:
  - `interface Palette { transparent: string; colors: Record<string, string> }`
  - `interface SpriteSheet { name: string; width: number; height: number; frames: string[][] }`
  - `class SpriteError extends Error`
  - `parseSprite(name: string, text: string, palette: Palette): SpriteSheet`
  - `hexToRgba(hex: string): [number, number, number, number]`
  - `renderSheet(sheet: SpriteSheet, palette: Palette): Buffer`
  - Arquivo gerado `public/assets/generated/manifest.json` no formato `{ "sprites": { "<nome>": { "file": "sprites/<nome>.png", "frameWidth": n, "frameHeight": n, "frames": n } } }`
  - Tileset `pomar` com 5 quadros na ordem: 0 grama, 1 caminho, 2 água, 3 cerca, 4 árvore

**Formato de arquivo de sprite:**
```
# comentário
@size 16 16
@frame
<16 linhas de 16 caracteres>
@frame
<...>
```
Cada caractere é uma chave de `palette.json`; `.` é transparente. Linhas de pixel não podem começar com `#` ou `@`, e nenhuma chave da paleta usa esses caracteres.

- [ ] **Step 1: Criar a paleta**

`art/palette.json`:
```json
{
  "transparent": ".",
  "colors": {
    "k": "#1a1423",
    "w": "#fff8f0",
    "s": "#f4c7a1",
    "S": "#d99a7a",
    "d": "#9c5b3b",
    "h": "#b08560",
    "H": "#7a5638",
    "y": "#e8c890",
    "l": "#c7a6e8",
    "L": "#8e6bbf",
    "p": "#f7a8c8",
    "P": "#d9679a",
    "m": "#ffd6e6",
    "r": "#d8343f",
    "R": "#8f1d2c",
    "o": "#f39c3c",
    "Y": "#f7d74a",
    "G": "#2e7d32",
    "g": "#5fae4a",
    "e": "#a6d86b",
    "b": "#6b4226",
    "B": "#3e2616",
    "t": "#c9905a",
    "j": "#4a1f5c",
    "J": "#7b3f99",
    "u": "#3b7dd8",
    "U": "#1f4e9c",
    "c": "#8fd3f4",
    "n": "#7a7a8c",
    "N": "#4a4a5a",
    "z": "#c8c8d4",
    "f": "#fbe3c4"
  }
}
```

- [ ] **Step 2: Escrever os testes que falham**

`tests/unit/sprites.test.ts`:
```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { parseSprite, SpriteError, type Palette } from '../../tools/sprites/parse';
import { hexToRgba, renderSheet } from '../../tools/sprites/render';

const palette = JSON.parse(readFileSync('art/palette.json', 'utf8')) as Palette;
const tiny: Palette = { transparent: '.', colors: { a: '#ff0000', b: '#00ff00' } };

describe('paleta', () => {
  it('tem 32 cores de um caractere em hexadecimal', () => {
    const entries = Object.entries(palette.colors);
    expect(entries).toHaveLength(32);
    for (const [key, hex] of entries) {
      expect(key).toHaveLength(1);
      expect(key).not.toMatch(/[#@.]/);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('parseSprite', () => {
  it('lê tamanho e quadros', () => {
    const sheet = parseSprite('t', '@size 2 1\n@frame\nab\n@frame\n.a\n', tiny);
    expect(sheet).toEqual({ name: 't', width: 2, height: 1, frames: [['ab'], ['.a']] });
  });

  it('ignora comentários e linhas vazias', () => {
    const sheet = parseSprite('t', '# oi\n@size 1 1\n\n@frame\na\n', tiny);
    expect(sheet.frames).toEqual([['a']]);
  });

  it('rejeita linha com largura errada', () => {
    expect(() => parseSprite('t', '@size 2 1\n@frame\nabb\n', tiny)).toThrow(/t:3: largura 3, esperado 2/);
  });

  it('rejeita quadro com altura errada', () => {
    expect(() => parseSprite('t', '@size 1 2\n@frame\na\n', tiny)).toThrow(/frame 0 tem altura 1, esperado 2/);
  });

  it('rejeita cor fora da paleta', () => {
    expect(() => parseSprite('t', '@size 1 1\n@frame\nz\n', tiny)).toThrow(SpriteError);
  });

  it('rejeita arquivo sem quadros', () => {
    expect(() => parseSprite('t', '@size 1 1\n', tiny)).toThrow(/nenhum @frame/);
  });

  it('rejeita pixels antes de @frame', () => {
    expect(() => parseSprite('t', '@size 1 1\na\n', tiny)).toThrow(/pixels fora de @frame/);
  });
});

describe('renderSheet', () => {
  it('converte hexadecimal em RGBA', () => {
    expect(hexToRgba('#ff8000')).toEqual([255, 128, 0, 255]);
  });

  it('coloca os quadros lado a lado', () => {
    const png = PNG.sync.read(renderSheet({ name: 't', width: 2, height: 1, frames: [['ab'], ['.a']] }, tiny));
    expect(png.width).toBe(4);
    expect(png.height).toBe(1);
    expect([...png.data.subarray(0, 4)]).toEqual([255, 0, 0, 255]);
    expect([...png.data.subarray(4, 8)]).toEqual([0, 255, 0, 255]);
    expect(png.data[11]).toBe(0);
    expect([...png.data.subarray(12, 16)]).toEqual([255, 0, 0, 255]);
  });
});

describe('arquivos de arte', () => {
  for (const dir of ['art/sprites', 'art/tiles']) {
    let files: string[] = [];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.txt'));
    } catch {
      files = [];
    }
    for (const file of files) {
      it(`${dir}/${file} é válido`, () => {
        expect(() => parseSprite(file, readFileSync(join(dir, file), 'utf8'), palette)).not.toThrow();
      });
    }
  }

  it('tileset do pomar tem 5 tiles de 16×16', () => {
    const sheet = parseSprite('pomar', readFileSync('art/tiles/pomar.txt', 'utf8'), palette);
    expect([sheet.width, sheet.height, sheet.frames.length]).toEqual([16, 16, 5]);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run tests/unit/sprites.test.ts`
Expected: FAIL, módulo `tools/sprites/parse` não encontrado.

- [ ] **Step 4: Implementar o leitor**

`tools/sprites/parse.ts`:
```ts
export interface Palette {
  transparent: string;
  colors: Record<string, string>;
}

export interface SpriteSheet {
  name: string;
  width: number;
  height: number;
  frames: string[][];
}

export class SpriteError extends Error {}

export function parseSprite(name: string, text: string, palette: Palette): SpriteSheet {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let width = 0;
  let height = 0;
  const frames: string[][] = [];
  let current: string[] | null = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = (lines[i] ?? '').trimEnd();
    const lineNumber = i + 1;
    if (line === '' || line.startsWith('#')) continue;

    if (line.startsWith('@size')) {
      const match = /^@size\s+(\d+)\s+(\d+)$/.exec(line);
      if (!match) throw new SpriteError(`${name}:${lineNumber}: @size inválido`);
      width = Number(match[1]);
      height = Number(match[2]);
      continue;
    }

    if (line === '@frame') {
      if (width === 0) throw new SpriteError(`${name}:${lineNumber}: @size deve vir antes de @frame`);
      current = [];
      frames.push(current);
      continue;
    }

    if (current === null) throw new SpriteError(`${name}:${lineNumber}: pixels fora de @frame`);
    if (line.length !== width) {
      throw new SpriteError(`${name}:${lineNumber}: largura ${line.length}, esperado ${width}`);
    }
    for (const ch of line) {
      if (ch !== palette.transparent && !(ch in palette.colors)) {
        throw new SpriteError(`${name}:${lineNumber}: cor "${ch}" fora da paleta`);
      }
    }
    current.push(line);
  }

  if (frames.length === 0) throw new SpriteError(`${name}: nenhum @frame`);
  frames.forEach((frame, index) => {
    if (frame.length !== height) {
      throw new SpriteError(`${name}: frame ${index} tem altura ${frame.length}, esperado ${height}`);
    }
  });

  return { name, width, height, frames };
}
```

- [ ] **Step 5: Implementar o renderizador**

`tools/sprites/render.ts`:
```ts
import { PNG } from 'pngjs';
import type { Palette, SpriteSheet } from './parse';

export function hexToRgba(hex: string): [number, number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
}

export function renderSheet(sheet: SpriteSheet, palette: Palette): Buffer {
  const png = new PNG({ width: sheet.width * sheet.frames.length, height: sheet.height });
  png.data.fill(0);

  sheet.frames.forEach((frame, frameIndex) => {
    frame.forEach((row, y) => {
      Array.from(row).forEach((ch, x) => {
        if (ch === palette.transparent) return;
        const color = palette.colors[ch];
        if (color === undefined) throw new Error(`cor "${ch}" fora da paleta`);
        const offset = (y * png.width + frameIndex * sheet.width + x) * 4;
        const [r, g, b, a] = hexToRgba(color);
        png.data[offset] = r;
        png.data[offset + 1] = g;
        png.data[offset + 2] = b;
        png.data[offset + 3] = a;
      });
    });
  });

  return PNG.sync.write(png);
}
```

- [ ] **Step 6: Criar o tileset do pomar**

`art/tiles/pomar.txt` (cada linha de pixel tem exatamente 16 caracteres):

```
# 0 grama, 1 caminho, 2 água, 3 cerca, 4 árvore
@size 16 16
@frame
gggggggggggggggg
ggggegggggggggge
gggggggggggggggg
ggggggggggeggggg
gegggggggggggggg
gggggggggggggggg
gggggggegggggggg
gggggggggggggegg
gggggggggggggggg
ggeggggggggggggg
gggggggggggggggg
gggggggggegggggg
gggggggggggggggg
gggegggggggggggg
ggggggggggggeggg
gggggggggggggggg
@frame
ffffffffffffffff
fffftfffffffffff
ffffffffffftffff
ffffffffffffffff
fftfffffffffffff
ffffffffftffffff
ffffffffffffffff
fffffftfffffffff
ffffffffffffftff
ffffffffffffffff
ftffffffffffffff
fffffffftfffffff
ffffffffffffffff
fffftfffffffftff
ffffffffffffffff
ffffffffffffffff
@frame
cccccccccccccccc
ccwwcccccccccccc
cccccccccccccccc
cccccccccwwccccc
cccccccccccccccc
cccccccccccccccc
cccwwccccccccccc
cccccccccccccccc
cccccccccccwwccc
cccccccccccccccc
ccccccwwcccccccc
cccccccccccccccc
cwwccccccccccccc
cccccccccccccccc
ccccccccccwwcccc
cccccccccccccccc
@frame
gggggggggggggggg
gggggggggggggggg
gggggggggggggggg
ggbbggggggggbbgg
tttttttttttttttt
bbbbbbbbbbbbbbbb
ggttggggggggttgg
ggttggggggggttgg
ggttggggggggttgg
tttttttttttttttt
bbbbbbbbbbbbbbbb
ggttggggggggttgg
ggbbggggggggbbgg
gggggggggggggggg
gggggggggggggggg
gggggggggggggggg
@frame
ggggGGGGGGGGgggg
ggGGgggggggGGGgg
gGgggJgggeggggGg
GggeggggjgggggGG
GgjggggegggJgggG
GgggJgggggjgggeG
GggeggggjggggggG
gGgggjggggggJgGg
ggGGgggggggggGGg
gggGGGGGGGGGGggg
ggggggGbbGgggggg
gggggggbBggggggg
gggggggbBggggggg
gggggggbBggggggg
ggggggbbBBgggggg
gggggggggggggggg
```

- [ ] **Step 7: Criar o script de geração**

`tools/build-sprites.ts`:
```ts
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseSprite, SpriteError, type Palette } from './sprites/parse';
import { renderSheet } from './sprites/render';

const OUT = join('public', 'assets', 'generated');
const SOURCES = ['art/sprites', 'art/tiles'];

interface ManifestEntry {
  file: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
}

function listTxt(dir: string): string[] {
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.txt')).map((f) => join(dir, f));
  } catch {
    return [];
  }
}

try {
  const palette = JSON.parse(readFileSync('art/palette.json', 'utf8')) as Palette;
  mkdirSync(join(OUT, 'sprites'), { recursive: true });
  const sprites: Record<string, ManifestEntry> = {};

  for (const path of SOURCES.flatMap(listTxt)) {
    const name = basename(path, '.txt');
    if (sprites[name]) throw new SpriteError(`${name}: nome duplicado`);
    const sheet = parseSprite(name, readFileSync(path, 'utf8'), palette);
    const file = `sprites/${name}.png`;
    writeFileSync(join(OUT, file), renderSheet(sheet, palette));
    sprites[name] = { file, frameWidth: sheet.width, frameHeight: sheet.height, frames: sheet.frames.length };
  }

  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ sprites }, null, 2));
  console.log(`${Object.keys(sprites).length} sprites gerados em ${OUT}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
```

Em `package.json`, restaurar `"build": "npm run assets && tsc --noEmit && vite build"` e, até a task 7, definir `"maps": "node -e \"\""`.

- [ ] **Step 8: Criar a página de prévia (só para desenvolvimento)**

`art-preview.html`:
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Prévia da arte</title>
    <style>
      body { background: #2b2b3a; color: #fff8f0; font-family: sans-serif; padding: 16px; }
      figure { display: inline-block; margin: 12px; vertical-align: top; }
      img { image-rendering: pixelated; background: repeating-conic-gradient(#555 0 25%, #666 0 50%) 0 0 / 16px 16px; }
    </style>
  </head>
  <body>
    <h1>Prévia da arte</h1>
    <div id="list"></div>
    <script type="module">
      const response = await fetch('assets/generated/manifest.json');
      const { sprites } = await response.json();
      const list = document.getElementById('list');
      for (const [name, entry] of Object.entries(sprites)) {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = `assets/generated/${entry.file}`;
        img.width = entry.frameWidth * entry.frames * 4;
        img.height = entry.frameHeight * 4;
        const caption = document.createElement('figcaption');
        caption.textContent = `${name} (${entry.frames} quadros de ${entry.frameWidth}×${entry.frameHeight})`;
        figure.append(img, caption);
        list.append(figure);
      }
    </script>
  </body>
</html>
```

- [ ] **Step 9: Rodar testes e geração**

Run: `npx vitest run && npm run art`
Expected: PASS em todos os testes; saída `1 sprites gerados em public/assets/generated`. Se algum tile tiver largura errada, a mensagem indica arquivo e linha; corrigir a linha.

- [ ] **Step 10: Commit**

```bash
git add art tools tests/unit/sprites.test.ts art-preview.html package.json
git commit -m "feat: geração de pixel art a partir de matrizes de texto"
```

---

### Task 4: Retrato da Grace, com aprovação do usuário

Esta task é criativa e depende das fotos de referência que o usuário enviou na conversa. Ela deve ser executada na sessão principal, não por subagente, e só termina com aprovação explícita do usuário.

**Files:**
- Create: `art/sprites/grace-portrait.txt`
- Create (opcional): `tools/draw/grace-portrait.ts`, script que compõe formas (elipses, retângulos, contornos) e escreve o `.txt`. Se usado, fica versionado junto; o `.txt` continua sendo a fonte que o build lê.

**Interfaces:**
- Produces: sprite `grace-portrait`, 96×96, 1 quadro (expressão feliz). Textura no Phaser: `sprite-grace-portrait`, usada pela `DialogueScene` (task 11) quando quem fala é `grace`.

**Critérios de aceite do desenho:**

| Elemento | Requisito | Cores da paleta |
|---|---|---|
| Enquadramento | Rosto e ombros, rosto ocupando cerca de 60% da altura, fundo transparente | `.` |
| Cabelo | Castanho claro, liso, comprido passando dos ombros, com mechas mais claras e repartido de lado | `h`, `H`, `y` |
| Óculos | Armação grande e quadrada, lilás translúcido, bem visível | `l`, `L` |
| Olhos | Azul acinzentados, com brilho branco | `U`, `u`, `w` |
| Pele | Clara, bochechas rosadas | `s`, `S`, `m` |
| Sorriso | Aberto, com os dois dentes da frente faltando | `w`, `R`, `r` |
| Roupa | Rosa com pequenas flores | `p`, `P`, `m`, `w` |
| Acessório | Presilha de flor branca no cabelo | `w`, `z` |
| Contorno | Contorno escuro de 1 px ao redor da silhueta | `k` |

- [ ] **Step 1: Desenhar a versão 1**

Criar `art/sprites/grace-portrait.txt` com `@size 96 96` e um `@frame` de 96 linhas de 96 caracteres que atenda à tabela.

- [ ] **Step 2: Validar o arquivo**

Run: `npx vitest run tests/unit/sprites.test.ts && npm run art`
Expected: PASS, incluindo `art/sprites/grace-portrait.txt é válido`; saída `2 sprites gerados`.

- [ ] **Step 3: Gerar captura para o usuário**

Run: `npx vite --port 5173` e, em outro terminal, capturar `http://localhost:5173/princess-grace-sitio/art-preview.html` com Playwright:
```bash
npx playwright screenshot --viewport-size=900,600 http://localhost:5173/princess-grace-sitio/art-preview.html /tmp/grace-portrait-v1.png
```
Enviar a imagem ao usuário (SendUserFile) e perguntar se a Grace está reconhecível e o que ajustar.

- [ ] **Step 4: Iterar até aprovação**

Aplicar os ajustes pedidos, repetir os steps 2 e 3 com `-v2`, `-v3`. Não avançar sem um "aprovado" explícito.

- [ ] **Step 5: Commit**

```bash
git add art/sprites/grace-portrait.txt tools/draw
git commit -m "art: retrato da Princess Grace aprovado"
```

---

### Task 5: Estado do jogo: idioma, aleatoriedade, dificuldade, progresso e nome

**Files:**
- Create: `src/core/locale.ts`, `src/core/rng.ts`, `src/core/difficulty.ts`, `src/core/progress.ts`, `src/core/names.ts`
- Test: `tests/unit/rng.test.ts`, `tests/unit/difficulty.test.ts`, `tests/unit/progress.test.ts`, `tests/unit/names.test.ts`

**Interfaces:**
- Produces:
  - `type Locale = 'pt' | 'en'`, `LOCALES: readonly Locale[]`, `otherLocale(locale: Locale): Locale`, `isLocale(value: unknown): value is Locale`
  - `interface Rng { next(): number; int(min: number, max: number): number; pick<T>(items: readonly T[]): T; shuffle<T>(items: readonly T[]): T[] }`, `createRng(seed: number): Rng`
  - `type Level = 1 | 2 | 3`, `interface DifficultyState { level: Level; errorStreak: number; successStreak: number }`, `initialDifficulty(): DifficultyState`, `recordAttempt(state: DifficultyState, attempt: { correct: boolean; usedHint: boolean }): DifficultyState`
  - `PROGRESS_VERSION = 1`, `PROGRESS_KEY = 'princess-grace-sitio.progress'`, `interface Progress { version: 1; locale: Locale | null; companionName: string | null; completed: string[]; difficulty: DifficultyState }`, `newProgress(): Progress`, `serializeProgress(p: Progress): string`, `parseProgress(raw: string | null): Progress`, `interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }`, `interface ProgressStore { readonly available: boolean; load(): Progress; save(progress: Progress): void }`, `createProgressStore(storage: StorageLike | null): ProgressStore`
  - `MAX_NAME_LENGTH = 12`, `formatCompanionName(raw: string): string`

- [ ] **Step 1: Escrever os testes que falham**

`tests/unit/rng.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/rng';

describe('createRng', () => {
  it('repete a sequência com a mesma semente', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect(Array.from({ length: 5 }, () => a.next())).toEqual(Array.from({ length: 5 }, () => b.next()));
  });

  it('muda a sequência com outra semente', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next());
  });

  it('next fica em [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 10_000; i += 1) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('int inclui os dois limites e nada fora deles', () => {
    const rng = createRng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 5_000; i += 1) seen.add(rng.int(2, 5));
    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });

  it('shuffle devolve uma permutação sem alterar a entrada', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const output = createRng(9).shuffle(input);
    expect([...output].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('pick em lista vazia lança erro', () => {
    expect(() => createRng(1).pick([])).toThrow(/vazia/);
  });
});
```

`tests/unit/difficulty.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { initialDifficulty, recordAttempt, type DifficultyState } from '../../src/core/difficulty';

const wrong = { correct: false, usedHint: false };
const right = { correct: true, usedHint: false };
const rightWithHint = { correct: true, usedHint: true };

function apply(state: DifficultyState, attempts: { correct: boolean; usedHint: boolean }[]): DifficultyState {
  return attempts.reduce(recordAttempt, state);
}

describe('dificuldade', () => {
  it('começa no nível 2', () => {
    expect(initialDifficulty()).toEqual({ level: 2, errorStreak: 0, successStreak: 0 });
  });

  it('dois erros seguidos baixam um nível e zeram as sequências', () => {
    expect(apply(initialDifficulty(), [wrong, wrong])).toEqual({ level: 1, errorStreak: 0, successStreak: 0 });
  });

  it('um acerto entre erros reinicia a contagem de erros', () => {
    expect(apply(initialDifficulty(), [wrong, right, wrong]).level).toBe(2);
  });

  it('três acertos seguidos sem dica sobem um nível', () => {
    expect(apply(initialDifficulty(), [right, right, right])).toEqual({ level: 3, errorStreak: 0, successStreak: 0 });
  });

  it('acerto com dica não conta para subir', () => {
    expect(apply(initialDifficulty(), [right, rightWithHint, right, right]).level).toBe(2);
  });

  it('não passa de 3 nem de 1', () => {
    expect(apply(initialDifficulty(), Array(9).fill(right)).level).toBe(3);
    expect(apply(initialDifficulty(), Array(8).fill(wrong)).level).toBe(1);
  });

  it('não altera o estado recebido', () => {
    const state = initialDifficulty();
    recordAttempt(state, wrong);
    expect(state.errorStreak).toBe(0);
  });
});
```

`tests/unit/progress.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  createProgressStore,
  newProgress,
  parseProgress,
  PROGRESS_KEY,
  serializeProgress,
  type StorageLike,
} from '../../src/core/progress';

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

describe('progresso', () => {
  it('novo progresso tem valores iniciais', () => {
    expect(newProgress()).toEqual({
      version: 1,
      locale: null,
      companionName: null,
      completed: [],
      difficulty: { level: 2, errorStreak: 0, successStreak: 0 },
    });
  });

  it('ida e volta preserva os dados', () => {
    const progress = { ...newProgress(), locale: 'en' as const, companionName: 'Mel', completed: ['p1-word-build'] };
    expect(parseProgress(serializeProgress(progress))).toEqual(progress);
  });

  it.each([
    ['nulo', null],
    ['JSON corrompido', '{oi'],
    ['versão antiga', JSON.stringify({ ...newProgress(), version: 0 })],
    ['idioma inválido', JSON.stringify({ ...newProgress(), locale: 'fr' })],
    ['nível inválido', JSON.stringify({ ...newProgress(), difficulty: { level: 7, errorStreak: 0, successStreak: 0 } })],
    ['completed não é lista', JSON.stringify({ ...newProgress(), completed: 'x' })],
    ['nome longo demais', JSON.stringify({ ...newProgress(), companionName: 'A'.repeat(13) })],
  ])('%s gera progresso novo', (_label, raw) => {
    expect(parseProgress(raw)).toEqual(newProgress());
  });

  it('store salva e carrega', () => {
    const storage = memoryStorage();
    const store = createProgressStore(storage);
    store.save({ ...newProgress(), locale: 'pt' });
    expect(store.available).toBe(true);
    expect(JSON.parse(storage.data.get(PROGRESS_KEY) ?? '{}').locale).toBe('pt');
    expect(store.load().locale).toBe('pt');
  });

  it('sem storage o jogo funciona sem salvar', () => {
    const store = createProgressStore(null);
    expect(store.available).toBe(false);
    expect(() => store.save(newProgress())).not.toThrow();
    expect(store.load()).toEqual(newProgress());
  });

  it('storage que lança erro fica indisponível', () => {
    const store = createProgressStore({
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
    });
    expect(store.available).toBe(false);
    expect(store.load()).toEqual(newProgress());
  });
});
```

`tests/unit/names.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { formatCompanionName } from '../../src/core/names';

describe('formatCompanionName', () => {
  it.each([
    ['MEL', 'Mel'],
    ['  pipoca ', 'Pipoca'],
    ['ÉRICA', 'Érica'],
    ['ABCDEFGHIJKLMNOP', 'Abcdefghijkl'],
    ['', ''],
  ])('%s vira %s', (raw, expected) => {
    expect(formatCompanionName(raw)).toBe(expected);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/unit/rng.test.ts tests/unit/difficulty.test.ts tests/unit/progress.test.ts tests/unit/names.test.ts`
Expected: FAIL, módulos não encontrados.

- [ ] **Step 3: Implementar**

`src/core/locale.ts`:
```ts
export type Locale = 'pt' | 'en';

export const LOCALES: readonly Locale[] = ['pt', 'en'];

export function otherLocale(locale: Locale): Locale {
  return locale === 'pt' ? 'en' : 'pt';
}

export function isLocale(value: unknown): value is Locale {
  return value === 'pt' || value === 'en';
}
```

`src/core/rng.ts`:
```ts
export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min: number, max: number): number {
    return min + Math.floor(next() * (max - min + 1));
  }

  return {
    next,
    int,
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error('pick em lista vazia');
      return items[int(0, items.length - 1)] as T;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = int(0, i);
        [out[i], out[j]] = [out[j] as T, out[i] as T];
      }
      return out;
    },
  };
}
```

`src/core/difficulty.ts`:
```ts
export type Level = 1 | 2 | 3;

export interface DifficultyState {
  level: Level;
  errorStreak: number;
  successStreak: number;
}

export const ERRORS_TO_LOWER = 2;
export const SUCCESSES_TO_RAISE = 3;

export function initialDifficulty(): DifficultyState {
  return { level: 2, errorStreak: 0, successStreak: 0 };
}

function clampLevel(value: number): Level {
  return Math.min(3, Math.max(1, value)) as Level;
}

export function recordAttempt(
  state: DifficultyState,
  attempt: { correct: boolean; usedHint: boolean },
): DifficultyState {
  if (!attempt.correct) {
    const errorStreak = state.errorStreak + 1;
    if (errorStreak >= ERRORS_TO_LOWER) {
      return { level: clampLevel(state.level - 1), errorStreak: 0, successStreak: 0 };
    }
    return { ...state, errorStreak, successStreak: 0 };
  }

  if (attempt.usedHint) return { ...state, errorStreak: 0, successStreak: 0 };

  const successStreak = state.successStreak + 1;
  if (successStreak >= SUCCESSES_TO_RAISE) {
    return { level: clampLevel(state.level + 1), errorStreak: 0, successStreak: 0 };
  }
  return { ...state, errorStreak: 0, successStreak };
}
```

`src/core/names.ts`:
```ts
export const MAX_NAME_LENGTH = 12;

export function formatCompanionName(raw: string): string {
  const letters = Array.from(raw.trim()).slice(0, MAX_NAME_LENGTH);
  if (letters.length === 0) return '';
  const [first, ...rest] = letters;
  return (first as string).toLocaleUpperCase('pt-BR') + rest.join('').toLocaleLowerCase('pt-BR');
}
```

`src/core/progress.ts`:
```ts
import { initialDifficulty, type DifficultyState } from './difficulty';
import { isLocale, type Locale } from './locale';
import { MAX_NAME_LENGTH } from './names';

export const PROGRESS_VERSION = 1;
export const PROGRESS_KEY = 'princess-grace-sitio.progress';

export interface Progress {
  version: typeof PROGRESS_VERSION;
  locale: Locale | null;
  companionName: string | null;
  completed: string[];
  difficulty: DifficultyState;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ProgressStore {
  readonly available: boolean;
  load(): Progress;
  save(progress: Progress): void;
}

export function newProgress(): Progress {
  return { version: PROGRESS_VERSION, locale: null, companionName: null, completed: [], difficulty: initialDifficulty() };
}

export function serializeProgress(progress: Progress): string {
  return JSON.stringify(progress);
}

function isStreak(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isDifficulty(value: unknown): value is DifficultyState {
  if (typeof value !== 'object' || value === null) return false;
  const d = value as Record<string, unknown>;
  return (d.level === 1 || d.level === 2 || d.level === 3) && isStreak(d.errorStreak) && isStreak(d.successStreak);
}

export function parseProgress(raw: string | null): Progress {
  if (raw === null) return newProgress();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return newProgress();
  }
  if (typeof data !== 'object' || data === null) return newProgress();
  const p = data as Record<string, unknown>;

  const validName =
    p.companionName === null ||
    (typeof p.companionName === 'string' && Array.from(p.companionName).length <= MAX_NAME_LENGTH);
  const valid =
    p.version === PROGRESS_VERSION &&
    (p.locale === null || isLocale(p.locale)) &&
    validName &&
    Array.isArray(p.completed) &&
    p.completed.every((id) => typeof id === 'string') &&
    isDifficulty(p.difficulty);

  if (!valid) return newProgress();
  return {
    version: PROGRESS_VERSION,
    locale: p.locale as Locale | null,
    companionName: p.companionName as string | null,
    completed: [...(p.completed as string[])],
    difficulty: { ...(p.difficulty as DifficultyState) },
  };
}

export function createProgressStore(storage: StorageLike | null): ProgressStore {
  let available = storage !== null;
  if (storage) {
    try {
      storage.setItem(`${PROGRESS_KEY}.probe`, '1');
      storage.getItem(`${PROGRESS_KEY}.probe`);
    } catch {
      available = false;
    }
  }

  return {
    get available() {
      return available;
    },
    load() {
      if (!available || !storage) return newProgress();
      try {
        return parseProgress(storage.getItem(PROGRESS_KEY));
      } catch {
        return newProgress();
      }
    },
    save(progress) {
      if (!available || !storage) return;
      try {
        storage.setItem(PROGRESS_KEY, serializeProgress(progress));
      } catch {
        available = false;
      }
    },
  };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run`
Expected: PASS em todos os arquivos.

- [ ] **Step 5: Commit**

```bash
git add src/core tests/unit
git commit -m "feat: estado do jogo com dificuldade adaptativa e progresso salvo"
```

---

### Task 6: Idiomas e textos da fase 1

**Files:**
- Create: `src/core/i18n.ts`, `src/core/strings.ts`, `src/content/pt.json`, `src/content/en.json`
- Test: `tests/unit/i18n.test.ts`, `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: `Locale`, `otherLocale` (task 5)
- Produces:
  - `type Dictionary = Record<string, string>`, `type Vars = Record<string, string | number>`
  - `interpolate(template: string, vars?: Vars): string`
  - `interface I18n { readonly locale: Locale; setLocale(locale: Locale): void; t(key: string, vars?: Vars): string }`
  - `createI18n(dictionaries: Record<Locale, Dictionary>, initial: Locale, warn?: (message: string) => void): I18n`
  - `DICTIONARIES: Record<Locale, Dictionary>`, `translate(locale: Locale, key: string, vars?: Vars): string`

- [ ] **Step 1: Escrever os testes que falham**

`tests/unit/i18n.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest';
import { createI18n, interpolate } from '../../src/core/i18n';

const dicts = {
  pt: { hello: 'Oi, {name}!', onlyPt: 'só português' },
  en: { hello: 'Hi, {name}!' },
};

describe('interpolate', () => {
  it('troca variáveis conhecidas e mantém as desconhecidas', () => {
    expect(interpolate('{a} e {b}', { a: 1 })).toBe('1 e {b}');
  });
});

describe('createI18n', () => {
  it('traduz no idioma atual e troca de idioma', () => {
    const i18n = createI18n(dicts, 'pt');
    expect(i18n.t('hello', { name: 'Grace' })).toBe('Oi, Grace!');
    i18n.setLocale('en');
    expect(i18n.locale).toBe('en');
    expect(i18n.t('hello', { name: 'Grace' })).toBe('Hi, Grace!');
  });

  it('usa o outro idioma quando a chave falta e avisa', () => {
    const warn = vi.fn();
    const i18n = createI18n(dicts, 'en', warn);
    expect(i18n.t('onlyPt')).toBe('só português');
    expect(warn).toHaveBeenCalledWith('texto "onlyPt" ausente em en');
  });

  it('devolve a própria chave quando falta nos dois idiomas', () => {
    const i18n = createI18n(dicts, 'pt', () => undefined);
    expect(i18n.t('nada')).toBe('nada');
  });
});
```

`tests/unit/content.test.ts`:
```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DICTIONARIES } from '../../src/core/strings';

describe('textos', () => {
  it('pt e en têm exatamente as mesmas chaves', () => {
    expect(Object.keys(DICTIONARIES.en).sort()).toEqual(Object.keys(DICTIONARIES.pt).sort());
  });

  it('nenhum texto vazio', () => {
    for (const dict of Object.values(DICTIONARIES)) {
      for (const [key, value] of Object.entries(dict)) expect(value.trim(), key).not.toBe('');
    }
  });

  it('as mesmas variáveis aparecem nos dois idiomas', () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(DICTIONARIES.pt)) {
      expect(vars(DICTIONARIES.en[key] ?? ''), key).toEqual(vars(DICTIONARIES.pt[key] ?? ''));
    }
  });

  it('nenhum arquivo de conteúdo usa travessão', () => {
    for (const file of readdirSync('src/content')) {
      expect(readFileSync(join('src/content', file), 'utf8'), file).not.toContain('\u2014');
    }
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/unit/i18n.test.ts tests/unit/content.test.ts`
Expected: FAIL, módulos não encontrados.

- [ ] **Step 3: Implementar `i18n.ts` e `strings.ts`**

`src/core/i18n.ts`:
```ts
import { otherLocale, type Locale } from './locale';

export type Dictionary = Record<string, string>;
export type Vars = Record<string, string | number>;

export interface I18n {
  readonly locale: Locale;
  setLocale(locale: Locale): void;
  t(key: string, vars?: Vars): string;
}

export function interpolate(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export function createI18n(
  dictionaries: Record<Locale, Dictionary>,
  initial: Locale,
  warn: (message: string) => void = console.warn,
): I18n {
  let locale = initial;
  return {
    get locale() {
      return locale;
    },
    setLocale(next) {
      locale = next;
    },
    t(key, vars) {
      const own = dictionaries[locale][key];
      if (own !== undefined) return interpolate(own, vars);
      const fallback = dictionaries[otherLocale(locale)][key];
      if (fallback !== undefined) {
        warn(`texto "${key}" ausente em ${locale}`);
        return interpolate(fallback, vars);
      }
      warn(`texto "${key}" ausente em ${locale}`);
      return key;
    },
  };
}
```

`src/core/strings.ts`:
```ts
import en from '../content/en.json';
import pt from '../content/pt.json';
import { interpolate, type Dictionary, type Vars } from './i18n';
import type { Locale } from './locale';

export const DICTIONARIES: Record<Locale, Dictionary> = { pt, en };

export function translate(locale: Locale, key: string, vars?: Vars): string {
  const template = DICTIONARIES[locale][key];
  return template === undefined ? key : interpolate(template, vars);
}
```

- [ ] **Step 4: Criar os textos**

`src/content/pt.json`:
```json
{
  "language.title": "Escolha o idioma",
  "language.option.pt": "Português",
  "language.option.en": "English",
  "menu.title": "Menu",
  "menu.language": "Idioma",
  "menu.restart": "Recomeçar",
  "menu.close": "Voltar ao jogo",
  "menu.noSave": "O progresso não será salvo neste navegador.",
  "boot.loadError": "Não foi possível carregar o jogo.",
  "boot.retry": "Tentar de novo",
  "common.continue": "Continuar",
  "common.confirm": "Confirmar",
  "common.erase": "Apagar",
  "intro.1": "Era noite na Inglaterra, e a Princesa Grace lia um livro antigo que tinha vindo do Brasil.",
  "intro.2": "De repente, as páginas começaram a brilhar!",
  "intro.3": "Grace e a sua coelha de pelúcia foram puxadas para dentro da história.",
  "intro.4": "Quando abriram os olhos, estavam no Sítio do Picapau Amarelo.",
  "intro.nameQuestion": "A coelha piscou, mexeu as orelhas e começou a falar! Qual é o nome dela?",
  "intro.suggestion.1": "Mel",
  "intro.suggestion.2": "Pipoca",
  "intro.suggestion.3": "Estrela",
  "companion.greeting": "Oi, Grace! Eu sou a {companion}. Que lugar lindo! Vamos falar com a Emília?",
  "npc.grace": "Princesa Grace",
  "npc.emilia": "Emília",
  "npc.visconde": "Visconde",
  "npc.benta": "Dona Benta",
  "npc.saci": "Saci",
  "npc.waiting": "Agora não posso. Fale primeiro com: {npc}.",
  "emilia.intro": "Até que enfim chegou ajuda! Eu sou a Emília, a boneca de pano mais esperta deste Sítio.",
  "emilia.problem": "A Cuca fez um feitiço e apagou as palavras do livro da Dona Benta. As letras caíram no pomar!",
  "grace.accept": "Pode deixar, Emília. Eu vou ajudar!",
  "emilia.challenge": "Então junte as letras e monte a palavra de novo.",
  "emilia.done": "Isso! A primeira palavra voltou para o livro. Agora procure o Visconde.",
  "visconde.intro": "Saudações, Princesa. Sou o Visconde de Sabugosa. O feitiço misturou as palavras em inglês e em português.",
  "visconde.challenge": "Ligue cada palavra ao seu par no outro idioma.",
  "visconde.done": "Perfeito. A ciência agradece. A Dona Benta está esperando por você.",
  "benta.intro": "Que bom ter você aqui, minha querida. Faltam palavras nas frases do meu livro.",
  "benta.challenge": "Escolha a palavra que completa a frase.",
  "benta.done": "Agora a frase faz sentido de novo. Mas a última página sumiu! Acho que foi o Saci.",
  "saci.intro": "Hi-hi-hi! Fui eu que escondi a última página. Quer achar? Leia as minhas pistas!",
  "saci.huntStart": "As pistas ficam no alto da tela. Toque no lugar certo do mapa.",
  "saci.found": "Puxa, você me achou! Tome a página. Leve para a Dona Benta.",
  "saci.wrong": "Não é aqui! Leia as pistas de novo.",
  "benta.legendIntro": "Você achou a página! Vamos ler juntas a lenda que estava escrita nela.",
  "benta.legendDone": "O livro está inteiro de novo. Obrigada, Princesa Grace!",
  "phase1.title": "Fase 1: o pomar das palavras",
  "phase1.complete": "Fase 1 concluída!",
  "phase1.next": "A cozinha da Tia Nastácia chega na próxima versão do jogo.",
  "challenge.correct": "Muito bem!",
  "challenge.wrong": "Quase! Vamos tentar de novo.",
  "challenge.hintBy": "Dica da {companion}:",
  "challenge.wordBuild.prompt": "Monte a palavra em português. Em inglês, ela é: {clue}",
  "challenge.wordMatch.prompt": "Toque numa palavra e depois no seu par.",
  "challenge.comprehension.question": "Pergunta {n} de {total}",
  "hideout.jabuticabeira": "jabuticabeira",
  "hideout.ribeirao": "ribeirão",
  "hideout.cerca": "cerca",
  "hideout.milharal": "milharal",
  "hideout.pedra": "pedra grande",
  "hideout.toca": "toca do tatu",
  "hint.wordBuild": "A palavra começa com \"{first}\" e tem {length} letras.",
  "hint.wordMatch": "Comece por \"{pt}\". Em inglês, ela é \"{en}\".",
  "hint.fillSentence": "A palavra começa com \"{first}\".",
  "hint.clueHunt": "Releia esta pista com atenção: {clue}",
  "hint.comprehension": "A resposta está no texto. Procure a palavra \"{keyword}\"."
}
```

`src/content/en.json`:
```json
{
  "language.title": "Choose your language",
  "language.option.pt": "Português",
  "language.option.en": "English",
  "menu.title": "Menu",
  "menu.language": "Language",
  "menu.restart": "Start over",
  "menu.close": "Back to the game",
  "menu.noSave": "Progress will not be saved in this browser.",
  "boot.loadError": "The game could not load.",
  "boot.retry": "Try again",
  "common.continue": "Continue",
  "common.confirm": "Check",
  "common.erase": "Delete",
  "intro.1": "It was night-time in England, and Princess Grace was reading an old book that came all the way from Brazil.",
  "intro.2": "Suddenly, the pages began to glow!",
  "intro.3": "Grace and her toy bunny were pulled right into the story.",
  "intro.4": "When they opened their eyes, they were at the Yellow Woodpecker Farm.",
  "intro.nameQuestion": "The bunny blinked, wiggled her ears and started to talk! What is her name?",
  "intro.suggestion.1": "Honey",
  "intro.suggestion.2": "Popcorn",
  "intro.suggestion.3": "Star",
  "companion.greeting": "Hi, Grace! I'm {companion}. What a lovely place! Shall we talk to Emília?",
  "npc.grace": "Princess Grace",
  "npc.emilia": "Emília",
  "npc.visconde": "Viscount",
  "npc.benta": "Dona Benta",
  "npc.saci": "Saci",
  "npc.waiting": "Not now. Please talk to {npc} first.",
  "emilia.intro": "Help has finally arrived! I'm Emília, the cleverest rag doll on this farm.",
  "emilia.problem": "Cuca cast a spell and erased the words from Dona Benta's book. The letters fell all over the orchard!",
  "grace.accept": "Don't worry, Emília. I'll help!",
  "emilia.challenge": "Then put the letters together and build the word again.",
  "emilia.done": "Yes! The first word is back in the book. Now go and find the Viscount.",
  "visconde.intro": "Greetings, Princess. I am the Viscount of Sabugosa. The spell mixed up the English and Portuguese words.",
  "visconde.challenge": "Match each word with its partner in the other language.",
  "visconde.done": "Perfect. Science thanks you. Dona Benta is waiting for you.",
  "benta.intro": "How lovely to have you here, my dear. Some words are missing from the sentences in my book.",
  "benta.challenge": "Choose the word that completes the sentence.",
  "benta.done": "Now the sentence makes sense again. But the last page is gone! I think Saci took it.",
  "saci.intro": "Hee-hee-hee! I hid the last page. Want to find it? Read my clues!",
  "saci.huntStart": "The clues are at the top of the screen. Tap the right place on the map.",
  "saci.found": "Wow, you found me! Here is the page. Take it to Dona Benta.",
  "saci.wrong": "Not here! Read the clues again.",
  "benta.legendIntro": "You found the page! Let's read the legend that was written on it together.",
  "benta.legendDone": "The book is whole again. Thank you, Princess Grace!",
  "phase1.title": "Level 1: the orchard of words",
  "phase1.complete": "Level 1 complete!",
  "phase1.next": "Aunt Nastácia's kitchen is coming in the next version of the game.",
  "challenge.correct": "Well done!",
  "challenge.wrong": "Almost! Let's try again.",
  "challenge.hintBy": "A hint from {companion}:",
  "challenge.wordBuild.prompt": "Build the word in Portuguese. In English it is: {clue}",
  "challenge.wordMatch.prompt": "Tap a word, then tap its partner.",
  "challenge.comprehension.question": "Question {n} of {total}",
  "hideout.jabuticabeira": "jabuticaba tree",
  "hideout.ribeirao": "stream",
  "hideout.cerca": "fence",
  "hideout.milharal": "cornfield",
  "hideout.pedra": "big rock",
  "hideout.toca": "armadillo burrow",
  "hint.wordBuild": "The word starts with \"{first}\" and has {length} letters.",
  "hint.wordMatch": "Start with \"{pt}\". In English it is \"{en}\".",
  "hint.fillSentence": "The word starts with \"{first}\".",
  "hint.clueHunt": "Read this clue carefully again: {clue}",
  "hint.comprehension": "The answer is in the text. Look for the word \"{keyword}\"."
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS; sem erros de tipo.

- [ ] **Step 6: Commit**

```bash
git add src/core/i18n.ts src/core/strings.ts src/content tests/unit
git commit -m "feat: textos da abertura e da fase 1 em português e inglês"
```

---

### Task 7: Caminho em grade e mapa do pomar

**Files:**
- Create: `src/core/pathfinding.ts`, `tools/maps/parse.ts`, `tools/maps/tiled.ts`, `tools/build-maps.ts`, `maps/pomar.txt`
- Modify: `package.json` (script `maps` definitivo), `docs/adrs/ADR-002-pixel-art-gerada-por-codigo.md`
- Test: `tests/unit/pathfinding.test.ts`, `tests/unit/maps.test.ts`

**Interfaces:**
- Produces:
  - `interface Point { x: number; y: number }`, `type Grid = readonly (readonly boolean[])[]` (`grid[y][x] === true` é bloqueado)
  - `findPath(grid: Grid, start: Point, goal: Point): Point[]`: caminho sem o ponto inicial e com o destino; `[]` se não houver caminho, se o destino for bloqueado ou se início e destino coincidirem
  - `neighbors(point: Point): Point[]`: quatro vizinhos ortogonais (direita, esquerda, baixo, cima)
  - `pathToNeighbor(grid: Grid, start: Point, target: Point): Point[] | null`: caminho mais curto até um vizinho livre de `target`; `[]` se já está ao lado; `null` se inalcançável
  - `TERRAIN`, `BLOCKING_TILES`, `interface MapObject { type: 'spawn' | 'npc' | 'hideout'; name: string; x: number; y: number }`, `interface ParsedMap { name: string; width: number; height: number; ground: number[]; blocked: boolean[][]; objects: MapObject[] }`, `class MapError extends Error`, `parseAsciiMap(name: string, text: string): ParsedMap`
  - `toTiledJson(map: ParsedMap, tileset: { name: string; image: string }): TiledMap`
  - Arquivo gerado `public/assets/generated/maps/pomar.json`, com camada de tiles `ground` e camada de objetos `objects` (propriedade `type` igual a `spawn`, `npc` ou `hideout`; `name` igual ao id); tiles 2, 3 e 4 com propriedade booleana `blocked`

**Formato do mapa ASCII:** `.` grama, `:` caminho, `~` água, `#` cerca, `T` árvore, `G` início da Grace, `E` Emília, `V` Visconde, `D` Dona Benta, `S` Saci, dígitos `1` a `9` para esconderijos declarados em linhas `@hideout <dígito> <id>`. Marcadores ficam sobre grama.

- [ ] **Step 1: Escrever os testes que falham**

`tests/unit/pathfinding.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { findPath, pathToNeighbor, type Grid } from '../../src/core/pathfinding';

function grid(rows: string[]): Grid {
  return rows.map((row) => Array.from(row).map((ch) => ch === '#'));
}

describe('findPath', () => {
  it('anda em linha reta', () => {
    expect(findPath(grid(['...']), { x: 0, y: 0 }, { x: 2, y: 0 })).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  it('contorna obstáculo com o menor número de passos', () => {
    const path = findPath(grid(['.#.', '...']), { x: 0, y: 0 }, { x: 2, y: 0 });
    expect(path).toHaveLength(4);
    expect(path.at(-1)).toEqual({ x: 2, y: 0 });
    expect(path.some((p) => p.x === 1 && p.y === 0)).toBe(false);
  });

  it('retorna vazio sem caminho, com destino bloqueado, fora da grade ou no mesmo ponto', () => {
    const g = grid(['.#.', '.#.']);
    expect(findPath(g, { x: 0, y: 0 }, { x: 2, y: 0 })).toEqual([]);
    expect(findPath(g, { x: 0, y: 0 }, { x: 1, y: 0 })).toEqual([]);
    expect(findPath(g, { x: 0, y: 0 }, { x: 9, y: 9 })).toEqual([]);
    expect(findPath(g, { x: 0, y: 0 }, { x: 0, y: 0 })).toEqual([]);
  });
});

describe('pathToNeighbor', () => {
  it('vai até o lado de um alvo bloqueado', () => {
    const path = pathToNeighbor(grid(['....#']), { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(path?.at(-1)).toEqual({ x: 3, y: 0 });
  });

  it('retorna vazio quando já está ao lado', () => {
    expect(pathToNeighbor(grid(['.#']), { x: 0, y: 0 }, { x: 1, y: 0 })).toEqual([]);
  });

  it('retorna null quando nenhum vizinho é alcançável', () => {
    expect(pathToNeighbor(grid(['.#.#.']), { x: 0, y: 0 }, { x: 2, y: 0 })).toBeNull();
  });
});
```

`tests/unit/maps.test.ts`:
```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findPath, pathToNeighbor } from '../../src/core/pathfinding';
import { MapError, parseAsciiMap } from '../../tools/maps/parse';
import { toTiledJson } from '../../tools/maps/tiled';

describe('parseAsciiMap', () => {
  const sample = '@hideout 1 toca\n#####\n#G.1#\n#E~T#\n#####\n';

  it('lê terreno, bloqueios e objetos', () => {
    const map = parseAsciiMap('amostra', sample);
    expect([map.width, map.height]).toEqual([5, 4]);
    expect(map.ground.slice(5, 10)).toEqual([3, 0, 0, 0, 3]);
    expect(map.blocked[2]).toEqual([true, false, true, true, true]);
    expect(map.objects).toEqual([
      { type: 'spawn', name: 'grace', x: 1, y: 1 },
      { type: 'hideout', name: 'toca', x: 3, y: 1 },
      { type: 'npc', name: 'emilia', x: 1, y: 2 },
    ]);
  });

  it.each([
    ['linhas de larguras diferentes', '##\n#G.\n', /largura/],
    ['caractere desconhecido', '#G?\n', /desconhecido/],
    ['esconderijo sem @hideout', '#G1\n', /sem @hideout/],
    ['sem ponto de partida', '#..\n', /ponto de partida/],
  ])('rejeita %s', (_label, text, message) => {
    expect(() => parseAsciiMap('x', text)).toThrow(MapError);
    expect(() => parseAsciiMap('x', text)).toThrow(message);
  });
});

describe('toTiledJson', () => {
  it('gera camadas e tileset no formato do Tiled', () => {
    const map = parseAsciiMap('amostra', '@hideout 1 toca\n#G1\n');
    const tiled = toTiledJson(map, { name: 'pomar', image: '../sprites/pomar.png' });
    expect(tiled.layers[0]).toMatchObject({ name: 'ground', type: 'tilelayer', data: [4, 1, 1] });
    expect(tiled.layers[1]).toMatchObject({ name: 'objects', type: 'objectgroup' });
    expect(tiled.layers[1].objects[1]).toMatchObject({ name: 'toca', type: 'hideout', x: 32, y: 0 });
    expect(tiled.tilesets[0].tiles.map((t) => t.id)).toEqual([2, 3, 4]);
  });
});

describe('maps/pomar.txt', () => {
  const map = parseAsciiMap('pomar', readFileSync('maps/pomar.txt', 'utf8'));
  const spawn = map.objects.find((o) => o.type === 'spawn');
  const grid = map.blocked.map((row) => [...row]);
  for (const npc of map.objects.filter((o) => o.type === 'npc')) grid[npc.y]![npc.x] = true;

  it('tem os quatro personagens e os seis esconderijos', () => {
    expect(map.objects.filter((o) => o.type === 'npc').map((o) => o.name).sort()).toEqual(['benta', 'emilia', 'saci', 'visconde']);
    expect(map.objects.filter((o) => o.type === 'hideout').map((o) => o.name).sort()).toEqual([
      'cerca', 'jabuticabeira', 'milharal', 'pedra', 'ribeirao', 'toca',
    ]);
  });

  it('todo personagem e esconderijo é alcançável a partir do início', () => {
    for (const obj of map.objects) {
      if (obj.type === 'spawn') continue;
      if (obj.type === 'npc') expect(pathToNeighbor(grid, spawn!, obj), obj.name).not.toBeNull();
      else expect(findPath(grid, spawn!, obj).length, obj.name).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/unit/pathfinding.test.ts tests/unit/maps.test.ts`
Expected: FAIL, módulos não encontrados.

- [ ] **Step 3: Implementar o caminho**

`src/core/pathfinding.ts`:
```ts
export interface Point {
  x: number;
  y: number;
}

export type Grid = readonly (readonly boolean[])[];

const DIRECTIONS: readonly Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export function neighbors(point: Point): Point[] {
  return DIRECTIONS.map((d) => ({ x: point.x + d.x, y: point.y + d.y }));
}

function isFree(grid: Grid, p: Point): boolean {
  const row = grid[p.y];
  return row !== undefined && p.x >= 0 && p.x < row.length && row[p.x] === false;
}

export function findPath(grid: Grid, start: Point, goal: Point): Point[] {
  const width = grid[0]?.length ?? 0;
  if (width === 0 || !isFree(grid, goal)) return [];
  if (start.x === goal.x && start.y === goal.y) return [];

  const key = (p: Point) => p.y * width + p.x;
  const fromKey = (k: number): Point => ({ x: k % width, y: Math.floor(k / width) });
  const heuristic = (p: Point) => Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y);

  const startKey = key(start);
  const goalKey = key(goal);
  const open: number[] = [startKey];
  const cameFrom = new Map<number, number>();
  const cost = new Map<number, number>([[startKey, 0]]);
  const score = new Map<number, number>([[startKey, heuristic(start)]]);
  const closed = new Set<number>();

  while (open.length > 0) {
    open.sort((a, b) => (score.get(a) ?? Infinity) - (score.get(b) ?? Infinity));
    const current = open.shift() as number;

    if (current === goalKey) {
      const path: Point[] = [];
      let step: number | undefined = current;
      while (step !== undefined && step !== startKey) {
        path.unshift(fromKey(step));
        step = cameFrom.get(step);
      }
      return path;
    }

    closed.add(current);
    for (const next of neighbors(fromKey(current))) {
      if (!isFree(grid, next)) continue;
      const nextKey = key(next);
      if (closed.has(nextKey)) continue;
      const tentative = (cost.get(current) ?? Infinity) + 1;
      if (tentative < (cost.get(nextKey) ?? Infinity)) {
        cameFrom.set(nextKey, current);
        cost.set(nextKey, tentative);
        score.set(nextKey, tentative + heuristic(next));
        if (!open.includes(nextKey)) open.push(nextKey);
      }
    }
  }

  return [];
}

export function pathToNeighbor(grid: Grid, start: Point, target: Point): Point[] | null {
  let best: Point[] | null = null;
  for (const spot of neighbors(target)) {
    if (spot.x === start.x && spot.y === start.y) return [];
    const path = findPath(grid, start, spot);
    if (path.length > 0 && (best === null || path.length < best.length)) best = path;
  }
  return best;
}
```

- [ ] **Step 4: Implementar leitura do mapa e exportação para o Tiled**

`tools/maps/parse.ts`:
```ts
export const TERRAIN: Readonly<Record<string, number>> = { '.': 0, ':': 1, '~': 2, '#': 3, T: 4 };
export const BLOCKING_TILES: ReadonlySet<number> = new Set([2, 3, 4]);

const NPC_MARKERS: Readonly<Record<string, string>> = { E: 'emilia', V: 'visconde', D: 'benta', S: 'saci' };

export interface MapObject {
  type: 'spawn' | 'npc' | 'hideout';
  name: string;
  x: number;
  y: number;
}

export interface ParsedMap {
  name: string;
  width: number;
  height: number;
  ground: number[];
  blocked: boolean[][];
  objects: MapObject[];
}

export class MapError extends Error {}

export function parseAsciiMap(name: string, text: string): ParsedMap {
  const hideoutNames = new Map<string, string>();
  const rows: string[] = [];

  text.replace(/\r\n/g, '\n').split('\n').forEach((raw, index) => {
    const line = raw.trimEnd();
    if (line === '') return;
    if (line.startsWith('@hideout')) {
      const match = /^@hideout\s+([1-9])\s+([a-z0-9-]+)$/.exec(line);
      if (!match) throw new MapError(`${name}:${index + 1}: @hideout inválido`);
      hideoutNames.set(match[1] as string, match[2] as string);
      return;
    }
    rows.push(line);
  });

  if (rows.length === 0) throw new MapError(`${name}: mapa vazio`);
  const width = (rows[0] as string).length;
  const ground: number[] = [];
  const blocked: boolean[][] = [];
  const objects: MapObject[] = [];

  rows.forEach((row, y) => {
    if (row.length !== width) throw new MapError(`${name}: linha ${y} tem largura ${row.length}, esperado ${width}`);
    const blockedRow: boolean[] = [];
    Array.from(row).forEach((ch, x) => {
      let tile = TERRAIN[ch];
      if (tile === undefined) {
        tile = 0;
        const npc = NPC_MARKERS[ch];
        if (ch === 'G') objects.push({ type: 'spawn', name: 'grace', x, y });
        else if (npc !== undefined) objects.push({ type: 'npc', name: npc, x, y });
        else if (/^[1-9]$/.test(ch)) {
          const hideout = hideoutNames.get(ch);
          if (hideout === undefined) throw new MapError(`${name}: esconderijo ${ch} sem @hideout`);
          objects.push({ type: 'hideout', name: hideout, x, y });
        } else throw new MapError(`${name}: caractere "${ch}" desconhecido em (${x}, ${y})`);
      }
      ground.push(tile);
      blockedRow.push(BLOCKING_TILES.has(tile));
    });
    blocked.push(blockedRow);
  });

  if (!objects.some((o) => o.type === 'spawn')) throw new MapError(`${name}: falta o ponto de partida G`);
  return { name, width, height: rows.length, ground, blocked, objects };
}
```

`tools/maps/tiled.ts`:
```ts
import { BLOCKING_TILES, type ParsedMap } from './parse';

export const TILE_SIZE = 16;
export const TILE_COUNT = 5;

export interface TiledMap {
  type: 'map';
  version: string;
  tiledversion: string;
  orientation: 'orthogonal';
  renderorder: 'right-down';
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  infinite: false;
  nextlayerid: number;
  nextobjectid: number;
  tilesets: {
    firstgid: number;
    name: string;
    image: string;
    imagewidth: number;
    imageheight: number;
    tilewidth: number;
    tileheight: number;
    tilecount: number;
    columns: number;
    margin: number;
    spacing: number;
    tiles: { id: number; properties: { name: string; type: 'bool'; value: boolean }[] }[];
  }[];
  layers: [
    { id: 1; name: 'ground'; type: 'tilelayer'; width: number; height: number; x: 0; y: 0; opacity: 1; visible: true; data: number[] },
    {
      id: 2;
      name: 'objects';
      type: 'objectgroup';
      x: 0;
      y: 0;
      opacity: 1;
      visible: true;
      draworder: 'topdown';
      objects: { id: number; name: string; type: string; x: number; y: number; width: number; height: number; rotation: 0; visible: true }[];
    },
  ];
}

export function toTiledJson(map: ParsedMap, tileset: { name: string; image: string }): TiledMap {
  return {
    type: 'map',
    version: '1.10',
    tiledversion: '1.10.2',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    width: map.width,
    height: map.height,
    tilewidth: TILE_SIZE,
    tileheight: TILE_SIZE,
    infinite: false,
    nextlayerid: 3,
    nextobjectid: map.objects.length + 1,
    tilesets: [
      {
        firstgid: 1,
        name: tileset.name,
        image: tileset.image,
        imagewidth: TILE_SIZE * TILE_COUNT,
        imageheight: TILE_SIZE,
        tilewidth: TILE_SIZE,
        tileheight: TILE_SIZE,
        tilecount: TILE_COUNT,
        columns: TILE_COUNT,
        margin: 0,
        spacing: 0,
        tiles: [...BLOCKING_TILES].sort().map((id) => ({ id, properties: [{ name: 'blocked', type: 'bool', value: true }] })),
      },
    ],
    layers: [
      { id: 1, name: 'ground', type: 'tilelayer', width: map.width, height: map.height, x: 0, y: 0, opacity: 1, visible: true, data: map.ground.map((tile) => tile + 1) },
      {
        id: 2,
        name: 'objects',
        type: 'objectgroup',
        x: 0,
        y: 0,
        opacity: 1,
        visible: true,
        draworder: 'topdown',
        objects: map.objects.map((o, index) => ({
          id: index + 1,
          name: o.name,
          type: o.type,
          x: o.x * TILE_SIZE,
          y: o.y * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
          rotation: 0,
          visible: true,
        })),
      },
    ],
  };
}
```

- [ ] **Step 5: Criar o mapa do pomar**

`maps/pomar.txt` (12 linhas de 30 caracteres):
```
@hideout 1 jabuticabeira
@hideout 2 ribeirao
@hideout 3 cerca
@hideout 4 milharal
@hideout 5 pedra
@hideout 6 toca
##############################
#TT.....T.....~~~~.....T....T#
#T......1.....~~~~~2.........#
#...E..........~~~~~.........#
#T............~~~~......V....#
#::::::::::::::::::::::::::::#
#.....T...###3......T........#
#..G................D........#
#T...4.........T.....5......T#
#............................#
#TT......6...........S......T#
##############################
```

- [ ] **Step 6: Criar o script de geração**

`tools/build-maps.ts`:
```ts
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseAsciiMap } from './maps/parse';
import { toTiledJson } from './maps/tiled';

const OUT = join('public', 'assets', 'generated', 'maps');

try {
  mkdirSync(OUT, { recursive: true });
  const files = readdirSync('maps').filter((f) => f.endsWith('.txt'));
  for (const file of files) {
    const name = basename(file, '.txt');
    const map = parseAsciiMap(name, readFileSync(join('maps', file), 'utf8'));
    const tiled = toTiledJson(map, { name: 'pomar', image: '../sprites/pomar.png' });
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify(tiled));
  }
  console.log(`${files.length} mapas gerados em ${OUT}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
```

Em `package.json`, definir `"maps": "tsx tools/build-maps.ts"`.

- [ ] **Step 7: Registrar no ADR-002**

Acrescentar ao fim da seção **Decisão** de `docs/adrs/ADR-002-pixel-art-gerada-por-codigo.md`:
```markdown

Os mapas seguem o mesmo princípio: cada mapa é um arquivo ASCII em `maps/`, convertido por `tools/build-maps.ts` para o formato JSON do Tiled. O JSON gerado abre no editor Tiled para inspeção, mas a fonte versionada é o arquivo ASCII.
```

- [ ] **Step 8: Rodar e ver passar**

Run: `npx vitest run && npm run maps`
Expected: PASS; saída `1 mapas gerados em public/assets/generated/maps`.

- [ ] **Step 9: Commit**

```bash
git add src/core/pathfinding.ts tools/maps tools/build-maps.ts maps tests/unit package.json docs/adrs/ADR-002-pixel-art-gerada-por-codigo.md
git commit -m "feat: caminho em grade e mapa do pomar no formato do Tiled"
```

---

### Task 8: Conteúdo da fase 1 e desafios de palavras

**Files:**
- Create: `src/content/phase1.json`, `src/core/challenges/types.ts`, `src/core/challenges/vocabulary.ts`, `src/core/challenges/wordBuild.ts`, `src/core/challenges/wordMatch.ts`, `src/core/challenges/fillSentence.ts`
- Test: `tests/unit/challenges/wordBuild.test.ts`, `tests/unit/challenges/wordMatch.test.ts`, `tests/unit/challenges/fillSentence.test.ts`

**Interfaces:**
- Consumes: `Level` (task 5), `Rng` (task 5), `Locale` (task 5), `translate` (task 6)
- Produces:
  - `interface Challenge<Q, A> { id: string; generate(level: Level, rng: Rng, locale: Locale): Q; check(question: Q, answer: A): boolean; hint(question: Q, locale: Locale): string }`
  - `interface VocabularyEntry { pt: string; en: string; level: Level }`, `VOCABULARY: readonly VocabularyEntry[]`, `lettersOf(word: string): string[]`
  - `interface WordBuildQuestion { word: string; letters: string[]; clue: string; tiles: string[] }`, `wordBuild: Challenge<WordBuildQuestion, string[]>`, `DISTRACTORS_BY_LEVEL`
  - `interface WordMatchQuestion { pairs: { pt: string; en: string }[]; left: string[]; right: string[] }`, `type WordMatchAnswer = Record<string, string>`, `wordMatch: Challenge<WordMatchQuestion, WordMatchAnswer>`, `PAIRS_BY_LEVEL`, `MAX_EN_LENGTH = 12`
  - `interface FillSentenceQuestion { text: string; answer: string; options: string[] }`, `fillSentence: Challenge<FillSentenceQuestion, string>`, `SENTENCES: readonly SentenceEntry[]`

- [ ] **Step 1: Criar o conteúdo da fase 1**

`src/content/phase1.json`:
```json
{
  "vocabulary": [
    { "pt": "ONÇA", "en": "JAGUAR", "level": 1 },
    { "pt": "MILHO", "en": "CORN", "level": 1 },
    { "pt": "BOLO", "en": "CAKE", "level": 1 },
    { "pt": "SAPO", "en": "FROG", "level": 1 },
    { "pt": "LUA", "en": "MOON", "level": 1 },
    { "pt": "ARARA", "en": "MACAW", "level": 1 },
    { "pt": "PIPOCA", "en": "POPCORN", "level": 2 },
    { "pt": "BONECA", "en": "DOLL", "level": 2 },
    { "pt": "MACACO", "en": "MONKEY", "level": 2 },
    { "pt": "TUCANO", "en": "TOUCAN", "level": 2 },
    { "pt": "CORUJA", "en": "OWL", "level": 2 },
    { "pt": "PAÇOCA", "en": "PEANUT CANDY", "level": 2 },
    { "pt": "JABUTICABA", "en": "JABUTICABA BERRY", "level": 3 },
    { "pt": "BORBOLETA", "en": "BUTTERFLY", "level": 3 },
    { "pt": "FOGUEIRA", "en": "BONFIRE", "level": 3 },
    { "pt": "BANDEIRINHA", "en": "LITTLE FLAG", "level": 3 },
    { "pt": "PICAPAU", "en": "WOODPECKER", "level": 3 },
    { "pt": "BRIGADEIRO", "en": "CHOCOLATE FUDGE BALL", "level": 3 }
  ],
  "sentences": [
    {
      "level": 1,
      "pt": { "text": "A ___ é o maior felino do Brasil.", "answer": "onça", "options": ["onça", "sapo", "lua"] },
      "en": { "text": "The ___ is the biggest wild cat in Brazil.", "answer": "jaguar", "options": ["jaguar", "frog", "moon"] }
    },
    {
      "level": 1,
      "pt": { "text": "A Tia Nastácia fez um ___ de fubá.", "answer": "bolo", "options": ["bolo", "sapo", "milho"] },
      "en": { "text": "Aunt Nastácia baked a cornmeal ___.", "answer": "cake", "options": ["cake", "frog", "moon"] }
    },
    {
      "level": 2,
      "pt": { "text": "A ___ Emília fala sem parar.", "answer": "boneca", "options": ["boneca", "pipoca", "coruja"] },
      "en": { "text": "Emília the rag ___ never stops talking.", "answer": "doll", "options": ["doll", "popcorn", "owl"] }
    },
    {
      "level": 2,
      "pt": { "text": "O ___ tem um bico grande e colorido.", "answer": "tucano", "options": ["tucano", "macaco", "milho"] },
      "en": { "text": "The ___ has a big, colourful beak.", "answer": "toucan", "options": ["toucan", "monkey", "corn"] }
    },
    {
      "level": 3,
      "pt": { "text": "A ___ dá frutinhas roxas grudadas no tronco.", "answer": "jabuticabeira", "options": ["jabuticabeira", "fogueira", "borboleta"] },
      "en": { "text": "The jabuticaba ___ grows purple berries right on its trunk.", "answer": "tree", "options": ["tree", "bonfire", "butterfly"] }
    },
    {
      "level": 3,
      "pt": { "text": "Na festa junina, todos dançam em volta da ___.", "answer": "fogueira", "options": ["fogueira", "bandeirinha", "borboleta"] },
      "en": { "text": "At the June festival, everyone dances around the ___.", "answer": "bonfire", "options": ["bonfire", "little flag", "butterfly"] }
    }
  ],
  "hideouts": [
    {
      "id": "jabuticabeira",
      "clues": {
        "pt": ["Tem um tronco grosso.", "Dá frutinhas redondas.", "As frutinhas são roxas."],
        "en": ["It has a thick trunk.", "It grows small round fruit.", "The fruit is purple."]
      }
    },
    {
      "id": "ribeirao",
      "clues": {
        "pt": ["Faz um barulhinho o dia todo.", "Os sapos adoram morar perto.", "É cheio de água fresca."],
        "en": ["It makes a gentle sound all day.", "Frogs love to live nearby.", "It is full of cool water."]
      }
    },
    {
      "id": "cerca",
      "clues": {
        "pt": ["É feita de madeira.", "Tem várias tábuas em fila.", "Serve para as vacas não fugirem."],
        "en": ["It is made of wood.", "It has lots of planks in a row.", "It stops the cows from running away."]
      }
    },
    {
      "id": "milharal",
      "clues": {
        "pt": ["As plantas são mais altas que você.", "Ali nasce uma comida amarela.", "É de lá que vem a pipoca."],
        "en": ["The plants are taller than you.", "A yellow food grows there.", "Popcorn comes from there."]
      }
    },
    {
      "id": "pedra",
      "clues": {
        "pt": ["É dura e fria.", "Não cresce e não se mexe.", "É cinza e muito grande."],
        "en": ["It is hard and cold.", "It does not grow or move.", "It is grey and very big."]
      }
    },
    {
      "id": "toca",
      "clues": {
        "pt": ["Fica debaixo da terra.", "É um buraco escuro.", "Um bicho de casco mora lá dentro."],
        "en": ["It is under the ground.", "It is a dark hole.", "An animal with a shell lives inside."]
      }
    }
  ],
  "legend": {
    "pt": {
      "title": "A lenda do Saci",
      "paragraphs": [
        "O Saci é um menino de uma perna só. Ele usa um gorro vermelho mágico e pula muito rápido.",
        "Ele adora fazer travessuras: esconde objetos, dá nó na crina dos cavalos e assobia no meio do mato.",
        "Dizem que quem consegue pegar o gorro do Saci pode fazer um pedido."
      ]
    },
    "en": {
      "title": "The legend of Saci",
      "paragraphs": [
        "Saci is a boy with only one leg. He wears a magic red cap and hops very fast.",
        "He loves playing tricks: he hides things, ties knots in horses' manes and whistles in the woods.",
        "People say that whoever catches Saci's cap can make a wish."
      ]
    },
    "questions": [
      {
        "pt": { "prompt": "De que cor é o gorro do Saci?", "answer": "Vermelho", "distractors": ["Azul", "Verde"], "keyword": "gorro" },
        "en": { "prompt": "What colour is Saci's cap?", "answer": "Red", "distractors": ["Blue", "Green"], "keyword": "cap" }
      },
      {
        "pt": { "prompt": "O que o Saci adora fazer?", "answer": "Travessuras", "distractors": ["Dormir", "Cozinhar"], "keyword": "adora" },
        "en": { "prompt": "What does Saci love doing?", "answer": "Playing tricks", "distractors": ["Sleeping", "Cooking"], "keyword": "loves" }
      },
      {
        "pt": { "prompt": "O que pode fazer quem pega o gorro?", "answer": "Um pedido", "distractors": ["Ficar invisível", "Virar sapo"], "keyword": "pedido" },
        "en": { "prompt": "What can someone who catches the cap do?", "answer": "Make a wish", "distractors": ["Become invisible", "Turn into a frog"], "keyword": "wish" }
      }
    ]
  }
}
```

- [ ] **Step 2: Escrever os testes que falham**

`tests/unit/challenges/wordBuild.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { lettersOf, VOCABULARY } from '../../../src/core/challenges/vocabulary';
import { DISTRACTORS_BY_LEVEL, wordBuild } from '../../../src/core/challenges/wordBuild';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';

const LEVELS: Level[] = [1, 2, 3];

describe('vocabulário', () => {
  it('tem pelo menos 5 palavras por nível e nenhuma repetida', () => {
    for (const level of LEVELS) expect(VOCABULARY.filter((v) => v.level === level).length).toBeGreaterThanOrEqual(5);
    expect(new Set(VOCABULARY.map((v) => v.pt)).size).toBe(VOCABULARY.length);
    expect(new Set(VOCABULARY.map((v) => v.en)).size).toBe(VOCABULARY.length);
  });

  it('lettersOf mantém acentos e cedilha como uma letra', () => {
    expect(lettersOf('PAÇOCA')).toEqual(['P', 'A', 'Ç', 'O', 'C', 'A']);
  });
});

describe('wordBuild', () => {
  for (const level of LEVELS) {
    it(`nível ${level}: as peças contêm a palavra e os distratores certos`, () => {
      for (let seed = 0; seed < 300; seed += 1) {
        const q = wordBuild.generate(level, createRng(seed), 'pt');
        expect(VOCABULARY.find((v) => v.pt === q.word)?.level).toBe(level);
        expect(q.tiles).toHaveLength(q.letters.length + DISTRACTORS_BY_LEVEL[level]);
        const remaining = [...q.tiles];
        for (const letter of q.letters) {
          const index = remaining.indexOf(letter);
          expect(index).toBeGreaterThanOrEqual(0);
          remaining.splice(index, 1);
        }
      }
    });
  }

  it('aceita a ordem certa e rejeita outra', () => {
    const q = wordBuild.generate(2, createRng(1), 'pt');
    expect(wordBuild.check(q, q.letters)).toBe(true);
    expect(wordBuild.check(q, [...q.letters].reverse())).toBe(false);
    expect(wordBuild.check(q, q.letters.slice(1))).toBe(false);
  });

  it('dica cita a primeira letra e o tamanho nos dois idiomas', () => {
    const q = { word: 'SAPO', letters: ['S', 'A', 'P', 'O'], clue: 'FROG', tiles: [] };
    expect(wordBuild.hint(q, 'pt')).toBe('A palavra começa com "S" e tem 4 letras.');
    expect(wordBuild.hint(q, 'en')).toBe('The word starts with "S" and has 4 letters.');
  });
});
```

`tests/unit/challenges/wordMatch.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { VOCABULARY } from '../../../src/core/challenges/vocabulary';
import { MAX_EN_LENGTH, PAIRS_BY_LEVEL, wordMatch } from '../../../src/core/challenges/wordMatch';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';

describe('wordMatch', () => {
  for (const level of [1, 2, 3] as Level[]) {
    it(`nível ${level}: pares distintos, do nível ou abaixo, embaralhados nas duas colunas`, () => {
      for (let seed = 0; seed < 300; seed += 1) {
        const q = wordMatch.generate(level, createRng(seed), 'pt');
        expect(q.pairs).toHaveLength(PAIRS_BY_LEVEL[level]);
        expect(new Set(q.pairs.map((p) => p.pt)).size).toBe(q.pairs.length);
        for (const pair of q.pairs) {
          const entry = VOCABULARY.find((v) => v.pt === pair.pt);
          expect(entry?.en).toBe(pair.en);
          expect(entry!.level).toBeLessThanOrEqual(level);
          expect(pair.en.length).toBeLessThanOrEqual(MAX_EN_LENGTH);
        }
        expect([...q.left].sort()).toEqual(q.pairs.map((p) => p.pt).sort());
        expect([...q.right].sort()).toEqual(q.pairs.map((p) => p.en).sort());
      }
    });
  }

  it('aceita todos os pares certos e rejeita troca ou falta', () => {
    const q = wordMatch.generate(1, createRng(5), 'pt');
    const right = Object.fromEntries(q.pairs.map((p) => [p.pt, p.en]));
    expect(wordMatch.check(q, right)).toBe(true);
    const [a, b] = q.pairs;
    expect(wordMatch.check(q, { ...right, [a!.pt]: b!.en, [b!.pt]: a!.en })).toBe(false);
    const missing = { ...right };
    delete missing[a!.pt];
    expect(wordMatch.check(q, missing)).toBe(false);
  });

  it('dica mostra o primeiro par', () => {
    const q = { pairs: [{ pt: 'LUA', en: 'MOON' }], left: ['LUA'], right: ['MOON'] };
    expect(wordMatch.hint(q, 'pt')).toBe('Comece por "LUA". Em inglês, ela é "MOON".');
  });
});
```

`tests/unit/challenges/fillSentence.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { fillSentence, SENTENCES } from '../../../src/core/challenges/fillSentence';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';

describe('frases', () => {
  it('cada frase tem lacuna, resposta entre três opções distintas, nos dois idiomas', () => {
    for (const sentence of SENTENCES) {
      for (const locale of ['pt', 'en'] as const) {
        const s = sentence[locale];
        expect(s.text).toContain('___');
        expect(s.options).toHaveLength(3);
        expect(new Set(s.options).size).toBe(3);
        expect(s.options).toContain(s.answer);
      }
    }
  });

  it('existem pelo menos duas frases por nível', () => {
    for (const level of [1, 2, 3] as Level[]) {
      expect(SENTENCES.filter((s) => s.level === level).length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('fillSentence', () => {
  it('gera no idioma pedido e confere a resposta', () => {
    const q = fillSentence.generate(1, createRng(2), 'en');
    expect(q.options).toContain(q.answer);
    expect(SENTENCES.some((s) => s.en.text === q.text)).toBe(true);
    expect(fillSentence.check(q, q.answer)).toBe(true);
    expect(fillSentence.check(q, q.options.find((o) => o !== q.answer)!)).toBe(false);
  });

  it('dica cita a primeira letra em maiúscula', () => {
    expect(fillSentence.hint({ text: '', answer: 'onça', options: [] }, 'pt')).toBe('A palavra começa com "O".');
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run tests/unit/challenges`
Expected: FAIL, módulos não encontrados.

- [ ] **Step 4: Implementar**

`src/core/challenges/types.ts`:
```ts
import type { Level } from '../difficulty';
import type { Locale } from '../locale';
import type { Rng } from '../rng';

export interface Challenge<Q, A> {
  id: string;
  generate(level: Level, rng: Rng, locale: Locale): Q;
  check(question: Q, answer: A): boolean;
  hint(question: Q, locale: Locale): string;
}
```

`src/core/challenges/vocabulary.ts`:
```ts
import phase1 from '../../content/phase1.json';
import type { Level } from '../difficulty';

export interface VocabularyEntry {
  pt: string;
  en: string;
  level: Level;
}

export const VOCABULARY = phase1.vocabulary as readonly VocabularyEntry[];

export function lettersOf(word: string): string[] {
  return Array.from(word.normalize('NFC')).filter((ch) => ch !== ' ');
}
```

`src/core/challenges/wordBuild.ts`:
```ts
import type { Level } from '../difficulty';
import { translate } from '../strings';
import type { Challenge } from './types';
import { lettersOf, VOCABULARY } from './vocabulary';

export interface WordBuildQuestion {
  word: string;
  letters: string[];
  clue: string;
  tiles: string[];
}

const DISTRACTOR_LETTERS = Array.from('ABCDEFGHIJLMNOPRSTUV');
export const DISTRACTORS_BY_LEVEL: Readonly<Record<Level, number>> = { 1: 0, 2: 2, 3: 3 };

export const wordBuild: Challenge<WordBuildQuestion, string[]> = {
  id: 'wordBuild',
  generate(level, rng) {
    const entry = rng.pick(VOCABULARY.filter((v) => v.level === level));
    const letters = lettersOf(entry.pt);
    const extras = Array.from({ length: DISTRACTORS_BY_LEVEL[level] }, () => rng.pick(DISTRACTOR_LETTERS));
    return { word: entry.pt, letters, clue: entry.en, tiles: rng.shuffle([...letters, ...extras]) };
  },
  check(question, answer) {
    return answer.join('') === question.letters.join('');
  },
  hint(question, locale) {
    return translate(locale, 'hint.wordBuild', { first: question.letters[0] ?? '', length: question.letters.length });
  },
};
```

`src/core/challenges/wordMatch.ts`:
```ts
import type { Level } from '../difficulty';
import { translate } from '../strings';
import type { Challenge } from './types';
import { VOCABULARY } from './vocabulary';

export interface WordMatchQuestion {
  pairs: { pt: string; en: string }[];
  left: string[];
  right: string[];
}

export type WordMatchAnswer = Record<string, string>;

export const PAIRS_BY_LEVEL: Readonly<Record<Level, number>> = { 1: 3, 2: 4, 3: 5 };
export const MAX_EN_LENGTH = 12;

export const wordMatch: Challenge<WordMatchQuestion, WordMatchAnswer> = {
  id: 'wordMatch',
  generate(level, rng) {
    const pool = VOCABULARY.filter((v) => v.level <= level && v.en.length <= MAX_EN_LENGTH);
    const pairs = rng.shuffle(pool).slice(0, PAIRS_BY_LEVEL[level]).map(({ pt, en }) => ({ pt, en }));
    return { pairs, left: rng.shuffle(pairs.map((p) => p.pt)), right: rng.shuffle(pairs.map((p) => p.en)) };
  },
  check(question, answer) {
    return Object.keys(answer).length === question.pairs.length && question.pairs.every((p) => answer[p.pt] === p.en);
  },
  hint(question, locale) {
    const first = question.pairs[0];
    return first ? translate(locale, 'hint.wordMatch', { pt: first.pt, en: first.en }) : '';
  },
};
```

`src/core/challenges/fillSentence.ts`:
```ts
import phase1 from '../../content/phase1.json';
import type { Level } from '../difficulty';
import type { Locale } from '../locale';
import { translate } from '../strings';
import type { Challenge } from './types';

interface SentenceText {
  text: string;
  answer: string;
  options: string[];
}

export interface SentenceEntry {
  level: Level;
  pt: SentenceText;
  en: SentenceText;
}

export interface FillSentenceQuestion {
  text: string;
  answer: string;
  options: string[];
}

export const SENTENCES = phase1.sentences as readonly SentenceEntry[];

export const fillSentence: Challenge<FillSentenceQuestion, string> = {
  id: 'fillSentence',
  generate(level, rng, locale: Locale) {
    const entry = rng.pick(SENTENCES.filter((s) => s.level === level))[locale];
    return { text: entry.text, answer: entry.answer, options: rng.shuffle(entry.options) };
  },
  check(question, answer) {
    return answer === question.answer;
  },
  hint(question, locale) {
    const first = Array.from(question.answer)[0] ?? '';
    return translate(locale, 'hint.fillSentence', { first: first.toLocaleUpperCase('pt-BR') });
  },
};
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS; sem erros de tipo.

- [ ] **Step 6: Commit**

```bash
git add src/content/phase1.json src/core/challenges tests/unit/challenges
git commit -m "feat: desafios de montar palavra, ligar idiomas e completar frase"
```

---

### Task 9: Caça ao Saci, leitura da lenda e sequência da fase

**Files:**
- Create: `src/core/challenges/clueHunt.ts`, `src/core/challenges/comprehension.ts`, `src/core/challenges/index.ts`, `src/core/phaseFlow.ts`, `src/core/navigation.ts`
- Test: `tests/unit/challenges/clueHunt.test.ts`, `tests/unit/challenges/comprehension.test.ts`, `tests/unit/phaseFlow.test.ts`

**Interfaces:**
- Consumes: `Challenge` (task 8), `Progress` (task 5), `translate` e `DICTIONARIES` (task 6), `parseAsciiMap` (task 7)
- Produces:
  - `interface ClueHuntQuestion { targetId: string; clues: string[]; candidates: string[] }`, `clueHunt: Challenge<ClueHuntQuestion, string>`, `HIDEOUTS`, `CANDIDATES_BY_LEVEL`
  - `interface ComprehensionItem { prompt: string; options: string[]; answer: string; keyword: string }`, `interface ComprehensionQuestion { title: string; paragraphs: string[]; questions: ComprehensionItem[] }`, `comprehension: Challenge<ComprehensionQuestion, string[]>`, `LEGEND`, `QUESTIONS_PER_ROUND = 2`
  - `type ChallengeId = 'wordBuild' | 'wordMatch' | 'fillSentence' | 'clueHunt' | 'comprehension'`, `CHALLENGES: Record<ChallengeId, Challenge<unknown, unknown>>`
  - `type NpcId = 'emilia' | 'visconde' | 'benta' | 'saci'`, `type SpeakerId = NpcId | 'grace' | 'companion' | 'narrator'`, `interface DialogueSpec { speaker: SpeakerId; key: string }`, `interface PhaseStep { id: string; npc: NpcId; challenge: ChallengeId; intro: DialogueSpec[]; done: DialogueSpec[] }`, `PHASE1_STEPS: readonly PhaseStep[]`, `nextStep(steps, completed: readonly string[]): PhaseStep | null`, `isPhaseComplete(steps, completed): boolean`
  - `type SceneKey = 'LanguageScene' | 'IntroScene' | 'MapScene' | 'PhaseCompleteScene'`, `firstSceneFor(progress: Progress): SceneKey`

- [ ] **Step 1: Escrever os testes que falham**

`tests/unit/challenges/clueHunt.test.ts`:
```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CANDIDATES_BY_LEVEL, clueHunt, HIDEOUTS } from '../../../src/core/challenges/clueHunt';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';
import { DICTIONARIES } from '../../../src/core/strings';
import { parseAsciiMap } from '../../../tools/maps/parse';

describe('esconderijos', () => {
  it('cada esconderijo tem três pistas nos dois idiomas e nome traduzido', () => {
    for (const hideout of HIDEOUTS) {
      expect(hideout.clues.pt).toHaveLength(3);
      expect(hideout.clues.en).toHaveLength(3);
      expect(DICTIONARIES.pt[`hideout.${hideout.id}`]).toBeDefined();
    }
  });

  it('os esconderijos do conteúdo são os mesmos do mapa do pomar', () => {
    const map = parseAsciiMap('pomar', readFileSync('maps/pomar.txt', 'utf8'));
    const onMap = map.objects.filter((o) => o.type === 'hideout').map((o) => o.name).sort();
    expect(HIDEOUTS.map((h) => h.id).sort()).toEqual(onMap);
  });
});

describe('clueHunt', () => {
  for (const level of [1, 2, 3] as Level[]) {
    it(`nível ${level}: candidatos distintos incluem o alvo`, () => {
      for (let seed = 0; seed < 200; seed += 1) {
        const q = clueHunt.generate(level, createRng(seed), 'pt');
        expect(q.candidates).toHaveLength(CANDIDATES_BY_LEVEL[level]);
        expect(new Set(q.candidates).size).toBe(q.candidates.length);
        expect(q.candidates).toContain(q.targetId);
        expect(q.clues).toEqual(HIDEOUTS.find((h) => h.id === q.targetId)!.clues.pt);
      }
    });
  }

  it('confere o esconderijo e dá a última pista como dica', () => {
    const q = clueHunt.generate(2, createRng(4), 'en');
    expect(clueHunt.check(q, q.targetId)).toBe(true);
    expect(clueHunt.check(q, q.candidates.find((c) => c !== q.targetId)!)).toBe(false);
    expect(clueHunt.hint(q, 'en')).toBe(`Read this clue carefully again: ${q.clues[2]}`);
  });
});
```

`tests/unit/challenges/comprehension.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { comprehension, LEGEND, QUESTIONS_PER_ROUND } from '../../../src/core/challenges/comprehension';
import type { Level } from '../../../src/core/difficulty';
import { createRng } from '../../../src/core/rng';

describe('lenda', () => {
  it('a palavra-chave de cada pergunta aparece no texto do mesmo idioma', () => {
    for (const question of LEGEND.questions) {
      for (const locale of ['pt', 'en'] as const) {
        expect(LEGEND[locale].paragraphs.join(' ')).toContain(question[locale].keyword);
      }
    }
  });
});

describe('comprehension', () => {
  const optionsByLevel: Record<Level, number> = { 1: 2, 2: 3, 3: 3 };

  for (const level of [1, 2, 3] as Level[]) {
    it(`nível ${level}: duas perguntas distintas com ${optionsByLevel[level]} opções`, () => {
      for (let seed = 0; seed < 100; seed += 1) {
        const q = comprehension.generate(level, createRng(seed), 'pt');
        expect(q.questions).toHaveLength(QUESTIONS_PER_ROUND);
        expect(new Set(q.questions.map((i) => i.prompt)).size).toBe(QUESTIONS_PER_ROUND);
        for (const item of q.questions) {
          expect(item.options).toHaveLength(optionsByLevel[level]);
          expect(item.options).toContain(item.answer);
        }
      }
    });
  }

  it('só aceita todas as respostas certas', () => {
    const q = comprehension.generate(2, createRng(8), 'pt');
    const right = q.questions.map((i) => i.answer);
    expect(comprehension.check(q, right)).toBe(true);
    expect(comprehension.check(q, [right[0]!, q.questions[1]!.options.find((o) => o !== right[1])!])).toBe(false);
    expect(comprehension.check(q, [right[0]!])).toBe(false);
  });

  it('dica aponta a palavra-chave da primeira pergunta', () => {
    const q = comprehension.generate(1, createRng(3), 'pt');
    expect(comprehension.hint(q, 'pt')).toBe(`A resposta está no texto. Procure a palavra "${q.questions[0]!.keyword}".`);
  });
});
```

`tests/unit/phaseFlow.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { CHALLENGES } from '../../src/core/challenges';
import { firstSceneFor } from '../../src/core/navigation';
import { isPhaseComplete, nextStep, PHASE1_STEPS } from '../../src/core/phaseFlow';
import { newProgress } from '../../src/core/progress';
import { DICTIONARIES } from '../../src/core/strings';

const allIds = PHASE1_STEPS.map((s) => s.id);

describe('sequência da fase 1', () => {
  it('tem cinco passos com ids únicos e desafios registrados', () => {
    expect(PHASE1_STEPS).toHaveLength(5);
    expect(new Set(allIds).size).toBe(5);
    for (const step of PHASE1_STEPS) expect(CHALLENGES[step.challenge]).toBeDefined();
  });

  it('todas as falas existem no dicionário', () => {
    for (const step of PHASE1_STEPS) {
      for (const line of [...step.intro, ...step.done]) expect(DICTIONARIES.pt[line.key], line.key).toBeDefined();
    }
  });

  it('nextStep segue a ordem e ignora ids desconhecidos', () => {
    expect(nextStep(PHASE1_STEPS, [])?.id).toBe('p1-word-build');
    expect(nextStep(PHASE1_STEPS, ['p1-word-build', 'outro'])?.id).toBe('p1-word-match');
    expect(nextStep(PHASE1_STEPS, allIds)).toBeNull();
  });

  it('isPhaseComplete só com todos os passos', () => {
    expect(isPhaseComplete(PHASE1_STEPS, allIds.slice(0, 4))).toBe(false);
    expect(isPhaseComplete(PHASE1_STEPS, allIds)).toBe(true);
  });
});

describe('firstSceneFor', () => {
  it('escolhe a cena pelo progresso', () => {
    expect(firstSceneFor(newProgress())).toBe('LanguageScene');
    expect(firstSceneFor({ ...newProgress(), locale: 'pt' })).toBe('IntroScene');
    expect(firstSceneFor({ ...newProgress(), locale: 'pt', companionName: 'Mel' })).toBe('MapScene');
    expect(firstSceneFor({ ...newProgress(), locale: 'pt', companionName: 'Mel', completed: allIds })).toBe('PhaseCompleteScene');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/unit/challenges tests/unit/phaseFlow.test.ts`
Expected: FAIL, módulos não encontrados.

- [ ] **Step 3: Implementar os desafios**

`src/core/challenges/clueHunt.ts`:
```ts
import phase1 from '../../content/phase1.json';
import type { Level } from '../difficulty';
import type { Locale } from '../locale';
import { translate } from '../strings';
import type { Challenge } from './types';

export interface HideoutEntry {
  id: string;
  clues: Record<Locale, string[]>;
}

export interface ClueHuntQuestion {
  targetId: string;
  clues: string[];
  candidates: string[];
}

export const HIDEOUTS = phase1.hideouts as readonly HideoutEntry[];
export const CANDIDATES_BY_LEVEL: Readonly<Record<Level, number>> = { 1: 3, 2: 4, 3: 6 };

export const clueHunt: Challenge<ClueHuntQuestion, string> = {
  id: 'clueHunt',
  generate(level, rng, locale) {
    const target = rng.pick(HIDEOUTS);
    const others = rng.shuffle(HIDEOUTS.filter((h) => h.id !== target.id)).slice(0, CANDIDATES_BY_LEVEL[level] - 1);
    return {
      targetId: target.id,
      clues: [...target.clues[locale]],
      candidates: rng.shuffle([target, ...others].map((h) => h.id)),
    };
  },
  check(question, answer) {
    return answer === question.targetId;
  },
  hint(question, locale) {
    return translate(locale, 'hint.clueHunt', { clue: question.clues[question.clues.length - 1] ?? '' });
  },
};
```

`src/core/challenges/comprehension.ts`:
```ts
import phase1 from '../../content/phase1.json';
import type { Level } from '../difficulty';
import type { Locale } from '../locale';
import { translate } from '../strings';
import type { Challenge } from './types';

interface LegendQuestionText {
  prompt: string;
  answer: string;
  distractors: string[];
  keyword: string;
}

export interface LegendData {
  pt: { title: string; paragraphs: string[] };
  en: { title: string; paragraphs: string[] };
  questions: Record<Locale, LegendQuestionText>[];
}

export interface ComprehensionItem {
  prompt: string;
  options: string[];
  answer: string;
  keyword: string;
}

export interface ComprehensionQuestion {
  title: string;
  paragraphs: string[];
  questions: ComprehensionItem[];
}

export const LEGEND = phase1.legend as LegendData;
export const QUESTIONS_PER_ROUND = 2;
const DISTRACTORS_BY_LEVEL: Readonly<Record<Level, number>> = { 1: 1, 2: 2, 3: 2 };

export const comprehension: Challenge<ComprehensionQuestion, string[]> = {
  id: 'comprehension',
  generate(level, rng, locale) {
    const chosen = rng.shuffle(LEGEND.questions).slice(0, QUESTIONS_PER_ROUND).map((q) => q[locale]);
    return {
      title: LEGEND[locale].title,
      paragraphs: [...LEGEND[locale].paragraphs],
      questions: chosen.map((q) => ({
        prompt: q.prompt,
        answer: q.answer,
        keyword: q.keyword,
        options: rng.shuffle([q.answer, ...q.distractors.slice(0, DISTRACTORS_BY_LEVEL[level])]),
      })),
    };
  },
  check(question, answer) {
    return answer.length === question.questions.length && question.questions.every((q, i) => answer[i] === q.answer);
  },
  hint(question, locale) {
    return translate(locale, 'hint.comprehension', { keyword: question.questions[0]?.keyword ?? '' });
  },
};
```

`src/core/challenges/index.ts`:
```ts
import { clueHunt } from './clueHunt';
import { comprehension } from './comprehension';
import { fillSentence } from './fillSentence';
import type { Challenge } from './types';
import { wordBuild } from './wordBuild';
import { wordMatch } from './wordMatch';

export type ChallengeId = 'wordBuild' | 'wordMatch' | 'fillSentence' | 'clueHunt' | 'comprehension';

export const CHALLENGES: Record<ChallengeId, Challenge<unknown, unknown>> = {
  wordBuild,
  wordMatch,
  fillSentence,
  clueHunt,
  comprehension,
};
```

Se o TypeScript recusar a atribuição de `Challenge<WordBuildQuestion, string[]>` a `Challenge<unknown, unknown>`, converter cada entrada com `as Challenge<unknown, unknown>`; os métodos da interface são declarados em sintaxe de método, que o TypeScript trata de forma bivariante, então a conversão não deveria ser necessária.

- [ ] **Step 4: Implementar a sequência e a navegação**

`src/core/phaseFlow.ts`:
```ts
import type { ChallengeId } from './challenges';

export type NpcId = 'emilia' | 'visconde' | 'benta' | 'saci';
export type SpeakerId = NpcId | 'grace' | 'companion' | 'narrator';

export interface DialogueSpec {
  speaker: SpeakerId;
  key: string;
}

export interface PhaseStep {
  id: string;
  npc: NpcId;
  challenge: ChallengeId;
  intro: DialogueSpec[];
  done: DialogueSpec[];
}

export const PHASE1_STEPS: readonly PhaseStep[] = [
  {
    id: 'p1-word-build',
    npc: 'emilia',
    challenge: 'wordBuild',
    intro: [
      { speaker: 'emilia', key: 'emilia.intro' },
      { speaker: 'emilia', key: 'emilia.problem' },
      { speaker: 'grace', key: 'grace.accept' },
      { speaker: 'emilia', key: 'emilia.challenge' },
    ],
    done: [{ speaker: 'emilia', key: 'emilia.done' }],
  },
  {
    id: 'p1-word-match',
    npc: 'visconde',
    challenge: 'wordMatch',
    intro: [
      { speaker: 'visconde', key: 'visconde.intro' },
      { speaker: 'visconde', key: 'visconde.challenge' },
    ],
    done: [{ speaker: 'visconde', key: 'visconde.done' }],
  },
  {
    id: 'p1-fill-sentence',
    npc: 'benta',
    challenge: 'fillSentence',
    intro: [
      { speaker: 'benta', key: 'benta.intro' },
      { speaker: 'benta', key: 'benta.challenge' },
    ],
    done: [{ speaker: 'benta', key: 'benta.done' }],
  },
  {
    id: 'p1-clue-hunt',
    npc: 'saci',
    challenge: 'clueHunt',
    intro: [
      { speaker: 'saci', key: 'saci.intro' },
      { speaker: 'saci', key: 'saci.huntStart' },
    ],
    done: [{ speaker: 'saci', key: 'saci.found' }],
  },
  {
    id: 'p1-comprehension',
    npc: 'benta',
    challenge: 'comprehension',
    intro: [{ speaker: 'benta', key: 'benta.legendIntro' }],
    done: [{ speaker: 'benta', key: 'benta.legendDone' }],
  },
];

export function nextStep(steps: readonly PhaseStep[], completed: readonly string[]): PhaseStep | null {
  return steps.find((step) => !completed.includes(step.id)) ?? null;
}

export function isPhaseComplete(steps: readonly PhaseStep[], completed: readonly string[]): boolean {
  return nextStep(steps, completed) === null;
}
```

`src/core/navigation.ts`:
```ts
import { isPhaseComplete, PHASE1_STEPS } from './phaseFlow';
import type { Progress } from './progress';

export type SceneKey = 'LanguageScene' | 'IntroScene' | 'MapScene' | 'PhaseCompleteScene';

export function firstSceneFor(progress: Progress): SceneKey {
  if (progress.locale === null) return 'LanguageScene';
  if (progress.companionName === null) return 'IntroScene';
  if (isPhaseComplete(PHASE1_STEPS, progress.completed)) return 'PhaseCompleteScene';
  return 'MapScene';
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run && npx tsc --noEmit && npx eslint .`
Expected: PASS; sem erros de tipo nem de lint.

- [ ] **Step 6: Commit**

```bash
git add src/core tests/unit
git commit -m "feat: caça ao Saci, leitura da lenda e sequência da fase 1"
```

---

### Task 10: Carregamento, idioma, abertura e diálogos

**Files:**
- Create: `src/game/context.ts`, `src/game/ui.ts`, `src/game/testState.ts`, `src/game/testHook.ts`, `src/game/overlays.ts`, `src/scenes/LanguageScene.ts`, `src/scenes/IntroScene.ts`, `src/scenes/DialogueScene.ts`, `tests/e2e/helpers.ts`, `tests/e2e/intro.spec.ts`, `docs/adrs/ADR-004-fonte-pixelify-sans.md`
- Modify: `src/main.ts`, `src/scenes/BootScene.ts`, `docs/superpowers/specs/2026-09-12-princess-grace-sitio-design.md` (seção "Texto e som")

**Interfaces:**
- Consumes: `createProgressStore`, `newProgress`, `Progress` (task 5); `createI18n`, `I18n` (task 6); `DICTIONARIES`, `translate` (task 6); `createRng`, `Rng` (task 5); `formatCompanionName`, `MAX_NAME_LENGTH` (task 5); `firstSceneFor` (task 9); `SpeakerId` (task 9)
- Produces:
  - `interface GameContext { i18n: I18n; store: ProgressStore; progress: Progress; rng: Rng; save(): void; setLocale(locale: Locale): void; resetProgress(): void }`, `createContext(): GameContext`, `ctx(scene: Phaser.Scene): GameContext`
  - `FONT_FAMILY`, `COLORS`, `FILLS`, `addText(scene, x, y, text, options?): Phaser.GameObjects.Text`, `interface ButtonOptions { id; x; y; width; height; label; size?; fill?; onPress }`, `addButton(scene, options): Phaser.GameObjects.Container`, `setButtonEnabled(button, enabled)`, `setButtonFill(button, color)`
  - `testState: { answerPlan: string[]; dialogueText: string | null; interact: ((npc: string) => void) | null }`
  - `TEST_MODE: boolean`, `registerTappable(id: string, obj: Tappable): void`, `installTestHook(game: Phaser.Game): void`, `window.__GAME_TEST__` com `activeScenes()`, `button(id)`, `focus(id)`, `answerPlan()`, `interact(npc)`, `progress()`, `dialogueText()`
  - `interface DialogueLine { speaker: SpeakerId; text: string }`, `showDialogue(scene, lines): Promise<void>`, `runChallenge(scene, data: { challengeId: string }): Promise<void>`
  - Cenas registradas: `BootScene`, `LanguageScene`, `IntroScene`, `DialogueScene`
  - IDs de botão: `boot-retry`, `lang-pt`, `lang-en`, `kb-A` a `kb-Z`, `name-suggestion-0` a `name-suggestion-2`, `name-erase`, `name-confirm`, `dlg-next`

- [ ] **Step 1: Registrar a fonte em ADR e atualizar o spec**

`docs/adrs/ADR-004-fonte-pixelify-sans.md`:
```markdown
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
```

No spec, substituir a linha "Fonte bitmap com suporte a acentos e cedilha (á, â, ã, é, ê, í, ó, ô, õ, ú, ç)" por:
```markdown
- Fonte Pixelify Sans, com suporte a acentos e cedilha (á, â, ã, é, ê, í, ó, ô, õ, ú, ç), conforme ADR-004
```

- [ ] **Step 2: Criar contexto, estado de teste e gancho de teste**

`src/game/context.ts`:
```ts
import type Phaser from 'phaser';
import { createI18n, type I18n } from '../core/i18n';
import type { Locale } from '../core/locale';
import { createProgressStore, newProgress, type Progress, type ProgressStore, type StorageLike } from '../core/progress';
import { createRng, type Rng } from '../core/rng';
import { DICTIONARIES } from '../core/strings';

export interface GameContext {
  i18n: I18n;
  store: ProgressStore;
  progress: Progress;
  rng: Rng;
  save(): void;
  setLocale(locale: Locale): void;
  resetProgress(): void;
}

function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createContext(): GameContext {
  const store = createProgressStore(browserStorage());
  const seed = Number(new URLSearchParams(window.location.search).get('seed') ?? Date.now());
  const context: GameContext = {
    store,
    progress: store.load(),
    i18n: createI18n(DICTIONARIES, 'pt'),
    rng: createRng(Number.isFinite(seed) ? seed : Date.now()),
    save() {
      store.save(context.progress);
    },
    setLocale(locale) {
      context.i18n.setLocale(locale);
      context.progress.locale = locale;
      context.save();
    },
    resetProgress() {
      context.progress = newProgress();
      context.save();
    },
  };
  if (context.progress.locale !== null) context.i18n.setLocale(context.progress.locale);
  return context;
}

export function ctx(scene: Phaser.Scene): GameContext {
  return scene.registry.get('ctx') as GameContext;
}
```

`src/game/testState.ts`:
```ts
export const testState: {
  answerPlan: string[];
  dialogueText: string | null;
  interact: ((npc: string) => void) | null;
} = { answerPlan: [], dialogueText: null, interact: null };
```

`src/game/testHook.ts`:
```ts
import type Phaser from 'phaser';
import type { Progress } from '../core/progress';
import { ctx } from './context';
import { testState } from './testState';

export type Tappable = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.GetBounds;

export interface GameTestApi {
  activeScenes(): string[];
  button(id: string): { x: number; y: number } | null;
  focus(id: string): void;
  answerPlan(): string[];
  interact(npc: string): void;
  progress(): Progress;
  dialogueText(): string | null;
}

declare global {
  interface Window {
    __GAME_TEST__?: GameTestApi;
  }
}

export const TEST_MODE = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e');

const registry = new Map<string, Tappable>();

export function registerTappable(id: string, obj: Tappable): void {
  if (!TEST_MODE) return;
  registry.set(id, obj);
  obj.once('destroy', () => {
    if (registry.get(id) === obj) registry.delete(id);
  });
}

export function installTestHook(game: Phaser.Game): void {
  if (!TEST_MODE) return;

  const toPage = (obj: Tappable) => {
    const bounds = obj.getBounds();
    const camera = obj.scene.cameras.main;
    const scrollFactor = (obj as unknown as { scrollFactorX?: number }).scrollFactorX ?? 1;
    const rect = game.canvas.getBoundingClientRect();
    const scale = rect.width / game.scale.width;
    return {
      x: rect.left + (bounds.centerX - camera.scrollX * scrollFactor) * scale,
      y: rect.top + (bounds.centerY - camera.scrollY * scrollFactor) * scale,
    };
  };

  window.__GAME_TEST__ = {
    activeScenes: () => game.scene.getScenes(true).map((scene) => scene.scene.key),
    button: (id) => {
      const obj = registry.get(id);
      if (!obj || !obj.active || !obj.input?.enabled || !obj.scene?.sys.isActive()) return null;
      return toPage(obj);
    },
    focus: (id) => {
      const obj = registry.get(id);
      if (!obj) return;
      const bounds = obj.getBounds();
      obj.scene.cameras.main.stopFollow();
      obj.scene.cameras.main.centerOn(bounds.centerX, bounds.centerY);
    },
    answerPlan: () => [...testState.answerPlan],
    interact: (npc) => testState.interact?.(npc),
    progress: () => structuredClone(ctx(game.scene.getScene('BootScene')).progress),
    dialogueText: () => testState.dialogueText,
  };
}
```

- [ ] **Step 3: Criar os componentes de interface e os overlays**

`src/game/ui.ts`:
```ts
import Phaser from 'phaser';
import { registerTappable } from './testHook';

export const FONT_FAMILY = '"Pixelify Sans", sans-serif';

export const COLORS = {
  ink: '#1a1423',
  paper: '#fff8f0',
  pinkDark: '#d9679a',
  lilac: '#c7a6e8',
} as const;

export const FILLS = {
  ink: 0x1a1423,
  paper: 0xfff8f0,
  pink: 0xf7a8c8,
  pinkDark: 0xd9679a,
  pinkLight: 0xffd6e6,
  lilac: 0xc7a6e8,
  grey: 0xc8c8d4,
  green: 0xa6d86b,
  blue: 0x8fd3f4,
  yellow: 0xf7d74a,
  orange: 0xf39c3c,
} as const;

export interface TextOptions {
  size?: number;
  color?: string;
  width?: number;
  align?: 'left' | 'center';
}

export function addText(scene: Phaser.Scene, x: number, y: number, text: string, options: TextOptions = {}): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    fontFamily: FONT_FAMILY,
    fontSize: `${options.size ?? 11}px`,
    color: options.color ?? COLORS.ink,
    align: options.align ?? 'left',
    wordWrap: options.width ? { width: options.width, useAdvancedWrap: true } : undefined,
  });
}

export interface ButtonOptions {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  size?: number;
  fill?: number;
  onPress: () => void;
}

export function addButton(scene: Phaser.Scene, options: ButtonOptions): Phaser.GameObjects.Container {
  const background = scene.add.rectangle(0, 0, options.width, options.height, options.fill ?? FILLS.pink).setStrokeStyle(1, FILLS.ink);
  const label = addText(scene, 0, 0, options.label, { size: options.size ?? 11, align: 'center', width: options.width - 4 }).setOrigin(0.5);
  const button = scene.add.container(options.x, options.y, [background, label]).setSize(options.width, options.height);
  button.setInteractive({ useHandCursor: true });
  button.on('pointerup', () => options.onPress());
  registerTappable(options.id, button);
  return button;
}

export function setButtonEnabled(button: Phaser.GameObjects.Container, enabled: boolean): void {
  button.setAlpha(enabled ? 1 : 0.35);
  if (enabled) button.setInteractive({ useHandCursor: true });
  else button.disableInteractive();
}

export function setButtonFill(button: Phaser.GameObjects.Container, color: number): void {
  (button.list[0] as Phaser.GameObjects.Rectangle).setFillStyle(color);
}
```

`src/game/overlays.ts`:
```ts
import type Phaser from 'phaser';
import type { SpeakerId } from '../core/phaseFlow';

export interface DialogueLine {
  speaker: SpeakerId;
  text: string;
}

export function showDialogue(scene: Phaser.Scene, lines: DialogueLine[]): Promise<void> {
  return new Promise((resolve) => {
    scene.game.events.once('dialogue-done', () => resolve());
    scene.scene.launch('DialogueScene', { lines });
    scene.scene.bringToTop('DialogueScene');
  });
}

export function runChallenge(scene: Phaser.Scene, data: { challengeId: string }): Promise<void> {
  return new Promise((resolve) => {
    scene.game.events.once('challenge-complete', () => resolve());
    scene.scene.launch('ChallengeScene', data);
    scene.scene.bringToTop('ChallengeScene');
  });
}
```

- [ ] **Step 4: Criar a cena de diálogo**

`src/scenes/DialogueScene.ts`:
```ts
import Phaser from 'phaser';
import type { SpeakerId } from '../core/phaseFlow';
import { ctx, type GameContext } from '../game/context';
import type { DialogueLine } from '../game/overlays';
import { registerTappable } from '../game/testHook';
import { testState } from '../game/testState';
import { addText, COLORS, FILLS } from '../game/ui';

function speakerName(context: GameContext, speaker: SpeakerId): string {
  if (speaker === 'narrator') return '';
  if (speaker === 'companion') return context.progress.companionName ?? '';
  return context.i18n.t(`npc.${speaker}`);
}

export class DialogueScene extends Phaser.Scene {
  private lines: DialogueLine[] = [];
  private index = 0;
  private portrait!: Phaser.GameObjects.Image;
  private nameText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;

  constructor() {
    super('DialogueScene');
  }

  create(data: { lines: DialogueLine[] }): void {
    this.lines = data.lines;
    this.index = 0;

    this.add.rectangle(160, 146, 312, 60, FILLS.paper).setStrokeStyle(2, FILLS.ink);
    this.portrait = this.add.image(4, 176, '__DEFAULT').setOrigin(0, 1).setVisible(false);
    this.nameText = addText(this, 12, 120, '', { size: 10, color: COLORS.pinkDark });
    this.bodyText = addText(this, 12, 133, '', { size: 10 });
    addText(this, 306, 166, '▼', { size: 8, color: COLORS.pinkDark }).setOrigin(1, 0.5);

    const zone = this.add.zone(160, 90, 320, 180).setInteractive();
    zone.on('pointerup', () => this.advance());
    registerTappable('dlg-next', zone);

    this.show();
  }

  private show(): void {
    const line = this.lines[this.index];
    if (!line) return;
    const context = ctx(this);
    const portraitKey = `sprite-${line.speaker}-portrait`;
    const hasPortrait = this.textures.exists(portraitKey);
    this.portrait.setVisible(hasPortrait);
    if (hasPortrait) this.portrait.setTexture(portraitKey, 0);

    const textX = hasPortrait ? 104 : 12;
    const width = hasPortrait ? 206 : 296;
    this.nameText.setPosition(textX, 120).setText(speakerName(context, line.speaker));
    this.bodyText.setPosition(textX, 133).setWordWrapWidth(width, true).setText(line.text);
    testState.dialogueText = line.text;
  }

  private advance(): void {
    this.index += 1;
    if (this.index < this.lines.length) {
      this.show();
      return;
    }
    testState.dialogueText = null;
    this.scene.stop();
    this.game.events.emit('dialogue-done');
  }
}
```

- [ ] **Step 5: Criar as cenas de carregamento, idioma e abertura**

`src/scenes/BootScene.ts` (substitui a versão da task 1):
```ts
import Phaser from 'phaser';
import { firstSceneFor } from '../core/navigation';
import { createContext, ctx } from '../game/context';
import { addButton, addText, COLORS, FONT_FAMILY } from '../game/ui';

const BASE = import.meta.env.BASE_URL;

interface Manifest {
  sprites: Record<string, { file: string; frameWidth: number; frameHeight: number; frames: number }>;
}

export class BootScene extends Phaser.Scene {
  private failed = false;

  constructor() {
    super('BootScene');
  }

  init(): void {
    if (!this.registry.has('ctx')) this.registry.set('ctx', createContext());
  }

  preload(): void {
    this.load.on('loaderror', () => {
      this.failed = true;
    });
    this.load.json('manifest', `${BASE}assets/generated/manifest.json`);
  }

  async create(): Promise<void> {
    await document.fonts.load(`11px ${FONT_FAMILY}`, 'AaÇçãéô').catch(() => undefined);
    if (this.failed) {
      this.showError();
      return;
    }

    const manifest = this.cache.json.get('manifest') as Manifest;
    for (const [name, sprite] of Object.entries(manifest.sprites)) {
      this.load.spritesheet(`sprite-${name}`, `${BASE}assets/generated/${sprite.file}`, {
        frameWidth: sprite.frameWidth,
        frameHeight: sprite.frameHeight,
      });
    }
    this.load.tilemapTiledJSON('map-pomar', `${BASE}assets/generated/maps/pomar.json`);
    this.load.once('complete', () => {
      if (this.failed) this.showError();
      else this.scene.start(firstSceneFor(ctx(this).progress));
    });
    this.load.start();
  }

  private showError(): void {
    const context = ctx(this);
    addText(this, 160, 70, context.i18n.t('boot.loadError'), { size: 12, color: COLORS.paper, align: 'center' }).setOrigin(0.5);
    addButton(this, { id: 'boot-retry', x: 160, y: 110, width: 120, height: 24, label: context.i18n.t('boot.retry'), onPress: () => window.location.reload() });
  }
}
```

`src/scenes/LanguageScene.ts`:
```ts
import Phaser from 'phaser';
import type { Locale } from '../core/locale';
import { translate } from '../core/strings';
import { ctx } from '../game/context';
import { addButton, addText, COLORS, FILLS } from '../game/ui';

export class LanguageScene extends Phaser.Scene {
  constructor() {
    super('LanguageScene');
  }

  create(data: { returnTo?: string } = {}): void {
    this.cameras.main.setBackgroundColor('#4a1f5c');
    const title = `${translate('pt', 'language.title')}\n${translate('en', 'language.title')}`;
    addText(this, 160, 50, title, { size: 14, color: COLORS.paper, align: 'center' }).setOrigin(0.5);

    const choose = (locale: Locale) => {
      const context = ctx(this);
      context.setLocale(locale);
      if (data.returnTo) this.scene.start(data.returnTo);
      else this.scene.start(context.progress.companionName === null ? 'IntroScene' : 'MapScene');
    };

    addButton(this, { id: 'lang-pt', x: 100, y: 115, width: 110, height: 30, size: 13, label: translate('pt', 'language.option.pt'), fill: FILLS.pink, onPress: () => choose('pt') });
    addButton(this, { id: 'lang-en', x: 220, y: 115, width: 110, height: 30, size: 13, label: translate('en', 'language.option.en'), fill: FILLS.lilac, onPress: () => choose('en') });
  }
}
```

`src/scenes/IntroScene.ts`:
```ts
import Phaser from 'phaser';
import { formatCompanionName, MAX_NAME_LENGTH } from '../core/names';
import { ctx } from '../game/context';
import { showDialogue } from '../game/overlays';
import { addButton, addText, COLORS, FILLS, setButtonEnabled } from '../game/ui';

const LETTERS = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

export class IntroScene extends Phaser.Scene {
  private name = '';
  private nameText!: Phaser.GameObjects.Text;
  private confirmButton!: Phaser.GameObjects.Container;

  constructor() {
    super('IntroScene');
  }

  async create(): Promise<void> {
    this.name = '';
    const context = ctx(this);
    this.cameras.main.setBackgroundColor('#4a1f5c');
    await showDialogue(
      this,
      ['intro.1', 'intro.2', 'intro.3', 'intro.4'].map((key) => ({ speaker: 'narrator' as const, text: context.i18n.t(key) })),
    );
    this.buildNameEntry();
  }

  private buildNameEntry(): void {
    const { i18n } = ctx(this);
    addText(this, 160, 8, i18n.t('intro.nameQuestion'), { size: 10, width: 290, align: 'center', color: COLORS.paper }).setOrigin(0.5, 0);
    this.add.rectangle(160, 52, 160, 22, FILLS.paper).setStrokeStyle(1, FILLS.pinkDark);
    this.nameText = addText(this, 160, 52, '', { size: 13, align: 'center' }).setOrigin(0.5);

    LETTERS.forEach((letter, i) => {
      addButton(this, { id: `kb-${letter}`, x: 22 + (i % 13) * 23, y: 82 + Math.floor(i / 13) * 25, width: 21, height: 22, label: letter, onPress: () => this.type(letter) });
    });

    [1, 2, 3].forEach((n, i) => {
      const suggestion = i18n.t(`intro.suggestion.${n}`);
      addButton(this, {
        id: `name-suggestion-${i}`, x: 60 + i * 100, y: 136, width: 90, height: 22, label: suggestion, fill: FILLS.lilac,
        onPress: () => {
          this.name = suggestion;
          this.refresh();
        },
      });
    });

    addButton(this, {
      id: 'name-erase', x: 90, y: 164, width: 90, height: 22, label: i18n.t('common.erase'), fill: FILLS.grey,
      onPress: () => {
        this.name = Array.from(this.name).slice(0, -1).join('');
        this.refresh();
      },
    });
    this.confirmButton = addButton(this, { id: 'name-confirm', x: 230, y: 164, width: 90, height: 22, label: i18n.t('common.confirm'), onPress: () => this.finish() });
    this.refresh();
  }

  private type(letter: string): void {
    if (Array.from(this.name).length >= MAX_NAME_LENGTH) return;
    this.name += letter;
    this.refresh();
  }

  private refresh(): void {
    this.nameText.setText(formatCompanionName(this.name));
    setButtonEnabled(this.confirmButton, formatCompanionName(this.name) !== '');
  }

  private finish(): void {
    const name = formatCompanionName(this.name);
    if (name === '') return;
    const context = ctx(this);
    context.progress.companionName = name;
    context.save();
    this.scene.start('MapScene');
  }
}
```

- [ ] **Step 6: Atualizar `src/main.ts`**

```ts
import '@fontsource/pixelify-sans/400.css';
import Phaser from 'phaser';
import './style.css';
import { BASE_HEIGHT, BASE_WIDTH, integerZoom } from './core/scale';
import { installTestHook } from './game/testHook';
import { BootScene } from './scenes/BootScene';
import { DialogueScene } from './scenes/DialogueScene';
import { IntroScene } from './scenes/IntroScene';
import { LanguageScene } from './scenes/LanguageScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  pixelArt: true,
  backgroundColor: '#1a1423',
  scale: { mode: Phaser.Scale.NONE, zoom: integerZoom(window.innerWidth, window.innerHeight) },
  input: { activePointers: 2 },
  scene: [BootScene, LanguageScene, IntroScene, DialogueScene],
});

installTestHook(game);

window.addEventListener('resize', () => {
  game.scale.setZoom(integerZoom(window.innerWidth, window.innerHeight));
});
```

- [ ] **Step 7: Escrever os auxiliares e o teste de navegador**

`tests/e2e/helpers.ts`:
```ts
import { expect, type Page } from '@playwright/test';

export async function startGame(page: Page, seed = 42): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(`./?e2e=1&seed=${seed}`);
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__ !== undefined)).toBe(true);
  return errors;
}

export async function tap(page: Page, id: string): Promise<void> {
  let point: { x: number; y: number } | null = null;
  await expect
    .poll(
      async () => {
        point = await page.evaluate((buttonId) => window.__GAME_TEST__!.button(buttonId), id);
        return point;
      },
      { message: `botão ${id}`, timeout: 15_000 },
    )
    .not.toBeNull();
  const { x, y } = point as unknown as { x: number; y: number };
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(80);
}

export async function dialogueText(page: Page): Promise<string | null> {
  return page.evaluate(() => window.__GAME_TEST__!.dialogueText());
}

export async function finishDialogue(page: Page): Promise<void> {
  await expect.poll(() => dialogueText(page), { message: 'diálogo aberto', timeout: 15_000 }).not.toBeNull();
  while ((await dialogueText(page)) !== null) await tap(page, 'dlg-next');
}

export async function activeScenes(page: Page): Promise<string[]> {
  return page.evaluate(() => window.__GAME_TEST__!.activeScenes());
}
```

`tests/e2e/intro.spec.ts`:
```ts
import { expect, test } from '@playwright/test';
import { finishDialogue, startGame, tap } from './helpers';

test('escolhe idioma, lê a abertura e dá nome à coelha', async ({ page }) => {
  await startGame(page);
  await tap(page, 'lang-en');
  await finishDialogue(page);
  for (const letter of ['M', 'E', 'L']) await tap(page, `kb-${letter}`);
  await tap(page, 'name-erase');
  await tap(page, 'kb-L');
  await tap(page, 'name-confirm');

  await expect
    .poll(() => page.evaluate(() => window.__GAME_TEST__!.progress().companionName))
    .toBe('Mel');
  const progress = await page.evaluate(() => window.__GAME_TEST__!.progress());
  expect(progress.locale).toBe('en');
});

test('botão confirmar fica desabilitado sem nome', async ({ page }) => {
  await startGame(page);
  await tap(page, 'lang-pt');
  await finishDialogue(page);
  await tap(page, 'kb-A');
  await tap(page, 'name-erase');
  expect(await page.evaluate(() => window.__GAME_TEST__!.button('name-confirm'))).toBeNull();
});
```

Até a task 11 registrar `MapScene`, o Phaser apenas avisa no console que a cena não existe; por isso este teste não verifica erros de console.

- [ ] **Step 8: Rodar tudo**

Run: `npx vitest run && npx eslint . && npx playwright test tests/e2e/intro.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS nos dois projetos de celular.

- [ ] **Step 9: Commit**

```bash
git add src tests/e2e docs
git commit -m "feat: carregamento, escolha de idioma, abertura e diálogos com retrato"
```

---

### Task 11: Mapa do Sítio, caça ao Saci, menu e fase concluída

**Files:**
- Create: `src/game/placeholders.ts`, `src/scenes/MapScene.ts`, `src/scenes/MenuScene.ts`, `src/scenes/PhaseCompleteScene.ts`, `tests/e2e/map.spec.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: `findPath`, `pathToNeighbor`, `neighbors`, `Point` (task 7); `PHASE1_STEPS`, `nextStep`, `isPhaseComplete`, `NpcId` (task 9); `clueHunt` (task 9); `recordAttempt` (task 5); `ctx`, `addButton`, `addText`, `showDialogue`, `runChallenge`, `testState` (task 10)
- Produces:
  - `PLACEHOLDERS`, `textureFor(scene: Phaser.Scene, id: string): string`: devolve `sprite-<id>` se existir, senão gera e devolve `placeholder-<id>`
  - Cenas `MapScene`, `MenuScene`, `PhaseCompleteScene`
  - IDs de botão: `menu`, `menu-language`, `menu-restart`, `menu-close`, `hideout-<id>`, `complete-restart`
  - Eventos no `game.events`: `menu-closed`
  - `testState.interact` preenchido pela `MapScene`; `testState.answerPlan` igual a `['hideout-<alvo>']` durante a caça

- [ ] **Step 1: Criar os placeholders**

`src/game/placeholders.ts`:
```ts
import type Phaser from 'phaser';

interface PlaceholderSpec {
  color: number;
  width: number;
  height: number;
}

export const PLACEHOLDERS: Readonly<Record<string, PlaceholderSpec>> = {
  grace: { color: 0xf7a8c8, width: 16, height: 24 },
  companion: { color: 0xc9905a, width: 12, height: 12 },
  emilia: { color: 0xf39c3c, width: 16, height: 24 },
  visconde: { color: 0xf7d74a, width: 16, height: 24 },
  benta: { color: 0xc7a6e8, width: 16, height: 24 },
  saci: { color: 0xd8343f, width: 16, height: 24 },
};

export function textureFor(scene: Phaser.Scene, id: string): string {
  const spriteKey = `sprite-${id}`;
  if (scene.textures.exists(spriteKey)) return spriteKey;
  const key = `placeholder-${id}`;
  if (scene.textures.exists(key)) return key;
  const spec = PLACEHOLDERS[id];
  if (!spec) throw new Error(`sem placeholder para ${id}`);
  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0x1a1423).fillRect(0, 0, spec.width, spec.height);
  graphics.fillStyle(spec.color).fillRect(1, 1, spec.width - 2, spec.height - 2);
  graphics.generateTexture(key, spec.width, spec.height);
  graphics.destroy();
  return key;
}
```

- [ ] **Step 2: Criar a cena do mapa**

`src/scenes/MapScene.ts`:
```ts
import Phaser from 'phaser';
import { clueHunt } from '../core/challenges/clueHunt';
import { recordAttempt } from '../core/difficulty';
import { findPath, neighbors, pathToNeighbor, type Point } from '../core/pathfinding';
import { isPhaseComplete, nextStep, PHASE1_STEPS, type NpcId } from '../core/phaseFlow';
import { ctx } from '../game/context';
import { runChallenge, showDialogue, type DialogueLine } from '../game/overlays';
import { textureFor } from '../game/placeholders';
import { testState } from '../game/testState';
import { addButton, addText, COLORS, FILLS } from '../game/ui';

const TILE = 16;
const STEP_MS = 140;

export class MapScene extends Phaser.Scene {
  private grid: boolean[][] = [];
  private grace!: Phaser.GameObjects.Image;
  private companion!: Phaser.GameObjects.Image;
  private graceTile: Point = { x: 1, y: 1 };
  private npcs = new Map<NpcId, Point>();
  private hideouts = new Map<string, Point>();
  private busy = false;
  private hunting = false;
  private walkToken = 0;

  constructor() {
    super('MapScene');
  }

  create(): void {
    const context = ctx(this);
    this.busy = false;
    this.hunting = false;
    this.npcs.clear();
    this.hideouts.clear();

    const map = this.make.tilemap({ key: 'map-pomar' });
    const tiles = map.addTilesetImage('pomar', 'sprite-pomar');
    if (!tiles) throw new Error('tileset pomar não encontrado');
    const ground = map.createLayer('ground', tiles, 0, 0);
    if (!ground) throw new Error('camada ground não encontrada');

    this.grid = Array.from({ length: map.height }, (_, y) =>
      Array.from({ length: map.width }, (_, x) => {
        const properties = ground.getTileAt(x, y)?.properties as { blocked?: boolean } | undefined;
        return properties?.blocked === true;
      }),
    );

    for (const obj of map.getObjectLayer('objects')?.objects ?? []) {
      const tile = { x: Math.floor((obj.x ?? 0) / TILE), y: Math.floor((obj.y ?? 0) / TILE) };
      if (obj.type === 'spawn') this.graceTile = tile;
      else if (obj.type === 'npc') this.addNpc(obj.name as NpcId, tile);
      else if (obj.type === 'hideout') this.hideouts.set(obj.name, tile);
    }

    this.companion = this.add.image(0, 0, textureFor(this, 'companion')).setOrigin(0.5, 1).setDepth(9);
    this.grace = this.add.image(0, 0, textureFor(this, 'grace')).setOrigin(0.5, 1).setDepth(10);
    this.placeAt(this.grace, this.graceTile);
    this.placeAt(this.companion, { x: this.graceTile.x - 1, y: this.graceTile.y });

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels).startFollow(this.grace, true).setRoundPixels(true);

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (this.busy || over.length > 0) return;
      this.walkTo({ x: Math.floor(pointer.worldX / TILE), y: Math.floor(pointer.worldY / TILE) });
    });

    addText(this, 6, 4, context.i18n.t('phase1.title'), { size: 9, color: COLORS.paper }).setScrollFactor(0).setDepth(100);
    addButton(this, { id: 'menu', x: 294, y: 14, width: 44, height: 22, size: 10, label: context.i18n.t('menu.title'), onPress: () => this.openMenu() })
      .setScrollFactor(0)
      .setDepth(100);

    testState.interact = (npc) => this.teleportAndInteract(npc as NpcId);
    this.events.once('shutdown', () => {
      testState.interact = null;
    });

    if (context.progress.completed.length === 0) {
      void this.say([{ speaker: 'companion', text: context.i18n.t('companion.greeting', { companion: context.progress.companionName ?? '' }) }]);
    }
  }

  private addNpc(id: NpcId, tile: Point): void {
    const sprite = this.add.image(0, 0, textureFor(this, id)).setOrigin(0.5, 1).setDepth(8).setInteractive({ useHandCursor: true });
    this.placeAt(sprite, tile);
    addText(this, tile.x * TILE + TILE / 2, tile.y * TILE - 9, ctx(this).i18n.t(`npc.${id}`), { size: 8, color: COLORS.paper, align: 'center' })
      .setOrigin(0.5, 1)
      .setDepth(8);
    sprite.on('pointerup', () => {
      if (!this.busy) void this.approachAndInteract(id);
    });
    this.npcs.set(id, tile);
    const row = this.grid[tile.y];
    if (row) row[tile.x] = true;
  }

  private placeAt(obj: Phaser.GameObjects.Image, tile: Point): void {
    obj.setPosition(tile.x * TILE + TILE / 2, tile.y * TILE + TILE);
  }

  private tweenTo(obj: Phaser.GameObjects.Image, tile: Point): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({ targets: obj, x: tile.x * TILE + TILE / 2, y: tile.y * TILE + TILE, duration: STEP_MS, onComplete: () => resolve() });
    });
  }

  private async walkAlong(path: Point[]): Promise<void> {
    const token = ++this.walkToken;
    for (const next of path) {
      if (token !== this.walkToken) return;
      const previous = this.graceTile;
      this.graceTile = next;
      await Promise.all([this.tweenTo(this.grace, next), this.tweenTo(this.companion, previous)]);
    }
  }

  private walkTo(target: Point): void {
    const path = findPath(this.grid, this.graceTile, target);
    if (path.length > 0) void this.walkAlong(path);
  }

  private async say(lines: DialogueLine[]): Promise<void> {
    const wasBusy = this.busy;
    this.busy = true;
    await showDialogue(this, lines);
    this.busy = wasBusy;
  }

  private async approachAndInteract(id: NpcId): Promise<void> {
    const target = this.npcs.get(id);
    if (!target || this.hunting) return;
    const path = pathToNeighbor(this.grid, this.graceTile, target);
    if (path === null) return;
    this.busy = true;
    await this.walkAlong(path);
    this.busy = false;
    await this.interact(id);
  }

  private teleportAndInteract(id: NpcId): void {
    const target = this.npcs.get(id);
    if (!target) return;
    const free = neighbors(target).find((p) => this.grid[p.y]?.[p.x] === false);
    if (free) {
      this.walkToken += 1;
      this.graceTile = free;
      this.placeAt(this.grace, free);
    }
    void this.interact(id);
  }

  private async interact(id: NpcId): Promise<void> {
    if (this.busy || this.hunting) return;
    this.busy = true;
    try {
      const context = ctx(this);
      const step = nextStep(PHASE1_STEPS, context.progress.completed);
      if (!step) return;
      if (step.npc !== id) {
        await this.say([{ speaker: id, text: context.i18n.t('npc.waiting', { npc: context.i18n.t(`npc.${step.npc}`) }) }]);
        return;
      }
      await this.say(step.intro.map((line) => ({ speaker: line.speaker, text: context.i18n.t(line.key) })));
      if (step.challenge === 'clueHunt') await this.runHunt();
      else await runChallenge(this, { challengeId: step.challenge });
      await this.say(step.done.map((line) => ({ speaker: line.speaker, text: context.i18n.t(line.key) })));
      context.progress.completed.push(step.id);
      context.save();
      if (isPhaseComplete(PHASE1_STEPS, context.progress.completed)) this.scene.start('PhaseCompleteScene');
    } finally {
      this.busy = false;
    }
  }

  private runHunt(): Promise<void> {
    const context = ctx(this);
    const question = clueHunt.generate(context.progress.difficulty.level, context.rng, context.i18n.locale);
    this.hunting = true;
    this.busy = false;

    const panel = this.add.container(0, 0).setScrollFactor(0).setDepth(90);
    panel.add(this.add.rectangle(160, 44, 304, 40, FILLS.paper).setStrokeStyle(1, FILLS.ink));
    panel.add(addText(this, 12, 26, question.clues.map((clue, i) => `${i + 1}. ${clue}`).join('\n'), { size: 9, width: 296 }));
    testState.answerPlan = [`hideout-${question.targetId}`];

    return new Promise((resolve) => {
      let usedHint = false;
      let answering = false;
      const markers: Phaser.GameObjects.Container[] = [];

      const pick = async (id: string) => {
        if (answering) return;
        answering = true;
        const correct = clueHunt.check(question, id);
        context.progress.difficulty = recordAttempt(context.progress.difficulty, { correct, usedHint });
        context.save();
        if (correct) {
          markers.forEach((marker) => marker.destroy());
          panel.destroy();
          testState.answerPlan = [];
          this.hunting = false;
          this.busy = true;
          this.cameras.main.startFollow(this.grace, true);
          resolve();
          return;
        }
        usedHint = true;
        await this.say([
          { speaker: 'saci', text: context.i18n.t('saci.wrong') },
          { speaker: 'companion', text: `${context.i18n.t('challenge.hintBy', { companion: context.progress.companionName ?? '' })} ${clueHunt.hint(question, context.i18n.locale)}` },
        ]);
        answering = false;
      };

      for (const id of question.candidates) {
        const tile = this.hideouts.get(id);
        if (!tile) throw new Error(`esconderijo ${id} não está no mapa`);
        const marker = addButton(this, {
          id: `hideout-${id}`, x: tile.x * TILE + TILE / 2, y: tile.y * TILE + TILE / 2, width: 60, height: 22, size: 8,
          label: context.i18n.t(`hideout.${id}`), fill: FILLS.lilac, onPress: () => void pick(id),
        }).setDepth(50);
        markers.push(marker);
      }
    });
  }

  private openMenu(): void {
    if (this.busy) return;
    this.busy = true;
    this.game.events.once('menu-closed', () => {
      this.busy = false;
    });
    this.scene.launch('MenuScene');
    this.scene.bringToTop('MenuScene');
  }
}
```

- [ ] **Step 3: Criar menu e fase concluída**

`src/scenes/MenuScene.ts`:
```ts
import Phaser from 'phaser';
import { ctx } from '../game/context';
import { addButton, addText, COLORS, FILLS } from '../game/ui';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const context = ctx(this);
    this.add.rectangle(160, 90, 320, 180, FILLS.ink, 0.7).setInteractive();
    this.add.rectangle(160, 90, 200, 136, FILLS.paper).setStrokeStyle(2, FILLS.pinkDark);

    addButton(this, {
      id: 'menu-language', x: 160, y: 50, width: 160, height: 24, label: context.i18n.t('menu.language'),
      onPress: () => {
        this.scene.stop('MapScene');
        this.scene.start('LanguageScene', { returnTo: 'MapScene' });
      },
    });
    addButton(this, {
      id: 'menu-restart', x: 160, y: 82, width: 160, height: 24, label: context.i18n.t('menu.restart'), fill: FILLS.grey,
      onPress: () => {
        context.resetProgress();
        this.scene.stop('MapScene');
        this.scene.start('LanguageScene');
      },
    });
    addButton(this, {
      id: 'menu-close', x: 160, y: 114, width: 160, height: 24, label: context.i18n.t('menu.close'), fill: FILLS.lilac,
      onPress: () => {
        this.scene.stop();
        this.game.events.emit('menu-closed');
      },
    });

    if (!context.store.available) {
      addText(this, 160, 144, context.i18n.t('menu.noSave'), { size: 8, width: 180, align: 'center', color: COLORS.pinkDark }).setOrigin(0.5, 0);
    }
  }
}
```

`src/scenes/PhaseCompleteScene.ts`:
```ts
import Phaser from 'phaser';
import { ctx } from '../game/context';
import { addButton, addText, COLORS, FILLS } from '../game/ui';

export class PhaseCompleteScene extends Phaser.Scene {
  constructor() {
    super('PhaseCompleteScene');
  }

  create(): void {
    const context = ctx(this);
    this.cameras.main.setBackgroundColor('#4a1f5c');
    addText(this, 160, 50, context.i18n.t('phase1.complete'), { size: 20, color: COLORS.paper, align: 'center' }).setOrigin(0.5);
    addText(this, 160, 90, context.i18n.t('phase1.next'), { size: 11, width: 260, color: COLORS.lilac, align: 'center' }).setOrigin(0.5);
    addButton(this, {
      id: 'complete-restart', x: 160, y: 140, width: 140, height: 24, label: context.i18n.t('menu.restart'), fill: FILLS.pink,
      onPress: () => {
        context.resetProgress();
        this.scene.start('LanguageScene');
      },
    });
  }
}
```

- [ ] **Step 4: Registrar as cenas em `src/main.ts`**

Adicionar os imports e trocar a lista de cenas:
```ts
import { MapScene } from './scenes/MapScene';
import { MenuScene } from './scenes/MenuScene';
import { PhaseCompleteScene } from './scenes/PhaseCompleteScene';
```
```ts
  scene: [BootScene, LanguageScene, IntroScene, MapScene, DialogueScene, MenuScene, PhaseCompleteScene],
```

- [ ] **Step 5: Escrever o teste de navegador do mapa**

`tests/e2e/map.spec.ts`:
```ts
import { expect, test, type Page } from '@playwright/test';
import { activeScenes, dialogueText, finishDialogue, startGame, tap } from './helpers';

async function reachMap(page: Page, locale: 'pt' | 'en'): Promise<string[]> {
  const errors = await startGame(page);
  await tap(page, `lang-${locale}`);
  await finishDialogue(page);
  await tap(page, 'name-suggestion-0');
  await tap(page, 'name-confirm');
  await expect.poll(() => activeScenes(page)).toContain('MapScene');
  await finishDialogue(page);
  return errors;
}

test('personagem fora de ordem pede para falar com outro primeiro', async ({ page }) => {
  const errors = await reachMap(page, 'pt');
  await page.evaluate(() => window.__GAME_TEST__!.interact('visconde'));
  await expect.poll(() => dialogueText(page)).toBe('Agora não posso. Fale primeiro com: Emília.');
  await finishDialogue(page);
  expect(errors).toEqual([]);
});

test('menu troca o idioma e volta ao mapa', async ({ page }) => {
  await reachMap(page, 'pt');
  await tap(page, 'menu');
  await tap(page, 'menu-language');
  await tap(page, 'lang-en');
  await expect.poll(() => activeScenes(page)).toContain('MapScene');
  expect((await page.evaluate(() => window.__GAME_TEST__!.progress())).locale).toBe('en');
});

test('idioma e nome continuam depois de recarregar', async ({ page }) => {
  await reachMap(page, 'en');
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__?.activeScenes() ?? [])).toContain('MapScene');
  const progress = await page.evaluate(() => window.__GAME_TEST__!.progress());
  expect(progress.locale).toBe('en');
  expect(progress.companionName).toBe('Honey');
});
```

- [ ] **Step 6: Rodar tudo**

Run: `npx vitest run && npx eslint . && npx playwright test`
Expected: PASS em `smoke`, `intro` e `map` nos dois projetos.

- [ ] **Step 7: Commit**

```bash
git add src tests/e2e
git commit -m "feat: mapa do Sítio com caminhada por toque, caça ao Saci e menu"
```

---

### Task 12: Telas dos desafios e fase 1 jogável do começo ao fim

**Files:**
- Create: `src/scenes/challenges/types.ts`, `src/scenes/challenges/WordBuildView.ts`, `src/scenes/challenges/WordMatchView.ts`, `src/scenes/challenges/FillSentenceView.ts`, `src/scenes/challenges/ComprehensionView.ts`, `src/scenes/challenges/index.ts`, `src/scenes/ChallengeScene.ts`, `tests/e2e/phase1.spec.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: `CHALLENGES`, `ChallengeId` (task 9); questões dos desafios (tasks 8 e 9); `recordAttempt` (task 5); `ctx`, `addButton`, `addText`, `setButtonEnabled`, `setButtonFill`, `showDialogue`, `testState` (task 10)
- Produces:
  - `interface ChallengeViewApi { t(key: string, vars?: Vars): string; submit(answer: unknown): void }`
  - `interface ChallengeView<Q> { mount(scene: Phaser.Scene, question: Q, api: ChallengeViewApi): void; reset(): void; answerPlan(question: Q): string[] }`
  - `type ViewChallengeId = Exclude<ChallengeId, 'clueHunt'>`, `VIEWS: Record<ViewChallengeId, () => ChallengeView<unknown>>`
  - Cena `ChallengeScene`, que emite `challenge-complete` no `game.events` ao acertar
  - IDs de botão: `wb-tile-<i>`, `wb-erase`, `wb-confirm`, `wm-left-<i>`, `wm-right-<j>`, `fs-opt-<i>`, `cp-continue`, `cp-q<i>-opt-<j>`

- [ ] **Step 1: Criar o contrato das telas**

`src/scenes/challenges/types.ts`:
```ts
import type Phaser from 'phaser';
import type { Vars } from '../../core/i18n';

export interface ChallengeViewApi {
  t(key: string, vars?: Vars): string;
  submit(answer: unknown): void;
}

export interface ChallengeView<Q> {
  mount(scene: Phaser.Scene, question: Q, api: ChallengeViewApi): void;
  reset(): void;
  answerPlan(question: Q): string[];
}
```

- [ ] **Step 2: Criar as quatro telas**

`src/scenes/challenges/WordBuildView.ts`:
```ts
import type Phaser from 'phaser';
import type { WordBuildQuestion } from '../../core/challenges/wordBuild';
import { addButton, addText, FILLS, setButtonEnabled } from '../../game/ui';
import type { ChallengeView, ChallengeViewApi } from './types';

const MAX_COLUMNS = 10;
const CELL = 24;
const SLOT = 18;

export class WordBuildView implements ChallengeView<WordBuildQuestion> {
  private question!: WordBuildQuestion;
  private api!: ChallengeViewApi;
  private picked: number[] = [];
  private tiles: Phaser.GameObjects.Container[] = [];
  private slots: Phaser.GameObjects.Text[] = [];

  mount(scene: Phaser.Scene, question: WordBuildQuestion, api: ChallengeViewApi): void {
    this.question = question;
    this.api = api;
    addText(scene, 160, 16, api.t('challenge.wordBuild.prompt', { clue: question.clue }), { size: 11, width: 280, align: 'center' }).setOrigin(0.5, 0);

    const slotsX = 160 - (question.letters.length * SLOT) / 2 + SLOT / 2;
    this.slots = question.letters.map((_, i) => {
      scene.add.rectangle(slotsX + i * SLOT, 66, 16, 20, FILLS.pinkLight).setStrokeStyle(1, FILLS.ink);
      return addText(scene, slotsX + i * SLOT, 66, '', { size: 12, align: 'center' }).setOrigin(0.5);
    });

    const columns = Math.min(question.tiles.length, MAX_COLUMNS);
    const tilesX = 160 - (columns * CELL) / 2 + CELL / 2;
    this.tiles = question.tiles.map((letter, i) =>
      addButton(scene, { id: `wb-tile-${i}`, x: tilesX + (i % columns) * CELL, y: 100 + Math.floor(i / columns) * CELL, width: 22, height: 22, size: 12, label: letter, onPress: () => this.pick(i) }),
    );

    addButton(scene, { id: 'wb-erase', x: 90, y: 156, width: 90, height: 22, label: api.t('common.erase'), fill: FILLS.grey, onPress: () => this.erase() });
    addButton(scene, { id: 'wb-confirm', x: 230, y: 156, width: 90, height: 22, label: api.t('common.confirm'), onPress: () => this.confirm() });
  }

  private pick(index: number): void {
    if (this.picked.length >= this.question.letters.length || this.picked.includes(index)) return;
    this.picked.push(index);
    const tile = this.tiles[index];
    if (tile) setButtonEnabled(tile, false);
    this.refresh();
  }

  private erase(): void {
    const index = this.picked.pop();
    const tile = index === undefined ? undefined : this.tiles[index];
    if (tile) setButtonEnabled(tile, true);
    this.refresh();
  }

  private confirm(): void {
    if (this.picked.length !== this.question.letters.length) return;
    this.api.submit(this.picked.map((i) => this.question.tiles[i]));
  }

  private refresh(): void {
    this.slots.forEach((slot, i) => {
      const index = this.picked[i];
      slot.setText(index === undefined ? '' : (this.question.tiles[index] ?? ''));
    });
  }

  reset(): void {
    for (const index of this.picked) {
      const tile = this.tiles[index];
      if (tile) setButtonEnabled(tile, true);
    }
    this.picked = [];
    this.refresh();
  }

  answerPlan(question: WordBuildQuestion): string[] {
    const used = new Set<number>();
    const ids = question.letters.map((letter) => {
      const index = question.tiles.findIndex((tile, i) => tile === letter && !used.has(i));
      used.add(index);
      return `wb-tile-${index}`;
    });
    return [...ids, 'wb-confirm'];
  }
}
```

`src/scenes/challenges/WordMatchView.ts`:
```ts
import type Phaser from 'phaser';
import type { WordMatchAnswer, WordMatchQuestion } from '../../core/challenges/wordMatch';
import { addButton, addText, FILLS, setButtonFill } from '../../game/ui';
import type { ChallengeView, ChallengeViewApi } from './types';

const PAIR_FILLS = [FILLS.green, FILLS.blue, FILLS.yellow, FILLS.orange, FILLS.lilac];

export class WordMatchView implements ChallengeView<WordMatchQuestion> {
  private question!: WordMatchQuestion;
  private api!: ChallengeViewApi;
  private leftButtons: Phaser.GameObjects.Container[] = [];
  private rightButtons: Phaser.GameObjects.Container[] = [];
  private selected: number | null = null;
  private links = new Map<number, number>();

  mount(scene: Phaser.Scene, question: WordMatchQuestion, api: ChallengeViewApi): void {
    this.question = question;
    this.api = api;
    addText(scene, 160, 16, api.t('challenge.wordMatch.prompt'), { size: 11, width: 280, align: 'center' }).setOrigin(0.5, 0);
    const rowY = (i: number) => 52 + i * 24;
    this.leftButtons = question.left.map((word, i) =>
      addButton(scene, { id: `wm-left-${i}`, x: 88, y: rowY(i), width: 136, height: 22, label: word, fill: FILLS.paper, onPress: () => this.pickLeft(i) }),
    );
    this.rightButtons = question.right.map((word, j) =>
      addButton(scene, { id: `wm-right-${j}`, x: 232, y: rowY(j), width: 136, height: 22, label: word, fill: FILLS.paper, onPress: () => this.pickRight(j) }),
    );
  }

  private pickLeft(index: number): void {
    this.selected = index;
    this.paint();
  }

  private pickRight(index: number): void {
    if (this.selected === null) return;
    for (const [left, right] of [...this.links]) {
      if (right === index || left === this.selected) this.links.delete(left);
    }
    this.links.set(this.selected, index);
    this.selected = null;
    this.paint();

    if (this.links.size === this.question.pairs.length) {
      const answer: WordMatchAnswer = {};
      for (const [left, right] of this.links) answer[this.question.left[left] ?? ''] = this.question.right[right] ?? '';
      this.api.submit(answer);
    }
  }

  private paint(): void {
    const order = [...this.links.keys()];
    this.leftButtons.forEach((button, i) => {
      const linkIndex = order.indexOf(i);
      const fill = i === this.selected ? FILLS.pinkDark : linkIndex >= 0 ? (PAIR_FILLS[linkIndex % PAIR_FILLS.length] ?? FILLS.paper) : FILLS.paper;
      setButtonFill(button, fill);
    });
    this.rightButtons.forEach((button, j) => {
      const linkIndex = order.findIndex((left) => this.links.get(left) === j);
      setButtonFill(button, linkIndex >= 0 ? (PAIR_FILLS[linkIndex % PAIR_FILLS.length] ?? FILLS.paper) : FILLS.paper);
    });
  }

  reset(): void {
    this.links.clear();
    this.selected = null;
    this.paint();
  }

  answerPlan(question: WordMatchQuestion): string[] {
    return question.pairs.flatMap((pair) => [`wm-left-${question.left.indexOf(pair.pt)}`, `wm-right-${question.right.indexOf(pair.en)}`]);
  }
}
```

`src/scenes/challenges/FillSentenceView.ts`:
```ts
import type Phaser from 'phaser';
import type { FillSentenceQuestion } from '../../core/challenges/fillSentence';
import { addButton, addText } from '../../game/ui';
import type { ChallengeView, ChallengeViewApi } from './types';

export class FillSentenceView implements ChallengeView<FillSentenceQuestion> {
  mount(scene: Phaser.Scene, question: FillSentenceQuestion, api: ChallengeViewApi): void {
    addText(scene, 160, 44, question.text, { size: 13, width: 280, align: 'center' }).setOrigin(0.5);
    question.options.forEach((option, i) => {
      addButton(scene, { id: `fs-opt-${i}`, x: 160, y: 96 + i * 28, width: 180, height: 24, size: 12, label: option, onPress: () => api.submit(option) });
    });
  }

  reset(): void {}

  answerPlan(question: FillSentenceQuestion): string[] {
    return [`fs-opt-${question.options.indexOf(question.answer)}`];
  }
}
```

`src/scenes/challenges/ComprehensionView.ts`:
```ts
import Phaser from 'phaser';
import type { ComprehensionQuestion } from '../../core/challenges/comprehension';
import { addButton, addText, COLORS } from '../../game/ui';
import type { ChallengeView, ChallengeViewApi } from './types';

export class ComprehensionView implements ChallengeView<ComprehensionQuestion> {
  private scene!: Phaser.Scene;
  private question!: ComprehensionQuestion;
  private api!: ChallengeViewApi;
  private page: Phaser.GameObjects.Container | null = null;
  private answers: string[] = [];

  mount(scene: Phaser.Scene, question: ComprehensionQuestion, api: ChallengeViewApi): void {
    this.scene = scene;
    this.question = question;
    this.api = api;
    this.showText();
  }

  private newPage(): Phaser.GameObjects.Container {
    this.page?.destroy();
    this.page = this.scene.add.container(0, 0);
    return this.page;
  }

  private later(action: () => void): void {
    this.scene.time.delayedCall(0, action);
  }

  private showText(): void {
    const page = this.newPage();
    page.add(addText(this.scene, 160, 12, this.question.title, { size: 13, align: 'center', color: COLORS.pinkDark }).setOrigin(0.5, 0));
    page.add(addText(this.scene, 16, 32, this.question.paragraphs.join('\n\n'), { size: 9, width: 288 }));
    page.add(
      addButton(this.scene, { id: 'cp-continue', x: 250, y: 158, width: 90, height: 22, label: this.api.t('common.continue'), onPress: () => this.later(() => this.showQuestion(0)) }),
    );
  }

  private showQuestion(index: number): void {
    const item = this.question.questions[index];
    if (!item) return;
    const page = this.newPage();
    page.add(
      addText(this.scene, 160, 16, this.api.t('challenge.comprehension.question', { n: index + 1, total: this.question.questions.length }), { size: 9, align: 'center' }).setOrigin(0.5, 0),
    );
    page.add(addText(this.scene, 160, 34, item.prompt, { size: 12, width: 280, align: 'center' }).setOrigin(0.5, 0));
    item.options.forEach((option, j) => {
      page.add(
        addButton(this.scene, { id: `cp-q${index}-opt-${j}`, x: 160, y: 88 + j * 28, width: 220, height: 24, label: option, onPress: () => this.later(() => this.answer(index, option)) }),
      );
    });
  }

  private answer(index: number, option: string): void {
    this.answers[index] = option;
    if (index + 1 < this.question.questions.length) this.showQuestion(index + 1);
    else this.api.submit([...this.answers]);
  }

  reset(): void {
    this.answers = [];
    this.showText();
  }

  answerPlan(question: ComprehensionQuestion): string[] {
    return ['cp-continue', ...question.questions.map((item, i) => `cp-q${i}-opt-${item.options.indexOf(item.answer)}`)];
  }
}
```

`src/scenes/challenges/index.ts`:
```ts
import type { ChallengeId } from '../../core/challenges';
import { ComprehensionView } from './ComprehensionView';
import { FillSentenceView } from './FillSentenceView';
import type { ChallengeView } from './types';
import { WordBuildView } from './WordBuildView';
import { WordMatchView } from './WordMatchView';

export type ViewChallengeId = Exclude<ChallengeId, 'clueHunt'>;

export const VIEWS: Record<ViewChallengeId, () => ChallengeView<unknown>> = {
  wordBuild: () => new WordBuildView() as ChallengeView<unknown>,
  wordMatch: () => new WordMatchView() as ChallengeView<unknown>,
  fillSentence: () => new FillSentenceView() as ChallengeView<unknown>,
  comprehension: () => new ComprehensionView() as ChallengeView<unknown>,
};
```

- [ ] **Step 3: Criar a cena do desafio**

`src/scenes/ChallengeScene.ts`:
```ts
import Phaser from 'phaser';
import { CHALLENGES } from '../core/challenges';
import { recordAttempt } from '../core/difficulty';
import { ctx } from '../game/context';
import { showDialogue } from '../game/overlays';
import { testState } from '../game/testState';
import { addText, COLORS, FILLS } from '../game/ui';
import { VIEWS, type ViewChallengeId } from './challenges';

export class ChallengeScene extends Phaser.Scene {
  constructor() {
    super('ChallengeScene');
  }

  create(data: { challengeId: ViewChallengeId }): void {
    const context = ctx(this);
    const challenge = CHALLENGES[data.challengeId];
    const question = challenge.generate(context.progress.difficulty.level, context.rng, context.i18n.locale);
    const view = VIEWS[data.challengeId]();
    let usedHint = false;
    let answering = false;

    this.add.rectangle(160, 90, 320, 180, FILLS.ink, 0.6).setInteractive();
    this.add.rectangle(160, 90, 308, 170, FILLS.paper).setStrokeStyle(2, FILLS.pinkDark);
    testState.answerPlan = view.answerPlan(question);

    view.mount(this, question, {
      t: (key, vars) => context.i18n.t(key, vars),
      submit: (answer) => {
        if (answering) return;
        answering = true;
        const correct = challenge.check(question, answer);
        context.progress.difficulty = recordAttempt(context.progress.difficulty, { correct, usedHint });
        context.save();

        if (correct) {
          testState.answerPlan = [];
          const text = addText(this, 160, 90, context.i18n.t('challenge.correct'), { size: 20, color: COLORS.pinkDark }).setOrigin(0.5).setDepth(100);
          this.tweens.add({ targets: text, scale: 1.3, yoyo: true, duration: 250 });
          this.time.delayedCall(700, () => {
            this.scene.stop();
            this.game.events.emit('challenge-complete');
          });
          return;
        }

        usedHint = true;
        const hint = `${context.i18n.t('challenge.hintBy', { companion: context.progress.companionName ?? '' })} ${challenge.hint(question, context.i18n.locale)}`;
        void showDialogue(this, [
          { speaker: 'companion', text: context.i18n.t('challenge.wrong') },
          { speaker: 'companion', text: hint },
        ]).then(() => {
          view.reset();
          testState.answerPlan = view.answerPlan(question);
          answering = false;
        });
      },
    });
  }
}
```

Registrar em `src/main.ts`: importar `ChallengeScene` de `./scenes/ChallengeScene` e incluir na lista, logo depois de `MapScene`:
```ts
  scene: [BootScene, LanguageScene, IntroScene, MapScene, ChallengeScene, DialogueScene, MenuScene, PhaseCompleteScene],
```

- [ ] **Step 4: Escrever o teste da fase completa e o de dica**

`tests/e2e/phase1.spec.ts`:
```ts
import { expect, test, type Page } from '@playwright/test';
import { activeScenes, dialogueText, finishDialogue, startGame, tap } from './helpers';

const STEPS = [
  { npc: 'emilia', hunt: false },
  { npc: 'visconde', hunt: false },
  { npc: 'benta', hunt: false },
  { npc: 'saci', hunt: true },
  { npc: 'benta', hunt: false },
];

async function answerPlan(page: Page): Promise<string[]> {
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__!.answerPlan().length), { timeout: 15_000 }).toBeGreaterThan(0);
  return page.evaluate(() => window.__GAME_TEST__!.answerPlan());
}

async function solve(page: Page, hunt: boolean): Promise<void> {
  for (const id of await answerPlan(page)) {
    if (hunt) await page.evaluate((buttonId) => window.__GAME_TEST__!.focus(buttonId), id);
    await tap(page, id);
  }
}

async function completed(page: Page): Promise<number> {
  return page.evaluate(() => window.__GAME_TEST__!.progress().completed.length);
}

async function reachMap(page: Page, locale: 'pt' | 'en'): Promise<string[]> {
  const errors = await startGame(page);
  await tap(page, `lang-${locale}`);
  await finishDialogue(page);
  for (const letter of ['M', 'E', 'L']) await tap(page, `kb-${letter}`);
  await tap(page, 'name-confirm');
  await expect.poll(() => activeScenes(page)).toContain('MapScene');
  await finishDialogue(page);
  return errors;
}

for (const locale of ['pt', 'en'] as const) {
  test(`conclui a fase 1 em ${locale}`, async ({ page }) => {
    const errors = await reachMap(page, locale);

    for (const [index, step] of STEPS.entries()) {
      await page.evaluate((npc) => window.__GAME_TEST__!.interact(npc), step.npc);
      await finishDialogue(page);
      await solve(page, step.hunt);
      await finishDialogue(page);
      await expect.poll(() => completed(page)).toBe(index + 1);
    }

    await expect.poll(() => activeScenes(page)).toContain('PhaseCompleteScene');
    const progress = await page.evaluate(() => window.__GAME_TEST__!.progress());
    expect(progress.locale).toBe(locale);
    expect(progress.companionName).toBe('Mel');
    expect(errors).toEqual([]);
  });
}

test('resposta errada mostra dica da coelha e permite tentar de novo', async ({ page }) => {
  await reachMap(page, 'pt');
  await page.evaluate(() => window.__GAME_TEST__!.interact('emilia'));
  await finishDialogue(page);

  const plan = await answerPlan(page);
  const letters = plan.slice(0, -1);
  const wrong = [letters[1]!, letters[0]!, ...letters.slice(2), 'wb-confirm'];
  for (const id of wrong) await tap(page, id);

  await expect.poll(() => dialogueText(page)).toBe('Quase! Vamos tentar de novo.');
  await tap(page, 'dlg-next');
  await expect.poll(() => dialogueText(page)).toMatch(/^Dica da Mel: A palavra começa com "/);
  await tap(page, 'dlg-next');

  await solve(page, false);
  await finishDialogue(page);
  await expect.poll(() => completed(page)).toBe(1);
  const progress = await page.evaluate(() => window.__GAME_TEST__!.progress());
  expect(progress.difficulty.level).toBe(2);
});
```

A troca das duas primeiras letras sempre produz uma palavra errada no nível 2, porque nenhuma palavra desse nível começa com duas letras iguais (PIPOCA, BONECA, MACACO, TUCANO, CORUJA, PAÇOCA).

- [ ] **Step 5: Rodar tudo**

Run: `npx vitest run && npx eslint . && npx tsc --noEmit && npx playwright test`
Expected: PASS em todos os testes nos projetos `pixel-7` e `iphone-13`.

- [ ] **Step 6: Commit**

```bash
git add src tests/e2e
git commit -m "feat: telas dos desafios e fase 1 jogável do começo ao fim"
```

---

### Task 13: Conferência visual, publicação e teste no celular

**Files:**
- Create: `tests/e2e/screenshots.spec.ts`
- Modify: `docs/superpowers/specs/2026-09-12-princess-grace-sitio-design.md` (status e desvios registrados)

**Interfaces:**
- Consumes: jogo completo das tasks 1 a 12

- [ ] **Step 1: Escrever o teste de capturas**

`tests/e2e/screenshots.spec.ts`:
```ts
import { expect, test } from '@playwright/test';
import { activeScenes, dialogueText, finishDialogue, startGame, tap } from './helpers';

test('gera capturas das telas principais para conferência', async ({ page }, testInfo) => {
  const shot = async (name: string) => {
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
  };

  await startGame(page);
  await shot('01-idioma');
  await tap(page, 'lang-pt');
  await expect.poll(() => dialogueText(page)).not.toBeNull();
  await shot('02-abertura');
  await finishDialogue(page);
  await shot('03-nome-da-coelha');
  await tap(page, 'name-suggestion-0');
  await tap(page, 'name-confirm');
  await expect.poll(() => activeScenes(page)).toContain('MapScene');
  await shot('04-mapa-com-saudacao');
  await finishDialogue(page);

  await page.evaluate(() => window.__GAME_TEST__!.interact('emilia'));
  await expect.poll(() => dialogueText(page)).not.toBeNull();
  await tap(page, 'dlg-next');
  await tap(page, 'dlg-next');
  await shot('05-dialogo-com-retrato-da-grace');
  await finishDialogue(page);
  await expect.poll(() => page.evaluate(() => window.__GAME_TEST__!.answerPlan().length)).toBeGreaterThan(0);
  await shot('06-desafio-montar-palavra');
});
```

- [ ] **Step 2: Gerar e conferir as capturas**

Run: `npx playwright test tests/e2e/screenshots.spec.ts --project=pixel-7`
Expected: PASS; seis arquivos PNG em `test-results/screenshots-*/`.

Abrir cada captura e verificar:

| Item | Critério |
|---|---|
| Legibilidade | Texto de 9 a 11 px legível na captura em tamanho real |
| Diálogo | Texto não passa da borda da caixa; retrato da Grace aparece na fala `grace.accept` |
| Desafio | Peças, casas e botões não se sobrepõem |
| Mapa | Personagens visíveis, nomes acima das cabeças, botão Menu dentro da tela |

Se o texto estiver ilegível, aumentar em 2 px o tamanho padrão de `addText` em `src/game/ui.ts` e o tamanho dos textos de diálogo em `src/scenes/DialogueScene.ts`, rodar de novo `npx playwright test` inteiro e registrar a mudança no ADR-004.

- [ ] **Step 3: Enviar as capturas ao usuário**

Enviar as capturas `02`, `04`, `05` e `06` ao usuário (SendUserFile) com um resumo do que já funciona e do que ainda é arte provisória.

- [ ] **Step 4: Atualizar o spec**

Em `docs/superpowers/specs/2026-09-12-princess-grace-sitio-design.md`, trocar a linha de status por:
```markdown
- **Status:** plano 1 (fundação e fase 1) implementado; planos 2 (fase 2 e final) e 3 (arte definitiva) pendentes
```

E acrescentar ao fim da seção 5, depois de "Tratamento de erros":
```markdown
### Registro de implementação do plano 1

- Mapas escritos em ASCII e convertidos para JSON do Tiled (ADR-002).
- Fonte Pixelify Sans no lugar de fonte bitmap própria (ADR-004).
- Nome da coelha digitado em teclado na tela, com três sugestões.
- Personagens do Sítio, Grace no mapa e coelha usam retângulos coloridos provisórios até o plano 3; o retrato da Grace já é definitivo.
```

- [ ] **Step 5: Rodar a verificação completa**

Run: `npm run lint && npm run typecheck && npm test && npm run test:e2e`
Expected: todos passam.

- [ ] **Step 6: Commit e push**

```bash
git add tests/e2e/screenshots.spec.ts docs src
git commit -m "test: capturas das telas principais e registro do plano 1 no spec"
GIT_SSH_COMMAND='ssh -i /Users/joseromualdocostafilho/.ssh/id_ed25519_josercf -o IdentitiesOnly=yes -F /dev/null' git push
```

- [ ] **Step 7: Verificar a publicação**

Run: `gh run watch --repo josercf/princess-grace-sitio "$(gh run list --repo josercf/princess-grace-sitio --limit 1 --json databaseId -q '.[0].databaseId')"`
Expected: `test` e `deploy` com sucesso.

Run: `curl -s https://josercf.github.io/princess-grace-sitio/assets/generated/manifest.json | head -c 200`
Expected: JSON com `grace-portrait` e `pomar`.

- [ ] **Step 8: Pedir teste no celular real**

Enviar ao usuário o link `https://josercf.github.io/princess-grace-sitio/` e pedir que teste num celular: abrir na horizontal, escolher idioma, dar nome à coelha, andar tocando no chão e concluir pelo menos o desafio da Emília. Registrar os problemas relatados como itens para o plano 2.

---

## Cobertura do spec neste plano

| Requisito do spec | Task |
|---|---|
| Navegador do celular, horizontal, aviso de girar | 1 |
| Resolução 320×180 com ampliação inteira | 1 |
| Publicação no GitHub Pages com CI | 2, 13 |
| Paleta de 32 cores e arte por matriz | 3 |
| Retrato da Grace aprovado primeiro | 4 |
| Dificuldade adaptativa (começa em 2, dois erros baixam, três acertos sem dica sobem) | 5 |
| Progresso salvo, inválido descartado, funcionamento sem `localStorage` | 5, 11 |
| Textos pt e en com as mesmas chaves, fallback com aviso | 6 |
| Tiles de 16×16, mapa do pomar, caminho por toque | 7, 11 |
| Fase 1: cinco desafios com os personagens definidos | 8, 9, 11, 12 |
| Escolha e troca de idioma a qualquer momento | 10, 11 |
| Nome da coelha na abertura | 10 |
| Retratos grandes nos diálogos | 10 |
| Sem game over, dica da coelha a cada erro | 11, 12 |
| Menu com reinício e aviso de progresso não salvo | 11 |
| Teste automático concluindo a fase 1 nos dois idiomas | 12 |
| Botões com área mínima de 44 px na tela | 10, 11, 12 (altura mínima de 22 px na base) |

Ficam para o plano 2: fase 2 (cozinha da Tia Nastácia, cinco desafios de matemática), festa final, Narizinho e Pedrinho, efeitos sonoros com Web Audio.

Ficam para o plano 3: sprites de 24×32 com animação de caminhada, retratos dos personagens do Sítio e da coelha, as outras quatro expressões da Grace, tilesets da casa, ribeirão, cozinha e terreiro.
