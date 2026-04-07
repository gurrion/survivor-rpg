import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Enemy } from '../entities/Enemy';

export class EnemySpawner {
  private scene: Phaser.Scene;
  spawnTimer: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  update(_time: number, delta: number) {
    this.spawnTimer -= delta;
  }

  spawnEnemy(type: string) {
    const gs = this.scene as any;
    const player = gs.player;
    if (!player || !player.active) return;

    // Spawn at edge of screen
    const angle = Math.random() * Math.PI * 2;
    const dist = 500 + Math.random() * 200;
    const x = Phaser.Math.Clamp(player.x + Math.cos(angle) * dist, 50, GameConfig.MAP_COLS * GameConfig.TILE_SIZE - 50);
    const y = Phaser.Math.Clamp(player.y + Math.sin(angle) * dist, 50, GameConfig.MAP_ROWS * GameConfig.TILE_SIZE - 50);

    const enemy = new Enemy(this.scene, x, y, type);
    gs.enemies.add(enemy);
  }

  spawnWave(wave: number) {
    const count = GameConfig.WAVE_BASE_ENEMIES + (wave - 1) * GameConfig.WAVE_ENEMY_INCREMENT;
    const isBossWave = wave % 5 === 0;

    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 300, () => {
        if (!this.scene.scene.isActive()) return;
        const roll = Math.random();
        let type = 'normal';
        if (wave >= 3 && roll < 0.15 + wave * 0.01) type = 'tank';
        else if (wave >= 2 && roll < 0.3 + wave * 0.02) type = 'fast';
        this.spawnEnemy(type);
      });
    }

    if (isBossWave) {
      this.scene.time.delayedCall(1000, () => {
        if (!this.scene.scene.isActive()) return;
        this.spawnEnemy('boss');
      });
    }
  }
}
