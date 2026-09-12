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
