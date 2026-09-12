import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.add.text(160, 90, 'Princess Grace', { color: '#fff8f0' }).setOrigin(0.5);
  }
}
