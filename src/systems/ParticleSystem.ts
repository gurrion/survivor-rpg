import Phaser from 'phaser';

export class ParticleSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  burst(x: number, y: number, color: number, count: number = 5) {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.image(x, y, 'particle');
      p.setTint(color);
      p.setDepth(50).setScale(0.5 + Math.random() * 0.5);

      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;

      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed - 20,
        alpha: 0,
        scale: 0,
        duration: 300 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }
}
