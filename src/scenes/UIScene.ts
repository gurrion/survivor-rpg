import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { UpgradeSystem } from '../systems/UpgradeSystem';

export class UIScene extends Phaser.Scene {
  hpBar!: Phaser.GameObjects.Graphics;
  xpBar!: Phaser.GameObjects.Graphics;
  waveText!: Phaser.GameObjects.Text;
  levelText!: Phaser.GameObjects.Text;
  killsText!: Phaser.GameObjects.Text;
  timerText!: Phaser.GameObjects.Text;
  hpText!: Phaser.GameObjects.Text;

  gameOver = false;
  gameScene!: any;
  stats: any = {};

  constructor() {
    super({ key: 'UIScene' });
  }

  create(data: { gameScene: any; gameOver?: boolean; stats?: any }) {
    this.gameOver = !!data.gameOver;
    this.gameScene = data.gameScene;
    this.stats = data.stats || {};
    this.cameras.main.setBackgroundColor('transparent');

    if (this.gameOver) {
      this.showGameOver();
    } else {
      this.createHUD();
    }
  }

  private createHUD() {
    const w = this.scale.width;
    const h = this.scale.height;

    // HP bar background
    this.hpBar = this.add.graphics();
    this.hpBar.setScrollFactor(0).setDepth(1000);

    this.xpBar = this.add.graphics();
    this.xpBar.setScrollFactor(0).setDepth(1000);

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    };

    this.hpText = this.add.text(15, 8, '', textStyle).setScrollFactor(0).setDepth(1001);
    this.levelText = this.add.text(15, 30, '', textStyle).setScrollFactor(0).setDepth(1001);
    this.waveText = this.add.text(w - 200, 10, '', textStyle).setScrollFactor(0).setDepth(1001);
    this.killsText = this.add.text(w - 200, 30, '', textStyle).setScrollFactor(0).setDepth(1001);
    this.timerText = this.add.text(w / 2, 10, '', { ...textStyle, align: 'center' }).setScrollFactor(0).setDepth(1001);

    this.scale.on('resize', this.onResize, this);
  }

  private onResize() {
    if (this.waveText && this.killsText) {
      const w = this.scale.width;
      this.waveText.setX(w - 200);
      this.killsText.setX(w - 200);
      this.timerText.setX(w / 2);
    }
  }

  update() {
    if (this.gameOver || !this.gameScene?.player) return;

    const player = this.gameScene.player;
    const wave = this.gameScene.waveSystem;

    // HP bar
    const barX = 12;
    const barY = 28;
    const barW = 160;
    const barH = 8;

    this.hpBar.clear();
    this.hpBar.fillStyle(0x333333, 0.8);
    this.hpBar.fillRoundedRect(barX, barY, barW, barH, 3);
    const hpPct = Math.max(0, player.hp / player.maxHp);
    const hpColor = hpPct > 0.5 ? 0x2ecc71 : hpPct > 0.25 ? 0xf39c12 : 0xe74c3c;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRoundedRect(barX, barY, barW * hpPct, barH, 3);

    // XP bar
    const xpY = barY + 14;
    this.xpBar.clear();
    this.xpBar.fillStyle(0x333333, 0.8);
    this.xpBar.fillRoundedRect(barX, xpY, barW, 6, 3);
    const xpPct = player.xp / player.xpToNext;
    this.xpBar.fillStyle(0x3498db, 1);
    this.xpBar.fillRoundedRect(barX, xpY, barW * xpPct, 6, 3);

    this.hpText.setText(`HP: ${Math.ceil(player.hp)}/${player.maxHp}`);
    this.levelText.setText(`Lv.${player.level}  XP: ${player.xp}/${player.xpToNext}`);
    this.waveText.setText(`Wave: ${wave.currentWave}`);
    this.killsText.setText(`Kills: ${this.gameScene.stats.kills}`);

    const elapsed = Math.floor((Date.now() - this.gameScene.stats.timeAlive) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    this.timerText.setText(`${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`);
  }

  private showGameOver() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, 400, 350, 0x000000, 0.9).setDepth(2000);
    this.add.rectangle(cx, cy, 396, 346, 0x1a1a2e, 0.9).setDepth(2001);
    this.add.rectangle(cx, cy, 392, 342).setStrokeStyle(2, 0xf39c12).setDepth(2002);

    const title = this.add.text(cx, cy - 130, '💀 GAME OVER 💀', {
      fontSize: '32px', fontFamily: 'monospace', color: '#e74c3c',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(2003);

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '18px', fontFamily: 'monospace', color: '#ecf0f1',
      stroke: '#000', strokeThickness: 2,
    };

    const s = this.stats;
    const min = Math.floor(s.timeAlive / 60);
    const sec = s.timeAlive % 60;
    const lines = [
      `Wave: ${s.maxWave || 0}`,
      `Kills: ${s.kills || 0}`,
      `Boss Kills: ${s.bossKills || 0}`,
      `Damage: ${s.totalDamage || 0}`,
      `Time: ${min}m ${sec}s`,
    ];

    lines.forEach((line, i) => {
      this.add.text(cx, cy - 60 + i * 35, line, style).setOrigin(0.5).setDepth(2003);
    });

    // Restart button
    const btn = this.add.text(cx, cy + 140, '[ CLICK TO RESTART ]', {
      fontSize: '20px', fontFamily: 'monospace', color: '#f39c12',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(2003).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#f39c12'));
    btn.on('pointerdown', () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });
  }
}
