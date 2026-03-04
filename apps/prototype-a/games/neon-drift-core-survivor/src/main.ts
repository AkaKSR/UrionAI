import './style.css';
import Phaser from 'phaser';

type Difficulty = 'easy' | 'normal' | 'hard';
type Enemy = Phaser.Physics.Arcade.Image;
type Core = Phaser.Physics.Arcade.Image;
type Power = Phaser.Physics.Arcade.Image & { kind?: 'shield' | 'magnet' };

const API_BASE = window.location.protocol + '//' + window.location.hostname + ':4174';

const DIFF = {
  easy: { hp: 4, spawnMs: 1450, enemyBase: 62, enemyRamp: 1.4 },
  normal: { hp: 3, spawnMs: 1150, enemyBase: 72, enemyRamp: 1.7 },
  hard: { hp: 2, spawnMs: 900, enemyBase: 82, enemyRamp: 2.0 },
} as const;

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0b1020');

    const qs = new URLSearchParams(window.location.search);
    const play = qs.get('play') as Difficulty | null;
    if (play && (play === 'easy' || play === 'normal' || play === 'hard')) {
      this.scene.start('Game', { difficulty: play });
      return;
    }

    this.add.text(width / 2, 90, 'NEON DRIFT', { fontFamily: 'monospace', fontSize: '64px', color: '#22d3ee' }).setOrigin(0.5);
    this.add.text(width / 2, 152, 'Core Survivor', { fontFamily: 'monospace', fontSize: '28px', color: '#cbd5e1' }).setOrigin(0.5);
    this.add.text(width / 2, height - 86, 'PC: WASD/Arrow · Mobile: touch and drag', { fontFamily: 'monospace', fontSize: '18px', color: '#94a3b8' }).setOrigin(0.5);
    this.add.text(width / 2, height - 58, 'Hotkey: 1 Easy · 2 Normal · 3 Hard', { fontFamily: 'monospace', fontSize: '16px', color: '#64748b' }).setOrigin(0.5);

    const makeBtn = (y: number, label: string, difficulty: Difficulty) => {
      const box = this.add.rectangle(width / 2, y, 250, 62, 0x1e293b, 1).setStrokeStyle(2, 0x334155).setInteractive({ useHandCursor: true });
      const txt = this.add.text(width / 2, y, label, { fontFamily: 'monospace', fontSize: '36px', color: '#f8fafc' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      const go = () => { (window as any).__urionUnlock = true; this.scene.start('Game', { difficulty }); };
      box.on('pointerover', () => box.setFillStyle(0x334155, 1));
      box.on('pointerout', () => box.setFillStyle(0x1e293b, 1));
      box.on('pointerdown', go); box.on('pointerup', go);
      txt.on('pointerdown', go); txt.on('pointerup', go);
    };

    makeBtn(262, 'EASY', 'easy');
    makeBtn(334, 'NORMAL', 'normal');
    makeBtn(406, 'HARD', 'hard');

    this.input.keyboard?.on('keydown-ONE', () => { (window as any).__urionUnlock = true; this.scene.start('Game', { difficulty: 'easy' }); });
    this.input.keyboard?.on('keydown-TWO', () => { (window as any).__urionUnlock = true; this.scene.start('Game', { difficulty: 'normal' }); });
    this.input.keyboard?.on('keydown-THREE', () => { (window as any).__urionUnlock = true; this.scene.start('Game', { difficulty: 'hard' }); });
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  private player!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private enemies!: Phaser.Physics.Arcade.Group;
  private cores!: Phaser.Physics.Arcade.Group;
  private powers!: Phaser.Physics.Arcade.Group;

  private score = 0;
  private hp = 3;
  private elapsed = 0;
  private spawnTimer = 0;
  private difficulty: Difficulty = 'normal';

  private enemySpawnMs = 1100;
  private enemyBase = 70;
  private enemyRamp = 1.7;

  private scoreText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private stateText!: Phaser.GameObjects.Text;

  private invincibleUntil = 0;
  private touchPointer?: Phaser.Input.Pointer;
  private shieldUntil = 0;
  private magnetUntil = 0;

  private audioCtx?: AudioContext;
  private audioEnabled = true;
  private bgmTimer?: number;
  private bgmStep = 0;
  private bgmBar = 0;

  private bgmProgression = [
    [220, 247, 262, 294, 330, 294, 262, 247],
    [196, 220, 247, 262, 294, 262, 247, 220],
    [233, 262, 294, 330, 349, 330, 294, 262],
    [220, 247, 277, 311, 330, 311, 277, 247],
  ];

  init(data: { difficulty?: Difficulty }) {
    this.difficulty = data.difficulty ?? 'normal';
    this.hp = DIFF[this.difficulty].hp;
    this.enemySpawnMs = DIFF[this.difficulty].spawnMs;
    this.enemyBase = DIFF[this.difficulty].enemyBase;
    this.enemyRamp = DIFF[this.difficulty].enemyRamp;
  }

  preload() {
    const g = this.add.graphics();
    g.fillStyle(0x22d3ee, 1); g.fillCircle(16, 16, 14); g.generateTexture('player', 32, 32); g.clear();
    g.fillStyle(0xf43f5e, 1); g.fillCircle(12, 12, 10); g.generateTexture('enemy', 24, 24); g.clear();
    g.fillStyle(0xfacc15, 1); g.fillCircle(8, 8, 7); g.generateTexture('core', 16, 16); g.clear();
    g.fillStyle(0x60a5fa, 1); g.fillCircle(9, 9, 8); g.generateTexture('p_shield', 18, 18); g.clear();
    g.fillStyle(0x34d399, 1); g.fillCircle(9, 9, 8); g.generateTexture('p_magnet', 18, 18); g.destroy();
  }

  private initAudio() {
    if (!this.audioEnabled) return;
    try { this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
    catch { this.audioEnabled = false; }
  }

  private async unlockAudio() {
    if (!this.audioEnabled) return;
    if (!this.audioCtx) this.initAudio();
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state !== 'running') await this.audioCtx.resume();
      this.startBgm();
    } catch {}
  }

  private beep(freq: number, duration = 0.07, type: OscillatorType = 'sine', volume = 0.04) {
    if (!this.audioEnabled || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + duration);
  }

  private startBgm() {
    if (!this.audioEnabled || !this.audioCtx || this.bgmTimer) return;
    this.bgmStep = 0;
    this.bgmBar = 0;

    this.bgmTimer = window.setInterval(() => {
      if (!this.audioEnabled || !this.audioCtx) return;

      const section = Math.floor(this.bgmBar / 4) % this.bgmProgression.length;
      const notes = this.bgmProgression[section];
      const n = notes[this.bgmStep % notes.length];

      // Main melody with occasional octave shift for variation
      const octaveUp = (this.bgmBar % 8 === 7 && this.bgmStep % 4 === 3) ? 2 : 1;
      this.beep(n * octaveUp, 0.18, 'sawtooth', 0.11);

      // Bass pattern changes every other bar
      const bassMult = (this.bgmBar % 2 === 0) ? 0.5 : 0.75;
      if (this.bgmStep % 2 === 0) this.beep(n * bassMult, 0.18, 'square', 0.09); if (this.bgmStep % 2 === 1) this.beep(n * 0.5, 0.07, 'triangle', 0.03);

      // Light hi accent occasionally
      if (this.bgmStep % 4 === 2) this.beep(n * 1.5, 0.06, 'square', 0.018);

      this.bgmStep += 1;
      if (this.bgmStep >= 8) {
        this.bgmStep = 0;
        this.bgmBar += 1;
      }
    }, 165);
  }

  private stopBgm() {
    if (this.bgmTimer) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = undefined;
    }
  }

  private sfxCollect() { this.beep(880, 0.06, 'triangle', 0.035); }
  private sfxHit() { this.beep(180, 0.12, 'sawtooth', 0.05); }
  private sfxPower() { this.beep(620, 0.09, 'square', 0.04); this.beep(930, 0.08, 'triangle', 0.03); }
  private sfxGameOver() { this.beep(220, 0.18, 'sawtooth', 0.05); this.beep(140, 0.24, 'triangle', 0.04); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0b1020');
    this.initAudio();
    if ((window as any).__urionUnlock) { this.unlockAudio(); (window as any).__urionUnlock = false; }

    const bg = this.add.graphics();
    bg.lineStyle(1, 0x1f2a44, 0.4);
    for (let x = 0; x < width; x += 40) bg.lineBetween(x, 0, x, height);
    for (let y = 0; y < height; y += 40) bg.lineBetween(0, y, width, y);

    this.player = this.physics.add.image(width / 2, height / 2, 'player');
    this.player.setDamping(true).setDrag(0.9).setMaxVelocity(330).setCollideWorldBounds(true);

    this.enemies = this.physics.add.group();
    this.cores = this.physics.add.group();
    this.powers = this.physics.add.group();

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.wasd = keyboard.addKeys('W,A,S,D') as { [key: string]: Phaser.Input.Keyboard.Key };
      keyboard.on('keydown-M', () => {
        this.audioEnabled = !this.audioEnabled;
        if (this.audioEnabled) this.unlockAudio();
        else this.stopBgm();
      });
    } else {
      const dummy = { isDown: false } as Phaser.Input.Keyboard.Key;
      this.cursors = { up: dummy, down: dummy, left: dummy, right: dummy, space: dummy, shift: dummy } as Phaser.Types.Input.Keyboard.CursorKeys;
      this.wasd = { W: dummy, A: dummy, S: dummy, D: dummy };
    }

    this.scoreText = this.add.text(16, 12, 'Score: 0', { fontFamily: 'monospace', fontSize: '20px', color: '#e2e8f0' });
    this.hpText = this.add.text(16, 40, 'HP: ' + this.hp, { fontFamily: 'monospace', fontSize: '20px', color: '#e2e8f0' });
    this.timeText = this.add.text(16, 68, 'Time: 0s', { fontFamily: 'monospace', fontSize: '20px', color: '#e2e8f0' });
    this.stateText = this.add.text(16, 96, '', { fontFamily: 'monospace', fontSize: '18px', color: '#a7f3d0' });

    this.add.text(width - 16, 12, 'Mode: ' + this.difficulty.toUpperCase(), { fontFamily: 'monospace', fontSize: '18px', color: '#93c5fd' }).setOrigin(1, 0);
    this.add.text(width - 16, 36, 'Sound: M Toggle', { fontFamily: 'monospace', fontSize: '14px', color: '#64748b' }).setOrigin(1, 0);
    this.add.text(width / 2, height - 14, 'Click/tap once to enable BGM', { fontFamily: 'monospace', fontSize: '14px', color: '#94a3b8' }).setOrigin(0.5, 1);

    this.physics.add.overlap(this.player, this.cores, (_p, c) => {
      const core = c as Core;
      core.destroy();
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
      this.sfxCollect();
      const fx = this.add.circle(this.player.x, this.player.y, 8, 0xfacc15, 0.65);
      this.tweens.add({ targets: fx, radius: 34, alpha: 0, duration: 180, onComplete: () => fx.destroy() });
    });

    this.physics.add.overlap(this.player, this.powers, (_p, obj) => {
      const p = obj as Power;
      if (p.kind === 'shield') this.shieldUntil = this.time.now + 7000;
      if (p.kind === 'magnet') this.magnetUntil = this.time.now + 7000;
      p.destroy();
      this.sfxPower();
      const color = p.kind === 'shield' ? 0x60a5fa : 0x34d399;
      const ring = this.add.circle(this.player.x, this.player.y, 10, color, 0.5);
      this.tweens.add({ targets: ring, radius: 56, alpha: 0, duration: 250, onComplete: () => ring.destroy() });
    });

    this.physics.add.overlap(this.player, this.enemies, () => {
      if (this.hp <= 0) return;
      if (this.time.now < this.shieldUntil) {
        const pulse = this.add.circle(this.player.x, this.player.y, 12, 0x60a5fa, 0.45);
        this.tweens.add({ targets: pulse, radius: 28, alpha: 0, duration: 120, onComplete: () => pulse.destroy() });
        return;
      }
      if (this.time.now < this.invincibleUntil) return;

      this.hp -= 1;
      this.hpText.setText('HP: ' + this.hp);
      this.invincibleUntil = this.time.now + 900;
      this.sfxHit();
      this.tweens.add({ targets: this.player, alpha: 0.35, yoyo: true, duration: 90, repeat: 6 });
      const hit = this.add.circle(this.player.x, this.player.y, 12, 0xf43f5e, 0.7);
      this.tweens.add({ targets: hit, radius: 48, alpha: 0, duration: 180, onComplete: () => hit.destroy() });
      this.cameras.main.shake(80, 0.0035);
      if (this.hp <= 0) this.onGameOver();
    });

    this.time.addEvent({ delay: 1700, loop: true, callback: () => this.hp > 0 && this.spawnCore() });
    this.time.addEvent({ delay: 11000, loop: true, callback: () => this.hp > 0 && this.spawnPower() });
    this.spawnCore(); this.spawnCore();

    this.events.once('shutdown', () => this.stopBgm());
    this.input.keyboard?.once('keydown', () => this.unlockAudio());
    this.input.on('pointerdown', async (p: Phaser.Input.Pointer) => { this.touchPointer = p; await this.unlockAudio(); });
    this.input.on('pointerup', () => (this.touchPointer = undefined));
  }

  private spawnEnemy() {
    const { width, height } = this.scale;
    const edge = Phaser.Math.Between(0, 3);
    let x = 0, y = 0;
    if (edge === 0) { x = Phaser.Math.Between(0, width); y = -16; }
    else if (edge === 1) { x = width + 16; y = Phaser.Math.Between(0, height); }
    else if (edge === 2) { x = Phaser.Math.Between(0, width); y = height + 16; }
    else { x = -16; y = Phaser.Math.Between(0, height); }
    const enemy = this.enemies.create(x, y, 'enemy') as Enemy;
    enemy.setCircle(10, 2, 2);
    this.physics.moveToObject(enemy, this.player, this.enemyBase + Math.min(this.elapsed * this.enemyRamp, 180));
  }

  private spawnCore() {
    const { width, height } = this.scale;
    const core = this.cores.create(Phaser.Math.Between(30, width - 30), Phaser.Math.Between(30, height - 30), 'core') as Core;
    core.setCircle(7, 1, 1);
    this.tweens.add({ targets: core, scale: 1.25, yoyo: true, repeat: -1, duration: 520 });
    this.time.delayedCall(7000, () => core.active && core.destroy());
  }

  private spawnPower() {
    const { width, height } = this.scale;
    const kind: 'shield' | 'magnet' = Math.random() < 0.5 ? 'shield' : 'magnet';
    const tex = kind === 'shield' ? 'p_shield' : 'p_magnet';
    const p = this.powers.create(Phaser.Math.Between(36, width - 36), Phaser.Math.Between(36, height - 36), tex) as Power;
    p.kind = kind;
    this.tweens.add({ targets: p, alpha: 0.45, yoyo: true, repeat: -1, duration: 280 });
    this.time.delayedCall(6500, () => p.active && p.destroy());
  }

  private async submitScore() {
    const name = (localStorage.getItem('urion_player_name') || prompt('닉네임 입력(랭킹 저장)', 'H') || 'anon').slice(0, 12);
    localStorage.setItem('urion_player_name', name);
    try {
      await fetch(API_BASE + '/leaderboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score: this.score, survived: Math.floor(this.elapsed), difficulty: this.difficulty }),
      });
      const top = await fetch(API_BASE + '/leaderboard?difficulty=' + this.difficulty).then((r) => r.json());
      const lines = top.slice(0, 5).map((r: any, i: number) => (i + 1) + '. ' + r.name + ' ' + r.score);
      this.add.text(this.scale.width / 2, this.scale.height / 2 + 170, 'TOP 5 (' + this.difficulty + ')\n' + (lines.join('\n') || 'No scores'), {
        fontFamily: 'monospace', fontSize: '20px', color: '#f8fafc', align: 'center',
      }).setOrigin(0.5);
    } catch {
      this.add.text(this.scale.width / 2, this.scale.height / 2 + 170, '랭킹 서버 연결 실패', {
        fontFamily: 'monospace', fontSize: '20px', color: '#fca5a5',
      }).setOrigin(0.5);
    }
  }

  private onGameOver() {
    this.stopBgm();
    this.player.setVelocity(0, 0).setTint(0x64748b);
    this.sfxGameOver();
    const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 540, 250, 0x020617, 0.82).setStrokeStyle(2, 0x334155);
    panel.setDepth(20);
    this.add.text(this.scale.width / 2, this.scale.height / 2 - 62, 'GAME OVER', { fontFamily: 'monospace', fontSize: '46px', color: '#f8fafc' }).setOrigin(0.5).setDepth(21);
    this.add.text(this.scale.width / 2, this.scale.height / 2 + 4,
      'Score: ' + this.score + '\nSurvived: ' + Math.floor(this.elapsed) + 's\nR: Restart    N: Menu',
      { fontFamily: 'monospace', fontSize: '24px', color: '#cbd5e1', align: 'center' }
    ).setOrigin(0.5).setDepth(21);
    this.submitScore();
    this.input.keyboard?.once('keydown-R', () => this.scene.restart({ difficulty: this.difficulty }));
    this.input.keyboard?.once('keydown-N', () => this.scene.start('Menu'));
  }

  update(_: number, delta: number) {
    if (this.hp <= 0) return;

    this.elapsed += delta / 1000;
    this.timeText.setText('Time: ' + Math.floor(this.elapsed) + 's');

    const states: string[] = [];
    if (this.time.now < this.shieldUntil) states.push('SHIELD');
    if (this.time.now < this.magnetUntil) states.push('MAGNET');
    this.stateText.setText(states.length ? 'Buff: ' + states.join(' + ') : '');

    const accel = 16;
    if (this.cursors.left?.isDown || this.wasd.A?.isDown) this.player.setVelocityX(this.player.body!.velocity.x - accel);
    if (this.cursors.right?.isDown || this.wasd.D?.isDown) this.player.setVelocityX(this.player.body!.velocity.x + accel);
    if (this.cursors.up?.isDown || this.wasd.W?.isDown) this.player.setVelocityY(this.player.body!.velocity.y - accel);
    if (this.cursors.down?.isDown || this.wasd.S?.isDown) this.player.setVelocityY(this.player.body!.velocity.y + accel);

    if (this.touchPointer?.isDown) {
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.touchPointer.worldX, this.touchPointer.worldY);
      const speed = 220;
      this.player.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    if (this.time.now < this.magnetUntil) {
      this.cores.children.iterate((obj) => {
        const core = obj as Core;
        if (!core?.active) return true;
        this.physics.moveToObject(core, this.player, 140);
        return true;
      });
    }

    this.spawnTimer += delta;
    const dynamicSpawn = Math.max(270, this.enemySpawnMs - this.elapsed * 9);
    if (this.spawnTimer >= dynamicSpawn) { this.spawnTimer = 0; this.spawnEnemy(); }

    this.enemies.children.iterate((obj) => {
      const enemy = obj as Enemy;
      if (!enemy?.active) return true;
      this.physics.moveToObject(enemy, this.player, this.enemyBase + Math.min(this.elapsed * this.enemyRamp, 180));
      return true;
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'app',
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [MenuScene, GameScene],
});
