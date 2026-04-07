import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number = GameConfig.PLAYER_MAX_HP;
  maxHp: number = GameConfig.PLAYER_MAX_HP;
  level: number = 1;
  xp: number = 0;
  xpToNext: number = GameConfig.XP_BASE;
  speed: number = GameConfig.PLAYER_SPEED;
  damage: number = GameConfig.PLAYER_DAMAGE;
  attackRange: number = GameConfig.AUTO_ATTACK_RANGE;
  attackCooldown: number = GameConfig.AUTO_ATTACK_COOLDOWN;
  projectileCount: number = 1;
  projectileSpeed: number = 400;
  lastAttack: number = 0;
  hpRegen: number = 0;
  armor: number = 0;

  private shadow!: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.body!.setSize(24, 24);
    this.body!.setOffset(4, 8);

    this.shadow = scene.add.image(x, y + 14, 'shadow');
    this.shadow.setDepth(1).setScale(0.7);

    this.scene.events.on('update', this.updateShadow, this);
    this.once('destroy', () => {
      this.scene?.events.off('update', this.updateShadow, this);
      this.shadow?.destroy();
    });
  }

  update(_time: number, _delta: number) {
    const gs = this.scene as any;
    if (!gs.wasd || !gs.cursors) return;

    let vx = 0, vy = 0;
    const w = gs.wasd;
    const c = gs.cursors;

    if (w.W.isDown || c.up.isDown) vy = -1;
    if (w.S.isDown || c.down.isDown) vy = 1;
    if (w.A.isDown || c.left.isDown) vx = -1;
    if (w.D.isDown || c.right.isDown) vx = 1;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx * this.speed, vy * this.speed);

    // Auto attack
    this.autoAttack();

    // Regen
    if (this.hpRegen > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this.hpRegen / 60);
    }
  }

  private autoAttack() {
    const now = this.scene.time.now;
    if (now - this.lastAttack < this.attackCooldown) return;

    const gs = this.scene as any;
    const enemies = gs.enemies?.getChildren() as Phaser.GameObjects.Sprite[] | undefined;
    if (!enemies || enemies.length === 0) return;

    // Find closest enemy in range
    let closest: Phaser.GameObjects.Sprite | null = null;
    let closestDist = Infinity;

    for (const e of enemies) {
      if (!e.active) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (dist < this.attackRange && dist < closestDist) {
        closest = e;
        closestDist = dist;
      }
    }

    if (!closest) return;
    this.lastAttack = now;

    // Fire projectile(s)
    const gs2 = this.scene as any;
    const angles = this.getSpreadAngles(this.projectileCount, Math.atan2(closest.y - this.y, closest.x - this.x));

    for (const angle of angles) {
      const proj = this.scene.add.image(this.x, this.y, 'projectile');
      this.scene.physics.add.existing(proj);
      proj.setDepth(15);

      const vx = Math.cos(angle) * this.projectileSpeed;
      const vy = Math.sin(angle) * this.projectileSpeed;
      (proj.body as Phaser.Physics.Arcade.Body).velocity.x = vx;
      (proj.body as Phaser.Physics.Arcade.Body).velocity.y = vy;

      (proj as any).damage = this.damage;

      gs2.projectiles.add(proj);

      this.scene.time.delayedCall(2000, () => {
        if (proj.active) proj.destroy();
      });
    }
  }

  private getSpreadAngles(count: number, baseAngle: number): number[] {
    if (count === 1) return [baseAngle];
    const spread = 0.3; // radians between shots
    const start = baseAngle - spread * (count - 1) / 2;
    return Array.from({ length: count }, (_, i) => start + spread * i);
  }

  takeDamage(amount: number) {
    const actual = Math.max(1, amount - this.armor);
    this.hp -= actual;
    // Flash
    this.setTintFill(0xff0000);
    this.scene.time.delayedCall(100, () => this.clearTint());

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  addXp(amount: number) {
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.floor(GameConfig.XP_BASE * Math.pow(GameConfig.XP_MULTIPLIER, this.level - 1));
      this.scene.events.emit('levelUp', this.level);
    }
  }

  private die() {
    this.setActive(false);
    (this.body as Phaser.Physics.Arcade.Body).velocity.x = 0;
    (this.body as Phaser.Physics.Arcade.Body).velocity.y = 0;
    this.setVisible(false);
    (this.scene as any).gameOver();
  }

  private updateShadow() {
    if (this.shadow && this.active) {
      this.shadow.setPosition(this.x, this.y + 14);
    }
  }
}
