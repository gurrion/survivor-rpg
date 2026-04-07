import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.generateTextures();
    this.scene.start('GameScene');
  }

  private generateTextures() {
    const g = this.add.graphics();

    // Player
    g.clear();
    g.fillStyle(0x3498db, 1);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x2980b9, 1);
    g.fillCircle(16, 16, 10);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(13, 12, 3);
    g.fillCircle(19, 12, 3);
    g.generateTexture('player', 32, 32);
    g.destroy();

    // Enemies
    const et = GameConfig.ENEMY_TYPES;
    for (const [key, cfg] of Object.entries(et)) {
      const s = cfg.size * 2 + 8;
      const gfx = this.add.graphics();
      gfx.fillStyle(cfg.color, 1);
      gfx.fillRoundedRect(4, 4, s - 8, s - 8, 6);
      gfx.fillStyle(0xffffff, 0.8);
      const eyeSize = key === 'boss' ? 4 : 3;
      gfx.fillCircle(s / 2 - 5, s / 2 - 2, eyeSize);
      gfx.fillCircle(s / 2 + 5, s / 2 - 2, eyeSize);
      gfx.fillStyle(0x000000, 1);
      gfx.fillCircle(s / 2 - 5, s / 2 - 2, eyeSize * 0.5);
      gfx.fillCircle(s / 2 + 5, s / 2 - 2, eyeSize * 0.5);
      gfx.generateTexture(`enemy_${key}`, s, s);
      gfx.destroy();
    }

    // Shadow
    const sg = this.add.graphics();
    sg.fillStyle(0x000000, 0.3);
    sg.fillEllipse(24, 24, 40, 20);
    sg.generateTexture('shadow', 48, 48);
    sg.destroy();

    // Projectile
    const pg = this.add.graphics();
    pg.fillStyle(0xf39c12, 1);
    pg.fillCircle(4, 4, 4);
    pg.generateTexture('projectile', 8, 8);
    pg.destroy();

    // Particles
    const partGfx = this.add.graphics();
    partGfx.fillStyle(0xffaa00, 1);
    partGfx.fillCircle(3, 3, 3);
    partGfx.generateTexture('particle', 6, 6);
    partGfx.destroy();

    // HP bar bg
    const hbg = this.add.graphics();
    hbg.fillStyle(0x333333, 1);
    hbg.fillRect(0, 0, 32, 4);
    hbg.generateTexture('hp_bar_bg', 32, 4);
    hbg.destroy();

    // HP bar fill
    const hfg = this.add.graphics();
    hfg.fillStyle(0xe74c3c, 1);
    hfg.fillRect(0, 0, 32, 4);
    hfg.generateTexture('hp_bar_fill', 32, 4);
    hfg.destroy();

    // Ground tile (isometric)
    const tileGfx = this.add.graphics();
    const ts = GameConfig.TILE_SIZE;
    // Draw diamond shape for isometric
    tileGfx.fillStyle(0x2d5a27, 0.6);
    tileGfx.beginPath();
    tileGfx.moveTo(ts / 2, 0);
    tileGfx.lineTo(ts, ts / 2);
    tileGfx.lineTo(ts / 2, ts);
    tileGfx.lineTo(0, ts / 2);
    tileGfx.closePath();
    tileGfx.fillPath();
    tileGfx.lineStyle(1, 0x1a3a15, 0.3);
    tileGfx.beginPath();
    tileGfx.moveTo(ts / 2, 0);
    tileGfx.lineTo(ts, ts / 2);
    tileGfx.lineTo(ts / 2, ts);
    tileGfx.lineTo(0, ts / 2);
    tileGfx.closePath();
    tileGfx.strokePath();
    tileGfx.generateTexture('tile', ts, ts);
    tileGfx.destroy();

    // Upgrade UI background
    const upgBg = this.add.graphics();
    upgBg.fillStyle(0x000000, 0.85);
    upgBg.fillRect(0, 0, 400, 300);
    upgBg.lineStyle(2, 0xf39c12, 1);
    upgBg.strokeRect(1, 1, 398, 298);
    upgBg.generateTexture('upgrade_bg', 400, 300);
    upgBg.destroy();
  }
}
