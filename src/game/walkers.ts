import type Phaser from 'phaser';
import { frameIndex, WALK_DIRECTIONS, type Direction } from '../core/direction';

export interface WalkerSpec {
  framesPerDirection: number;
  frameRate: number;
}

export const WALKERS: Readonly<Record<'grace' | 'companion', WalkerSpec>> = {
  grace: { framesPerDirection: 4, frameRate: 8 },
  companion: { framesPerDirection: 2, frameRate: 6 },
};

export function walkAnimationKey(id: keyof typeof WALKERS, direction: Direction): string {
  return `${id}-walk-${direction}`;
}

// Cria as animações de caminhada quando a folha de sprite existe; sem ela o mapa usa o placeholder parado.
export function ensureWalkAnimations(scene: Phaser.Scene, id: keyof typeof WALKERS): boolean {
  const texture = `sprite-${id}`;
  if (!scene.textures.exists(texture)) return false;
  const { framesPerDirection, frameRate } = WALKERS[id];
  for (const direction of WALK_DIRECTIONS) {
    const key = walkAnimationKey(id, direction);
    if (scene.anims.exists(key)) continue;
    const start = frameIndex(direction, framesPerDirection, 0);
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, { start, end: start + framesPerDirection - 1 }),
      frameRate,
      repeat: -1,
    });
  }
  return true;
}

export function faceIdle(sprite: Phaser.GameObjects.Sprite, id: keyof typeof WALKERS, direction: Direction, animated: boolean): void {
  if (!animated) return;
  sprite.stop();
  sprite.setFrame(frameIndex(direction, WALKERS[id].framesPerDirection, 0));
}
