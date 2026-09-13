import type Phaser from 'phaser';
import type { Progress } from '../core/progress';
import { ctx } from './context';
import { testState } from './testState';

export type Tappable = Phaser.GameObjects.GameObject & {
  getBounds(output?: Phaser.Geom.Rectangle): Phaser.Geom.Rectangle;
};

export interface GameTestApi {
  activeScenes(): string[];
  button(id: string): { x: number; y: number } | null;
  focus(id: string): void;
  answerPlan(): string[];
  interact(npc: string): void;
  progress(): Progress;
  dialogueText(): string | null;
  walker(id: string): { texture: string; facing: string } | null;
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
    walker: (id) => testState.walker?.(id) ?? null,
  };
}
