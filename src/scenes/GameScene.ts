import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../systems/EnemySpawner';
import { WaveSystem } from '../systems/WaveSystem';
import { DamageNumberSystem } from '../systems/DamageNumberSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { ParticleSystem } from '../systems/ParticleSystem';

export class GameScene extends Phaser.Scene {
  player!: Player;
  enemySpawner!: EnemySpawner;
  waveSystem!: WaveSystem;
  damageNumbers!: DamageNumberSystem;
  upgradeSystem!: UpgradeSystem;
  particleSystem!: ParticleSystem;

  enemies: Phaser.GameObjects.Group = new Phaser.GameObjects.Group(this);
  projectiles: Phaser.GameObjects.Group = new Phaser.GameObjects.Group(this);

  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  worldWidth: number = GameConfig.MAP_COLS * GameConfig.TILE_SIZE;
  worldHeight: number = GameConfig.MAP_ROWS * GameConfig.TILE_SIZE;

  stats = {
    kills: 0,
    totalDamage: 0,
    timeAlive: 0,
    maxWave: 0,
    bossKills: 0,
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.drawGround();
    this.initInput();

    this.player = new Player(this, this.worldWidth / 2, this.worldHeight / 2);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.damageNumbers = new DamageNumberSystem(this);
    this.particleSystem = new ParticleSystem(this);

    this.enemySpawner = new EnemySpawner(this);
    this.waveSystem = new WaveSystem(this);
    this.upgradeSystem = new UpgradeSystem(this);

    // Collisions
    this.physics.add.overlap(this.projectiles, this.enemies, this.onProjectileHit, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, undefined, this);

    // HUD scene
    this.scene.launch('UIScene', { gameScene: this });

    this.stats.timeAlive = Date.now();
  }

  private drawGround() {
    const ts = GameConfig.TILE_SIZE;
    // Tile the ground
    for (let y = 0; y < GameConfig.MAP_ROWS; y++) {
      for (let x = 0; x < GameConfig.MAP_COLS; x++) {
        // Alternate tile shade slightly
        const isDark = (x + y) % 2 === 0;
        const tile = this.add.image(x * ts + ts / 2, y * ts + ts / 2, 'tile');
        if (isDark) tile.setAlpha(0.7);
        tile.setDepth(-1);
      }
    }
  }

  private initInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(time: number, delta: number) {
    if (!this.player.active) return;
    this.player.update(time, delta);
    this.enemySpawner.update(time, delta);
    this.waveSystem.update(time, delta);
  }

  onProjectileHit(projectile: any, enemy: any) {
    if (!projectile.active || !enemy.active) return;
    const dmg = projectile.damage || GameConfig.PLAYER_DAMAGE;
    enemy.takeDamage(dmg);
    this.stats.totalDamage += dmg;
    this.damageNumbers.show(enemy.x, enemy.y, dmg, '#ffaa00');
    this.particleSystem.burst(enemy.x, enemy.y, 0xf39c12, 3);
    projectile.destroy();
  }

  onPlayerHit(_playerObj: any, enemy: any) {
    if (!enemy.active || !this.player.active || !enemy.canDamage) return;
    enemy.canDamage = false;
    this.time.delayedCall(500, () => { enemy.canDamage = true; });
    this.player.takeDamage(enemy.damage);
    this.damageNumbers.show(this.player.x, this.player.y, enemy.damage, '#ff4444');
    this.particleSystem.burst(this.player.x, this.player.y, 0xff4444, 4);
  }

  addKill(enemy: any) {
    this.stats.kills++;
    if (enemy.isBoss) this.stats.bossKills++;
  }

  gameOver() {
    this.stats.timeAlive = Math.floor((Date.now() - this.stats.timeAlive) / 1000);
    this.scene.stop('UIScene');
    this.scene.start('UIScene', { gameScene: this, gameOver: true, stats: this.stats });
  }
}
