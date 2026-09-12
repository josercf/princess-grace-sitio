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
