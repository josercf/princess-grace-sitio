import Phaser from 'phaser';
import { CHALLENGES } from '../core/challenges';
import { recordAttempt } from '../core/difficulty';
import { ctx } from '../game/context';
import { showDialogue } from '../game/overlays';
import { useDeviceResolution } from '../game/resolution';
import { testState } from '../game/testState';
import { addText, COLORS, FILLS } from '../game/ui';
import { VIEWS, type ViewChallengeId } from './challenges';

export class ChallengeScene extends Phaser.Scene {
  constructor() {
    super('ChallengeScene');
  }

  create(data: { challengeId: ViewChallengeId }): void {
    useDeviceResolution(this);
    const context = ctx(this);
    const challenge = CHALLENGES[data.challengeId];
    const question = challenge.generate(context.progress.difficulty.level, context.rng, context.i18n.locale);
    const view = VIEWS[data.challengeId]();
    let usedHint = false;
    let answering = false;

    this.add.rectangle(160, 90, 320, 180, FILLS.ink, 0.6).setInteractive();
    this.add.rectangle(160, 90, 308, 170, FILLS.paper).setStrokeStyle(2, FILLS.pinkDark);
    testState.answerPlan = view.answerPlan(question);

    view.mount(this, question, {
      t: (key, vars) => context.i18n.t(key, vars),
      submit: (answer) => {
        if (answering) return;
        answering = true;
        const correct = challenge.check(question, answer);
        context.progress.difficulty = recordAttempt(context.progress.difficulty, { correct, usedHint });
        context.save();

        if (correct) {
          testState.answerPlan = [];
          const text = addText(this, 160, 90, context.i18n.t('challenge.correct'), { size: 20, color: COLORS.pinkDark }).setOrigin(0.5).setDepth(100);
          this.tweens.add({ targets: text, scale: 1.3, yoyo: true, duration: 250 });
          this.time.delayedCall(700, () => {
            this.scene.stop();
            this.game.events.emit('challenge-complete');
          });
          return;
        }

        usedHint = true;
        const hint = `${context.i18n.t('challenge.hintBy', { companion: context.progress.companionName ?? '' })} ${challenge.hint(question, context.i18n.locale, answer)}`;
        void showDialogue(this, [
          { speaker: 'companion', text: context.i18n.t('challenge.wrong') },
          { speaker: 'companion', text: hint },
        ]).then(() => {
          view.reset();
          testState.answerPlan = view.answerPlan(question);
          answering = false;
        });
      },
    });
  }
}
