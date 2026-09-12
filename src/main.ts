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
