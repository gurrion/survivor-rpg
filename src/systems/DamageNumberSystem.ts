import Phaser from 'phaser';

export class DamageNumberSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(x: number, y: number, amount: number | string, color: string = '#ffffff') {
    const text = this.scene.add.text(x + (Math.random() - 0.5) * 20, y - 10, String(amount), {
      fontSize: amount.toString().length > 3 ? '14px' : '18px',
      fontFamily: 'monospace',
      color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }
}
