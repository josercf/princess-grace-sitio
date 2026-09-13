import Phaser from 'phaser';
import { clueHunt } from '../core/challenges/clueHunt';
import { recordAttempt } from '../core/difficulty';
import { directionOf, type Direction } from '../core/direction';
import { findPath, neighbors, pathToNeighbor, type Point } from '../core/pathfinding';
import { isPhaseComplete, nextStep, PHASE1_STEPS, type NpcId } from '../core/phaseFlow';
import { ctx } from '../game/context';
import { runChallenge, showDialogue, type DialogueLine } from '../game/overlays';
import { textureFor } from '../game/placeholders';
import { testState } from '../game/testState';
import { addButton, addText, COLORS, FILLS } from '../game/ui';
import { ensureWalkAnimations, faceIdle, walkAnimationKey } from '../game/walkers';

const TILE = 16;
const STEP_MS = 140;
const MARKER_HEIGHT = 22;
// Base dos elementos fixos no alto da tela (título, Menu e Pistas).
const HUD_BOTTOM = 26;

export class MapScene extends Phaser.Scene {
  private grid: boolean[][] = [];
  private grace!: Phaser.GameObjects.Sprite;
  private companion!: Phaser.GameObjects.Sprite;
  private graceTile: Point = { x: 1, y: 1 };
  private companionTile: Point = { x: 0, y: 1 };
  private graceFacing: Direction = 'down';
  private companionFacing: Direction = 'down';
  private graceAnimated = false;
  private companionAnimated = false;
  private npcs = new Map<NpcId, Point>();
  private hideouts = new Map<string, Point>();
  private busy = false;
  private hunting = false;
  private walkToken = 0;
  private worldHeight = 0;

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

    this.graceAnimated = ensureWalkAnimations(this, 'grace');
    this.companionAnimated = ensureWalkAnimations(this, 'companion');
    this.graceFacing = 'down';
    this.companionFacing = 'down';
    this.companion = this.add.sprite(0, 0, textureFor(this, 'companion')).setOrigin(0.5, 1).setDepth(9);
    this.grace = this.add.sprite(0, 0, textureFor(this, 'grace')).setOrigin(0.5, 1).setDepth(10);
    this.companionTile = { x: this.graceTile.x - 1, y: this.graceTile.y };
    this.placeAt(this.grace, this.graceTile);
    this.placeAt(this.companion, this.companionTile);

    this.worldHeight = map.heightInPixels;
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
    testState.walker = (id) => {
      if (id === 'grace') return { texture: this.grace.texture.key, facing: this.graceFacing };
      if (id === 'companion') return { texture: this.companion.texture.key, facing: this.companionFacing };
      return null;
    };
    this.events.once('shutdown', () => {
      testState.walker = null;
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

  private placeAt(obj: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite, tile: Point): void {
    obj.setPosition(tile.x * TILE + TILE / 2, tile.y * TILE + TILE);
  }

  private tweenTo(obj: Phaser.GameObjects.Sprite, tile: Point): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({ targets: obj, x: tile.x * TILE + TILE / 2, y: tile.y * TILE + TILE, duration: STEP_MS, onComplete: () => resolve() });
    });
  }

  private async walkAlong(path: Point[]): Promise<void> {
    const token = ++this.walkToken;
    for (const next of path) {
      if (token !== this.walkToken) return;
      const previous = this.graceTile;
      this.graceFacing = directionOf(previous, next, this.graceFacing);
      this.companionFacing = directionOf(this.companionTile, previous, this.companionFacing);
      this.graceTile = next;
      this.companionTile = previous;
      if (this.graceAnimated) this.grace.play(walkAnimationKey('grace', this.graceFacing), true);
      if (this.companionAnimated) this.companion.play(walkAnimationKey('companion', this.companionFacing), true);
      await Promise.all([this.tweenTo(this.grace, next), this.tweenTo(this.companion, previous)]);
    }
    if (token === this.walkToken) this.standStill();
  }

  private standStill(): void {
    faceIdle(this.grace, 'grace', this.graceFacing, this.graceAnimated);
    faceIdle(this.companion, 'companion', this.companionFacing, this.companionAnimated);
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
    this.graceFacing = directionOf(this.graceTile, target, this.graceFacing);
    this.standStill();
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
      this.graceFacing = directionOf(free, target, this.graceFacing);
      this.standStill();
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
        await this.say([{ speaker: id, text: context.i18n.t('npc.waiting', { npc: context.i18n.t(`npc.ref.${step.npc}`) }) }]);
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

  // Centraliza o marcador no esconderijo, a menos que ele fique sob o HUD
  // com a câmera no ponto mais baixo do mapa; nesse caso, desce para baixo
  // do tile.
  private markerY(tile: Point): number {
    const centered = tile.y * TILE + TILE / 2;
    const maxScrollY = Math.max(0, this.worldHeight - this.cameras.main.height);
    if (centered - MARKER_HEIGHT / 2 - maxScrollY >= HUD_BOTTOM) return centered;
    return (tile.y + 1) * TILE + MARKER_HEIGHT / 2;
  }

  private async runHunt(): Promise<void> {
    const context = ctx(this);
    const question = clueHunt.generate(context.progress.difficulty.level, context.rng, context.i18n.locale);
    const candidateTiles = question.candidates.map((id) => {
      const tile = this.hideouts.get(id);
      if (!tile) throw new Error(`esconderijo ${id} não está no mapa`);
      return { id, tile };
    });

    this.hunting = true;
    const clueLines = question.clues.map((clue, i): DialogueLine => ({ speaker: 'saci', text: `${i + 1}. ${clue}` }));
    await this.say(clueLines);

    // A caminhada continua liberada durante a caça de propósito: o mapa tem
    // 480px de largura e a tela mostra só 320px, então Grace precisa andar
    // até os esconderijos distantes para trazê-los para dentro da câmera.
    this.busy = false;

    const cluesButton = addButton(this, {
      id: 'hunt-clues', x: 243, y: 14, width: 50, height: MARKER_HEIGHT, size: 10, label: context.i18n.t('hunt.clues'), fill: FILLS.lilac,
      onPress: () => {
        if (!this.busy) void this.say(clueLines);
      },
    })
      .setScrollFactor(0)
      .setDepth(100);

    await new Promise<void>((resolve) => {
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
          cluesButton.destroy();
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
          { speaker: 'companion', text: `${context.i18n.t('challenge.hintBy', { companion: context.progress.companionName ?? '' })} ${clueHunt.hint(question, context.i18n.locale, id)}` },
        ]);
        answering = false;
      };

      for (const { id, tile } of candidateTiles) {
        const marker = addButton(this, {
          id: `hideout-${id}`, x: tile.x * TILE + TILE / 2, y: this.markerY(tile), width: 60, height: MARKER_HEIGHT, size: 8,
          label: context.i18n.t(`hideout.${id}`), fill: FILLS.lilac, onPress: () => void pick(id),
        }).setDepth(50);
        markers.push(marker);
      }
      testState.answerPlan = [`hideout-${question.targetId}`];
    });
  }

  private openMenu(): void {
    if (this.busy) return;
    this.busy = true;
    const onMenuClosed = () => {
      this.busy = false;
    };
    this.game.events.once('menu-closed', onMenuClosed);
    this.events.once('shutdown', () => this.game.events.off('menu-closed', onMenuClosed));
    this.scene.launch('MenuScene');
    this.scene.bringToTop('MenuScene');
  }
}
