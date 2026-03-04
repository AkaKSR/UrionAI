import "./style.css";
import Phaser from "phaser";

type Ob = Phaser.Physics.Arcade.Image;

class HighwayRush extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private lanes = [220, 360, 500, 640, 780];
  private laneIndex = 2;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private stars!: Phaser.Physics.Arcade.Group;

  private score = 0;
  private speed = 330;
  private alive = true;
  private spawnMs = 820;
  private spawnTick = 0;

  private scoreText!: Phaser.GameObjects.Text;

  private audioCtx?: AudioContext;
  private audioEnabled = true;
  private bgmTimer?: number;
  private bgmStep = 0;

  preload() {
    const g = this.add.graphics();
    g.fillStyle(0x06b6d4, 1); g.fillRoundedRect(0, 0, 46, 72, 10);
    g.fillStyle(0x0f172a, 0.9); g.fillRoundedRect(8, 10, 30, 18, 5);
    g.fillStyle(0xe2e8f0, 0.9); g.fillRoundedRect(10, 46, 26, 16, 4);
    g.generateTexture("car_player", 46, 72); g.clear();

    g.fillStyle(0xef4444, 1); g.fillRoundedRect(0, 0, 46, 72, 10);
    g.fillStyle(0x1f2937, 0.9); g.fillRoundedRect(8, 10, 30, 18, 5);
    g.fillStyle(0xfca5a5, 0.9); g.fillRoundedRect(10, 46, 26, 16, 4);
    g.generateTexture("car_enemy", 46, 72); g.clear();

    g.fillStyle(0xfacc15, 1); g.fillCircle(8, 8, 8);
    g.fillStyle(0xffffff, 0.6); g.fillCircle(6, 6, 3);
    g.generateTexture("star", 16, 16); g.destroy();
  }

  private resetRunState() {
    this.score = 0;
    this.speed = 330;
    this.alive = true;
    this.spawnMs = 820;
    this.spawnTick = 0;
    this.laneIndex = 2;
    this.stopBgm();
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
      if (this.audioCtx.state !== "running") await this.audioCtx.resume();
      this.startBgm();
    } catch {}
  }

  private beep(freq: number, duration = 0.08, type: OscillatorType = "sine", volume = 0.05) {
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
    const progression = [
      [220, 247, 262, 294, 330, 294, 262, 247],
      [196, 220, 247, 262, 294, 262, 247, 220],
      [233, 262, 294, 330, 349, 330, 294, 262],
      [220, 247, 277, 311, 330, 311, 277, 247],
    ];
    this.bgmStep = 0;
    this.bgmTimer = window.setInterval(() => {
      if (!this.audioEnabled || !this.audioCtx) return;
      const section = Math.floor(this.bgmStep / 8) % progression.length;
      const notes = progression[section];
      const n = notes[this.bgmStep % 8];
      this.beep(n, 0.16, "triangle", 0.08);
      if (this.bgmStep % 2 === 0) this.beep(n * 0.5, 0.14, "sine", 0.05);
      if (this.bgmStep % 4 === 3) this.beep(n * 1.5, 0.05, "square", 0.02);
      this.bgmStep = (this.bgmStep + 1) % 32;
    }, 170);
  }

  private stopBgm() {
    if (this.bgmTimer) { window.clearInterval(this.bgmTimer); this.bgmTimer = undefined; }
  }

  private sfxMove() { this.beep(420, 0.04, "square", 0.025); }
  private sfxCollect() { this.beep(920, 0.07, "triangle", 0.05); }
  private sfxCrash() { this.beep(150, 0.18, "sawtooth", 0.08); }

  create() {
    this.resetRunState();
    const width = this.scale.width;
    const height = this.scale.height;
    this.cameras.main.setBackgroundColor("#0f172a");
    this.initAudio();

    const road = this.add.graphics();
    road.fillStyle(0x111827, 1); road.fillRect(130, 0, width - 260, height);
    road.lineStyle(2, 0x334155, 0.8);
    for (const x of this.lanes) road.lineBetween(x - 70, 0, x - 70, height);
    road.lineBetween(130, 0, 130, height); road.lineBetween(width - 130, 0, width - 130, height);

    this.player = this.physics.add.image(this.lanes[this.laneIndex], 520, "car_player").setImmovable(true);
    (this.player.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    this.physics.resume();

    this.obstacles = this.physics.add.group();
    this.stars = this.physics.add.group();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard?.on("keydown-A", () => this.moveLeft());
    this.input.keyboard?.on("keydown-D", () => this.moveRight());
    this.input.keyboard?.on("keydown-M", () => { this.audioEnabled = !this.audioEnabled; if (this.audioEnabled) this.unlockAudio(); else this.stopBgm(); });

    this.input.on("pointerdown", async (p: Phaser.Input.Pointer) => {
      await this.unlockAudio();
      if (p.x < width / 2) this.moveLeft(); else this.moveRight();
    });
    this.input.keyboard?.once("keydown", () => this.unlockAudio());

    this.add.text(16, 8, "HIGHWAY RUSH", { fontFamily: "monospace", fontSize: "28px", color: "#22d3ee" });
    this.scoreText = this.add.text(16, 42, "Score: 0", { fontFamily: "monospace", fontSize: "24px", color: "#e2e8f0" });
    this.add.text(16, 72, "Speed: 0", { fontFamily: "monospace", fontSize: "18px", color: "#94a3b8" }).setName("speedHud");
    this.add.text(width - 16, 10, "←/→ or A/D\nTouch Left/Right\nM: Sound", { fontFamily: "monospace", fontSize: "16px", color: "#94a3b8", align: "right" }).setOrigin(1, 0);

    this.physics.add.overlap(this.player, this.obstacles, () => this.gameOver());
    this.physics.add.overlap(this.player, this.stars, (_p, s) => {
      (s as Ob).destroy();
      this.score += 30;
      this.scoreText.setText("Score: " + Math.floor(this.score));
    const speedHud = this.children.getByName("speedHud") as Phaser.GameObjects.Text | null;
    if (speedHud) speedHud.setText("Speed: " + Math.floor(this.speed));
      this.sfxCollect();
      const fx = this.add.circle(this.player.x, this.player.y, 8, 0xfacc15, 0.7);
      this.tweens.add({ targets: fx, radius: 30, alpha: 0, duration: 160, onComplete: () => fx.destroy() });
    });

    this.events.once("shutdown", () => this.stopBgm());
  }

  private moveLeft() {
    if (!this.alive) return;
    const prev = this.laneIndex;
    this.laneIndex = Math.max(0, this.laneIndex - 1);
    if (prev !== this.laneIndex) this.sfxMove();
    this.tweens.add({ targets: this.player, x: this.lanes[this.laneIndex], duration: 90, ease: "Sine.Out" });
  }

  private moveRight() {
    if (!this.alive) return;
    const prev = this.laneIndex;
    this.laneIndex = Math.min(this.lanes.length - 1, this.laneIndex + 1);
    if (prev !== this.laneIndex) this.sfxMove();
    this.tweens.add({ targets: this.player, x: this.lanes[this.laneIndex], duration: 90, ease: "Sine.Out" });
  }

  private spawnObstacle() {
    const lane = Phaser.Math.Between(0, this.lanes.length - 1);
    const ob = this.obstacles.create(this.lanes[lane], -70, "car_enemy") as Ob;
    ob.setVelocityY(this.speed);
    (ob.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    if (Math.random() < 0.24) {
      const st = this.stars.create(this.lanes[lane], -130, "star") as Ob;
      st.setVelocityY(this.speed + 20);
      (st.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    }
  }

  private gameOver() {
    if (!this.alive) return;
    this.alive = false;
    this.physics.pause();
    this.stopBgm();
    this.sfxCrash();

    this.add.rectangle(500, 360, 560, 250, 0x020617, 0.86).setStrokeStyle(2, 0x334155);
    this.add.text(500, 315, "CRASH!", { fontFamily: "monospace", fontSize: "64px", color: "#f8fafc" }).setOrigin(0.5);
    this.add.text(500, 392, "Final Score: " + Math.floor(this.score) + "\nPress R to retry", { fontFamily: "monospace", fontSize: "28px", color: "#cbd5e1", align: "center" }).setOrigin(0.5);

    this.input.keyboard?.once("keydown-R", () => this.scene.restart());
  }

  update(_: number, dt: number) {
    if (!this.alive) return;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.moveLeft();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.moveRight();

    this.score += dt * 0.01;
    this.scoreText.setText("Score: " + Math.floor(this.score));
    const speedHud = this.children.getByName("speedHud") as Phaser.GameObjects.Text | null;
    if (speedHud) speedHud.setText("Speed: " + Math.floor(this.speed));

    this.speed = 320 + Math.min(900, this.score * 1.4);
    this.spawnMs = Math.max(170, 820 - this.score * 1.15);
    this.spawnTick += dt;
    if (this.spawnTick >= this.spawnMs) { this.spawnTick = 0; this.spawnObstacle(); }

    this.obstacles.children.iterate((o) => {
      const ob = o as Ob;
      if (!ob || !ob.active) return true;
      ob.setVelocityY(this.speed);
      if (ob.y > 820) ob.destroy();
      return true;
    });

    this.stars.children.iterate((o) => {
      const st = o as Ob;
      if (!st || !st.active) return true;
      st.setVelocityY(this.speed + 20);
      if (st.y > 820) st.destroy();
      return true;
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 1000,
  height: 720,
  parent: "app",
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [HighwayRush],
});
