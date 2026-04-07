import Phaser from 'phaser';

interface Upgrade {
  name: string;
  description: string;
  icon: string;
  apply: (player: any) => void;
}

const UPGRADES: Upgrade[] = [
  {
    name: 'Max HP +25',
    description: 'Increase max health by 25',
    icon: '❤️',
    apply: (p) => { p.maxHp += 25; p.hp += 25; },
  },
  {
    name: 'Damage +5',
    description: 'Increase projectile damage by 5',
    icon: '⚔️',
    apply: (p) => { p.damage += 5; },
  },
  {
    name: 'Speed +15%',
    description: 'Move faster',
    icon: '💨',
    apply: (p) => { p.speed *= 1.15; },
  },
  {
    name: 'Extra Projectile',
    description: 'Fire an additional projectile',
    icon: '🔫',
    apply: (p) => { p.projectileCount += 1; },
  },
  {
    name: 'Attack Speed +20%',
    description: 'Reduce attack cooldown',
    icon: '⚡',
    apply: (p) => { p.attackCooldown *= 0.8; },
  },
  {
    name: 'Range +20%',
    description: 'Increase auto-attack range',
    icon: '🎯',
    apply: (p) => { p.attackRange *= 1.2; },
  },
  {
    name: 'HP Regen +1/s',
    description: 'Regenerate health over time',
    icon: '💚',
    apply: (p) => { p.hpRegen += 1; },
  },
  {
    name: 'Armor +2',
    description: 'Reduce incoming damage',
    icon: '🛡️',
    apply: (p) => { p.armor += 2; },
  },
  {
    name: 'Full Heal',
    description: 'Restore all HP',
    icon: '💖',
    apply: (p) => { p.hp = p.maxHp; },
  },
  {
    name: 'Projectile Speed +15%',
    description: 'Faster projectiles',
    icon: '✨',
    apply: (p) => { p.projectileSpeed *= 1.15; },
  },
];

export class UpgradeSystem {
  private scene: Phaser.Scene;
  private choosing = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    scene.events.on('levelUp', this.showUpgrades, this);
  }

  private showUpgrades(level: number) {
    if (this.choosing) return;
    this.choosing = true;

    // Pause enemy movement
    const gs = this.scene as any;
    const enemies = gs.enemies?.getChildren() as any[];
    if (enemies) {
      for (const e of enemies) {
        if (e.body) e.body.setVelocity(0, 0);
      }
    }

    // Pick 3 random upgrades
    const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, 3);

    // Create overlay
    const overlay = this.scene.add.rectangle(
      this.scene.scale.width / 2, this.scene.scale.height / 2,
      this.scene.scale.width, this.scene.scale.height, 0x000000, 0.7
    ).setScrollFactor(0).setDepth(3000).setInteractive();

    const cx = this.scene.scale.width / 2;
    const cy = this.scene.scale.height / 2;

    this.scene.add.text(cx, cy - 140, `⬆️ LEVEL UP! (Lv.${level})`, {
      fontSize: '28px', fontFamily: 'monospace', color: '#f1c40f',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

    this.scene.add.text(cx, cy - 100, 'Choose an upgrade:', {
      fontSize: '16px', fontFamily: 'monospace', color: '#bdc3c7',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);

    const cardWidth = 180;
    const cardHeight = 120;
    const gap = 30;
    const totalWidth = choices.length * cardWidth + (choices.length - 1) * gap;
    const startX = cx - totalWidth / 2 + cardWidth / 2;

    const cards: Phaser.GameObjects.Container[] = [];

    choices.forEach((upgrade, i) => {
      const x = startX + i * (cardWidth + gap);
      const y = cy + 10;

      const bg = this.scene.add.rectangle(x, y, cardWidth, cardHeight, 0x2c3e50, 1)
        .setStrokeStyle(2, 0x7f8c8d).setScrollFactor(0).setDepth(3001);

      const icon = this.scene.add.text(x, y - 25, upgrade.icon, {
        fontSize: '36px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3002);

      const name = this.scene.add.text(x, y + 15, upgrade.name, {
        fontSize: '14px', fontFamily: 'monospace', color: '#ecf0f1',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3002);

      const desc = this.scene.add.text(x, y + 38, upgrade.description, {
        fontSize: '11px', fontFamily: 'monospace', color: '#95a5a6',
        stroke: '#000', strokeThickness: 1,
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(3002);

      const container = this.scene.add.container(0, 0, [bg, icon, name, desc]);
      container.setScrollFactor(0).setDepth(3001);
      container.setSize(cardWidth, cardHeight);
      container.setInteractive();

      bg.on('pointerover', () => {
        bg.setStrokeStyle(2, 0xf39c12);
        bg.setFillStyle(0x34495e, 1);
      });
      bg.on('pointerout', () => {
        bg.setStrokeStyle(2, 0x7f8c8d);
        bg.setFillStyle(0x2c3e50, 1);
      });
      bg.on('pointerdown', () => {
        upgrade.apply(gs.player);
        cleanup();
      });

      cards.push(container);
    });

    const cleanup = () => {
      overlay.destroy();
      for (const c of cards) c.destroy();
      this.choosing = false;
    };
  }
}
