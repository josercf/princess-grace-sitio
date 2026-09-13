import Phaser from 'phaser';
import { resolutionOf } from './resolution';
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

// A textura do texto usa a resolução interna do canvas para os glifos
// coincidirem com os pixels reais da tela (ADR-006).
export function addText(scene: Phaser.Scene, x: number, y: number, text: string, options: TextOptions = {}): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    resolution: resolutionOf(scene.game),
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
