import "./style.css";
import Phaser from "phaser";

type Body = Phaser.Physics.Arcade.Body;

class EchoOfRuins extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyZ!: Phaser.Input.Keyboard.Key;
  private keyX!: Phaser.Input.Keyboard.Key;
  private keyC!: Phaser.Input.Keyboard.Key;

  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private relicJump!: Phaser.Physics.Arcade.Image;
  private relicDash!: Phaser.Physics.Arcade.Image;

  private canDoubleJump = false;
  private canDash = false;
  private jumpedOnce = false;
  private dashReady = true;
  private dashUntil = 0;
  private attackReady = true;

  private hp = 5;
  private spawn = { x: 120, y: 560 };
  private invulnUntil = 0;

  private hpText!: Phaser.GameObjects.Text;
  private relicText!: Phaser.GameObjects.Text;

  private bgmCtx?: AudioContext;
  private bgmSource?: AudioBufferSourceNode;

  preload() {
    this.createPixelTextures();
  }

  private createPixelTextures() {
    const g = this.add.graphics();

    // Hero (inspired silhouette/style from reference, not identical)
    g.fillStyle(0x111827, 1);
    g.fillRect(0, 0, 18, 28);
    g.fillStyle(0xe2e8f0, 1);
    g.fillRect(5, 2, 8, 6); // hair highlight
    g.fillStyle(0x7c3aed, 1);
    g.fillRect(4, 8, 10, 12); // coat core
    g.fillStyle(0x60a5fa, 1);
    g.fillRect(3, 20, 12, 7); // lower cloth
    g.generateTexture("hero_idle", 18, 28);
    g.clear();

    g.fillStyle(0x111827, 1); g.fillRect(0, 0, 18, 28);
    g.fillStyle(0xf8fafc, 1); g.fillRect(5, 2, 8, 6);
    g.fillStyle(0x8b5cf6, 1); g.fillRect(4, 8, 10, 12);
    g.fillStyle(0x93c5fd, 1); g.fillRect(2, 20, 12, 7);
    g.generateTexture("hero_run", 18, 28);
    g.clear();

    g.fillStyle(0xf43f5e, 1); g.fillRect(0, 0, 18, 18); g.generateTexture("enemy", 18, 18); g.clear();

    g.fillStyle(0x475569, 1); g.fillRect(0, 0, 32, 32); g.generateTexture("tile", 32, 32); g.clear();

    g.fillStyle(0xf59e0b, 1); g.fillTriangle(0, 16, 8, 0, 16, 16); g.generateTexture("spike", 16, 16); g.clear();

    g.fillStyle(0x22d3ee, 1); g.fillCircle(10, 10, 9); g.fillStyle(0xffffff, 0.8); g.fillCircle(7, 7, 3); g.generateTexture("relic_jump", 20, 20); g.clear();
    g.fillStyle(0x34d399, 1); g.fillCircle(10, 10, 9); g.fillStyle(0xffffff, 0.8); g.fillCircle(7, 7, 3); g.generateTexture("relic_dash", 20, 20); g.clear();

    g.destroy();
  }

  create() {
    this.physics.world.setBounds(0, 0, 3200, 800);
    this.cameras.main.setBounds(0, 0, 3200, 800);
    this.cameras.main.setBackgroundColor("#0b1120");

    this.buildLevel();

    this.player = this.physics.add.sprite(this.spawn.x, this.spawn.y, "hero_idle");
    this.player.setCollideWorldBounds(true);
    this.player.setSize(14, 26).setOffset(2, 2);
    (this.player.body as Body).allowGravity = true;
    (this.player.body as Body).setDragX(900);
    this.physics.resume();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyZ = this.input.keyboard!.addKey("Z");
    this.keyX = this.input.keyboard!.addKey("X");
    this.keyC = this.input.keyboard!.addKey("C");

    // 이동은 방향키만
    this.input.keyboard!.on("keydown-LEFT", () => this.player.setVelocityX(-180));
    this.input.keyboard!.on("keyup-LEFT", () => { if (!this.cursors.right.isDown) this.player.setVelocityX(0); });
    this.input.keyboard!.on("keydown-RIGHT", () => this.player.setVelocityX(180));
    this.input.keyboard!.on("keyup-RIGHT", () => { if (!this.cursors.left.isDown) this.player.setVelocityX(0); });

    // 액션 키
    this.input.keyboard!.on("keydown-X", () => this.handleJump());
    this.input.keyboard!.on("keydown-Z", () => this.handleDash());
    this.input.keyboard!.on("keydown-C", () => this.handleAttack());

    this.physics.add.collider(this.player, this.solids, () => {
      if ((this.player.body as Body).blocked.down) this.jumpedOnce = false;
    });

    const dashGate = this.children.getByName("dash_gate");
    if (dashGate) {
      this.physics.add.collider(this.player, dashGate as any, () => {
        if (this.canDash) ((dashGate as any).body as Body).enable = false;
      });
    }

    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.overlap(this.player, this.enemies, () => this.damage(1));
    this.physics.add.overlap(this.player, this.spikes, () => this.damage(1));

    this.physics.add.overlap(this.player, this.relicJump, (_p, r) => {
      (r as Phaser.Physics.Arcade.Image).destroy();
      this.canDoubleJump = true;
      this.relicText.setText("Relics: Wings ✓  Dash ✗");
      this.showToast("Wings acquired: Double Jump unlocked");
    });

    this.physics.add.overlap(this.player, this.relicDash, (_p, r) => {
      (r as Phaser.Physics.Arcade.Image).destroy();
      this.canDash = true;
      this.relicText.setText("Relics: Wings ✓  Dash ✓");
      this.showToast("Burst Sigil acquired: Dash unlocked");
    });

    const altar = this.add.rectangle(170, 560, 40, 70, 0x334155, 1).setName("altar");
    this.physics.add.existing(altar, true);
    this.physics.add.overlap(this.player, altar as any, () => {
      if (this.canDoubleJump && this.canDash) this.win();
    });

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.hpText = this.add.text(12, 10, "HP: 5", { fontFamily: "monospace", fontSize: "20px", color: "#e2e8f0" }).setScrollFactor(0);
    this.relicText = this.add.text(12, 36, "Relics: Wings ✗  Dash ✗", { fontFamily: "monospace", fontSize: "16px", color: "#93c5fd" }).setScrollFactor(0);
    this.add.text(12, 58, "Move ←/→ | Jump X | Dash Z | Attack C", { fontFamily: "monospace", fontSize: "14px", color: "#94a3b8" }).setScrollFactor(0);

    this.initBgmOnGesture();
  }

  private buildLevel() {
    this.solids = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.spikes = this.physics.add.staticGroup();

    // Ground
    for (let x = 0; x < 3200; x += 32) this.solids.create(x, 784, "tile").setOrigin(0, 0);

    // Platforms and gates (metroidvania-like backtracking)
    const plats = [
      // early staircase (no soft-lock)
      [160, 744], [192, 744], [224, 716], [256, 716], [288, 688], [320, 688], [352, 660], [384, 660], [416, 632], [448, 632],
      [220, 640], [260, 640], [520, 700], [552, 700], [584, 668], [616, 668], [648, 636], [680, 636], [900, 690], [932, 690], [964, 690],
      [1080, 620], [1112, 620], [1144, 620],
      [1280, 560], [1312, 560], [1600, 500], [1632, 500], [1664, 500],
      [2000, 690], [2032, 690], [2064, 690], [2320, 620], [2352, 620],
      [2600, 560], [2632, 560], [2664, 560], [2860, 500], [2892, 500],
    ];
    plats.forEach(([x, y]) => this.solids.create(x, y, "tile").setOrigin(0, 0));

    // Gate requiring double-jump (placed after first relic to avoid early soft-lock)
    for (let y = 560; y < 784; y += 32) this.solids.create(1520, y, "tile").setOrigin(0, 0);

    // Dash gate (invisible barrier unless dash unlocked)
    const dashGate = this.add.rectangle(1840, 680, 20, 200, 0x000000, 0).setName("dash_gate");
    this.physics.add.existing(dashGate, true);

    // Spikes
    for (let x = 1450; x < 1530; x += 16) this.spikes.create(x, 768, "spike").setOrigin(0, 0);
    for (let x = 2460; x < 2560; x += 16) this.spikes.create(x, 768, "spike").setOrigin(0, 0);

    // Relics (physics-enabled so overlap is reliable)
    this.relicJump = this.physics.add.image(1140, 586, "relic_jump");
    (this.relicJump.body as Body).allowGravity = false;
    this.relicDash = this.physics.add.image(2660, 526, "relic_dash");
    (this.relicDash.body as Body).allowGravity = false;

    // Enemies
    const e1 = this.enemies.create(980, 650, "enemy") as Phaser.Physics.Arcade.Image;
    const e2 = this.enemies.create(2100, 650, "enemy") as Phaser.Physics.Arcade.Image;
    e1.setVelocityX(65).setBounceX(1).setCollideWorldBounds(true);
    e2.setVelocityX(-70).setBounceX(1).setCollideWorldBounds(true);

    // Static body sync (after setOrigin changes)
    (this.solids as any).refresh?.();
    (this.spikes as any).refresh?.();
  }

  private damage(amount: number) {
    const now = this.time.now;
    if (now < this.invulnUntil) return;
    this.invulnUntil = now + 900;
    this.hp -= amount;
    this.hpText.setText("HP: " + this.hp);

    this.tweens.add({ targets: this.player, alpha: 0.3, yoyo: true, repeat: 5, duration: 70 });
    this.cameras.main.shake(90, 0.004);

    if (this.hp <= 0) {
      this.respawn();
    }
  }

  private respawn() {
    this.hp = 5;
    this.hpText.setText("HP: 5");
    this.player.setPosition(this.spawn.x, this.spawn.y);
    this.player.setVelocity(0, 0);
  }

  private showToast(msg: string) {
    const t = this.add.text(this.cameras.main.scrollX + 360, 140, msg, {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#f8fafc",
      backgroundColor: "#0f172a",
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0);
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 24, duration: 1200, onComplete: () => t.destroy() });
  }

  private win() {
    this.physics.pause();
    this.add.rectangle(this.cameras.main.scrollX + 480, 300, 560, 220, 0x020617, 0.88).setScrollFactor(0).setStrokeStyle(2, 0x334155);
    this.add.text(this.cameras.main.scrollX + 480, 280, "ECHO OF RUINS", { fontFamily: "monospace", fontSize: "44px", color: "#22d3ee" }).setOrigin(0.5).setScrollFactor(0);
    this.add.text(this.cameras.main.scrollX + 480, 340, "All relics returned.\nPress R to restart", { fontFamily: "monospace", fontSize: "24px", color: "#e2e8f0", align: "center" }).setOrigin(0.5).setScrollFactor(0);
    this.input.keyboard?.once("keydown-R", () => this.scene.restart());
  }

  private initBgmOnGesture() {
    const start = async () => {
      await this.startBgm();
      this.input.off("pointerdown", start);
      this.input.keyboard?.off("keydown", start as any);
    };
    this.input.on("pointerdown", start);
    this.input.keyboard?.on("keydown", start as any);
  }

  private async startBgm() {
    if (this.bgmSource) return;
    if (!this.bgmCtx) this.bgmCtx = new AudioContext();
    if (this.bgmCtx.state !== "running") await this.bgmCtx.resume();

    const buffer = this.makeChiptuneBuffer(this.bgmCtx, 16);
    const src = this.bgmCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const gain = this.bgmCtx.createGain();
    gain.gain.value = 0.22;

    src.connect(gain);
    gain.connect(this.bgmCtx.destination);
    src.start();
    this.bgmSource = src;
  }

  // 8-bit PCM style generated soundtrack
  private makeChiptuneBuffer(ctx: AudioContext, seconds: number) {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * seconds);
    const buffer = ctx.createBuffer(1, len, sr);
    const out = buffer.getChannelData(0);

    const bpm = 148;
    const stepS = 60 / bpm / 2; // 8th note
    const stepN = Math.floor(stepS * sr);

    const leadSeq = [52, 55, 59, 62, 64, 62, 59, 55, 50, 52, 55, 59, 57, 55, 52, 50];
    const bassSeq = [40, 40, 43, 43, 45, 45, 43, 43, 38, 38, 40, 40, 43, 43, 45, 45];

    const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const step = Math.floor(i / stepN) % leadSeq.length;
      const st = (i % stepN) / stepN;

      const lf = mtof(leadSeq[step]);
      const bf = mtof(bassSeq[step]);

      // pulse lead
      const pulse = ((t * lf) % 1 < 0.33 ? 1 : -1) * (1 - st * 0.7);
      // triangle bass
      const triPhase = (t * bf) % 1;
      const tri = (1 - 4 * Math.abs(Math.round(triPhase - 0.25) - (triPhase - 0.25))) * 0.8;
      // noise hat on off-beat
      const hat = (step % 2 === 1 && st < 0.2) ? (Math.random() * 2 - 1) * (1 - st / 0.2) : 0;

      let s = pulse * 0.42 + tri * 0.28 + hat * 0.12;

      // 8-bit quantization
      s = Math.max(-1, Math.min(1, s));
      s = Math.round(s * 127) / 127;
      out[i] = s;
    }

    return buffer;
  }

  private handleJump() {
    const body = this.player.body as Body;
    if (!body) return;
    if (body.blocked.down) {
      this.player.setVelocityY(-420);
      this.jumpedOnce = true;
    } else if (this.canDoubleJump && this.jumpedOnce) {
      this.player.setVelocityY(-390);
      this.jumpedOnce = false;
    }
  }

  private handleDash() {
    if (!this.canDash || !this.dashReady) return;
    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;
    const dir = left ? -1 : right ? 1 : (this.player.flipX ? -1 : 1);

    this.dashReady = false;
    this.dashUntil = this.time.now + 140;

    const body = this.player.body as Body;
    const moving = Math.abs(body.velocity.x) > 40 || left || right;
    const dashSpeed = moving ? (Math.abs(body.velocity.x) + 420) : 420;
    this.player.setVelocityX(dir * dashSpeed);

    this.time.delayedCall(220, () => (this.dashReady = true));
  }

  private handleAttack() {
    if (!this.attackReady) return;
    this.attackReady = false;

    const dir = this.player.flipX ? -1 : 1;
    const ax = this.player.x + dir * 26;
    const ay = this.player.y;

    const slash = this.add.rectangle(ax, ay, 28, 16, 0xa78bfa, 0.5);
    this.tweens.add({ targets: slash, alpha: 0, duration: 120, onComplete: () => slash.destroy() });

    this.enemies.children.iterate((o) => {
      const e = o as Phaser.Physics.Arcade.Image;
      if (!e || !e.active) return true;
      const dx = e.x - this.player.x;
      const inFront = dir > 0 ? dx > 0 : dx < 0;
      if (inFront && Math.abs(dx) < 42 && Math.abs(e.y - this.player.y) < 24) {
        e.destroy();
      }
      return true;
    });

    this.time.delayedCall(180, () => (this.attackReady = true));
  }

  update() {
    const body = this.player.body as Body;
    if (!body) return;

    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;

    let vx = body.velocity.x;

    if (this.time.now >= this.dashUntil) {
      if (left && !right) vx = -180;
      else if (right && !left) vx = 180;
      else if (Math.abs(vx) < 240) vx = 0;
      this.player.setVelocityX(vx);
    }

    if (vx < 0) this.player.flipX = true;
    if (vx > 0) this.player.flipX = false;
    this.player.setTexture(Math.abs(vx) > 0 ? "hero_run" : "hero_idle");
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: "app",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 700, x: 0 }, debug: false },
  },
  scene: [EchoOfRuins],
});
