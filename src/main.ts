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
