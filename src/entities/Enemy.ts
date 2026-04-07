import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpReward: number;
  isBoss: boolean = false;
  canDamage: boolean = true;
  enemyType: string;

  private shadow!: Phaser.GameObjects.Image;
  private hpBarBg!: Phaser.GameObjects.Image;
  private hpBarFill!: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
    const cfg = GameConfig.ENEMY_TYPES[type];
    super(scene, x, y, `enemy_${type}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = type;
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.speed = cfg.speed;
    this.damage = cfg.damage;
    this.xpReward = cfg.xp;
    this.isBoss = type === 'boss';

    this.setDepth(5);
    this.body!.setSize(cfg.size * 1.5, cfg.size * 1.5);
    this.body!.setOffset(4, 4);

    // Shadow
    this.shadow = scene.add.image(x, y + cfg.size, 'shadow');
    this.shadow.setDepth(1).setScale(cfg.size / 20);

    // HP bar
    this.hpBarBg = scene.add.image(x, y - cfg.size - 4, 'hp_bar_bg');
    this.hpBarBg.setDepth(20).setScale(1.2);
    this.hpBarFill = scene.add.image(x - 16, y - cfg.size - 4, 'hp_bar_fill');
    this.hpBarFill.setDepth(21).setScale(1.2).setOrigin(0, 0.5);

    this.scene.events.on('update', this.updateEnemy, this);
    this.once('destroy', () => {
      this.scene?.events.off('update', this.updateEnemy, this);
      this.shadow?.destroy();
      this.hpBarBg?.destroy();
      this.hpBarFill?.destroy();
    });
  }

  updateEnemy() {
    if (!this.active || !this.scene) return;
    const gs = this.scene as any;
    const player: Phaser.GameObjects.Sprite = gs.player;
    if (!player || !player.active) {
      (this.body as Phaser.Physics.Arcade.Body).velocity.x = 0;
      (this.body as Phaser.Physics.Arcade.Body).velocity.y = 0;
      return;
    }

    // Move toward player
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    (this.body as Phaser.Physics.Arcade.Body).velocity.x = Math.cos(angle) * this.speed;
    (this.body as Phaser.Physics.Arcade.Body).velocity.y = Math.sin(angle) * this.speed;

    // Update shadow & hp bar
    const cfg = GameConfig.ENEMY_TYPES[this.enemyType];
    this.shadow.setPosition(this.x, this.y + cfg.size);
    this.hpBarBg.setPosition(this.x, this.y - cfg.size - 4);
    this.hpBarFill.setPosition(this.x - 16, this.y - cfg.size - 4);

    // Update hp bar width
    const pct = Math.max(0, this.hp / this.maxHp);
    this.hpBarFill.setScale(1.2 * pct, 1.2);
  }

  takeDamage(amount: number) {
    this.hp -= amount;

    // Flash white
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => this.clearTint());

    // Knockback slightly
    const gs = this.scene as any;
    const player = gs.player;
    const angle = Phaser.Math.Angle.Between(player.x, player.y, this.x, this.y);
    (this.body as Phaser.Physics.Arcade.Body).velocity.x = Math.cos(angle) * 100;
    (this.body as Phaser.Physics.Arcade.Body).velocity.y = Math.sin(angle) * 100;

    if (this.hp <= 0) {
      this.die();
    }
  }

  private die() {
    const gs = this.scene as any;
    gs.addKill(this);
    gs.player?.addXp(this.xpReward);
    gs.damageNumbers?.show(this.x, this.y - 20, `+${this.xpReward} XP`, '#3498db');
    gs.particleSystem?.burst(this.x, this.y, GameConfig.ENEMY_TYPES[this.enemyType].color, this.isBoss ? 12 : 5);
    gs.enemies.remove(this, true, true);
  }
}
