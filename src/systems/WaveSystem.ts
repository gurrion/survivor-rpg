import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class WaveSystem {
  private scene: Phaser.Scene;
  currentWave: number = 0;
  waveState: 'waiting' | 'active' | 'cleared' = 'waiting';
  waveTimer: number = 3000; // first wave starts quickly
  private waveStartDelay = GameConfig.WAVE_DELAY;
  enemiesThisWave: number = 0;
  enemiesKilledThisWave: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  update(_time: number, delta: number) {
    if (this.waveState === 'waiting') {
      this.waveTimer -= delta;
      if (this.waveTimer <= 0) {
        this.startWave();
      }
    } else if (this.waveState === 'active') {
      this.checkWaveCleared();
    } else if (this.waveState === 'cleared') {
      this.waveTimer -= delta;
      if (this.waveTimer <= 0) {
        this.startWave();
      }
    }
  }

  private startWave() {
    this.currentWave++;
    this.waveState = 'active';
    this.enemiesKilledThisWave = 0;

    const gs = this.scene as any;
    const totalEnemies = GameConfig.WAVE_BASE_ENEMIES + (this.currentWave - 1) * GameConfig.WAVE_ENEMY_INCREMENT;
    if (this.currentWave % 5 === 0) totalEnemies + 1; // boss
    this.enemiesThisWave = totalEnemies;

    // Scale enemy stats with wave
    this.scaleEnemies(this.currentWave);

    gs.enemySpawner.spawnWave(this.currentWave);
    (gs as any).stats.maxWave = this.currentWave;

    this.showWaveText();
  }

  private scaleEnemies(wave: number) {
    const gs = this.scene as any;
    const enemies = gs.enemies?.getChildren() as any[];
    if (!enemies) return;

    const mult = 1 + (wave - 1) * 0.15;
    for (const e of enemies) {
      e.hp = Math.floor(e.maxHp * mult);
      e.maxHp = e.hp;
      e.damage = Math.floor(e.damage * (1 + (wave - 1) * 0.1));
    }
  }

  private checkWaveCleared() {
    const gs = this.scene as any;
    const enemies = gs.enemies?.getChildren() as any[];
    const alive = enemies?.filter((e: any) => e.active).length || 0;

    if (alive === 0) {
      this.waveState = 'cleared';
      this.waveTimer = this.waveStartDelay;
    }
  }

  private showWaveText() {
    const gs = this.scene as any;
    const cam = gs.cameras.main;
    const text = this.scene.add.text(cam.scrollX + cam.width / 2, cam.scrollY + cam.height / 2 - 50,
      this.currentWave % 5 === 0
        ? `⚔️ WAVE ${this.currentWave} — BOSS! ⚔️`
        : `⚔️ WAVE ${this.currentWave}`,
      {
        fontSize: this.currentWave % 5 === 0 ? '48px' : '36px',
        fontFamily: 'monospace',
        color: this.currentWave % 5 === 0 ? '#ff00ff' : '#f39c12',
        stroke: '#000',
        strokeThickness: 6,
      }
    ).setOrigin(0.5).setDepth(500).setScrollFactor(0);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }
}
