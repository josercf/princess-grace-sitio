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
