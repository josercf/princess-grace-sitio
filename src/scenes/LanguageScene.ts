import Phaser from 'phaser';
import type { Locale } from '../core/locale';
import { translate } from '../core/strings';
import { ctx } from '../game/context';
import { addButton, addText, COLORS, FILLS } from '../game/ui';

export class LanguageScene extends Phaser.Scene {
  constructor() {
    super('LanguageScene');
  }

  create(data: { returnTo?: string } = {}): void {
    this.cameras.main.setBackgroundColor('#4a1f5c');
    const title = `${translate('pt', 'language.title')}\n${translate('en', 'language.title')}`;
    addText(this, 160, 50, title, { size: 14, color: COLORS.paper, align: 'center' }).setOrigin(0.5);

    const choose = (locale: Locale) => {
      const context = ctx(this);
      context.setLocale(locale);
      if (data.returnTo) this.scene.start(data.returnTo);
      else this.scene.start(context.progress.companionName === null ? 'IntroScene' : 'MapScene');
    };

    addButton(this, { id: 'lang-pt', x: 100, y: 115, width: 110, height: 30, size: 13, label: translate('pt', 'language.option.pt'), fill: FILLS.pink, onPress: () => choose('pt') });
    addButton(this, { id: 'lang-en', x: 220, y: 115, width: 110, height: 30, size: 13, label: translate('en', 'language.option.en'), fill: FILLS.lilac, onPress: () => choose('en') });
  }
}
