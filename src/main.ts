import '@fontsource/pixelify-sans/400.css';
import Phaser from 'phaser';
import './style.css';
import { BASE_HEIGHT, BASE_WIDTH, renderScale } from './core/scale';
import { applyRenderScale } from './game/resolution';
import { installTestHook } from './game/testHook';
import { BootScene } from './scenes/BootScene';
import { ChallengeScene } from './scenes/ChallengeScene';
import { DialogueScene } from './scenes/DialogueScene';
import { IntroScene } from './scenes/IntroScene';
import { LanguageScene } from './scenes/LanguageScene';
import { MapScene } from './scenes/MapScene';
import { MenuScene } from './scenes/MenuScene';
import { PhaseCompleteScene } from './scenes/PhaseCompleteScene';

const currentScale = () => renderScale(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
const initial = currentScale();

// O canvas tem a resolução real da tela e as cenas desenham em 320×180 com a
// câmera ampliada pela resolução (ADR-006).
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: BASE_WIDTH * initial.resolution,
  height: BASE_HEIGHT * initial.resolution,
  pixelArt: true,
  backgroundColor: '#1a1423',
  scale: { mode: Phaser.Scale.NONE, zoom: initial.displayZoom / initial.resolution },
  input: { activePointers: 2 },
  scene: [BootScene, LanguageScene, IntroScene, MapScene, ChallengeScene, DialogueScene, MenuScene, PhaseCompleteScene],
});

installTestHook(game);

const onViewChange = () => applyRenderScale(game, currentScale());
window.addEventListener('resize', onViewChange);
window.addEventListener('orientationchange', onViewChange);
