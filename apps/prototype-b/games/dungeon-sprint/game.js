const W = Math.min(innerWidth, 480), H = innerHeight;

class Dungeon extends Phaser.Scene {
  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x1b1b1b);

    this.score = 0;
    this.hp = 3;
    this.speed = 170;
    this.over = false;
    this.ui = this.add.text(10, 10, 'HP:3  Score:0', { fontSize: '16px' });

    this.player = this.add.rectangle(W / 2, H / 2, 22, 22, 0x4cff6a);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    this.enemies = [];
    this.coins = [];

    this.spawnEnemy();
    this.spawnEnemy();
    for (let i = 0; i < 7; i++) this.spawnCoin();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey('R');

    this.touchX = W / 2;
    this.touchY = H / 2;
    this.input.on('pointermove', p => {
      if (p.isDown) {
        this.touchX = p.x;
        this.touchY = p.y;
      }
    });
    this.input.on('pointerdown', p => {
      this.touchX = p.x;
      this.touchY = p.y;
    });
  }

  spawnEnemy() {
    const side = Phaser.Math.Between(0, 3);
    let x = 0, y = 0;
    if (side === 0) { x = 0; y = Phaser.Math.Between(0, H); }
    if (side === 1) { x = W; y = Phaser.Math.Between(0, H); }
    if (side === 2) { x = Phaser.Math.Between(0, W); y = 0; }
    if (side === 3) { x = Phaser.Math.Between(0, W); y = H; }

    const e = this.add.rectangle(x, y, 20, 20, 0xff5a5a);
    this.physics.add.existing(e);
    this.enemies.push(e);

    this.physics.add.overlap(this.player, e, () => this.hit());
  }

  spawnCoin() {
    const c = this.add.circle(
      Phaser.Math.Between(20, W - 20),
      Phaser.Math.Between(50, H - 20),
      7,
      0xffd84d
    );
    this.physics.add.existing(c, true);
    this.coins.push(c);

    this.physics.add.overlap(this.player, c, () => {
      if (!c.active || this.over) return;
      c.destroy();
      this.score++;
      this.ui.setText(`HP:${this.hp}  Score:${this.score}`);
      this.spawnCoin();
      if (this.score % 5 === 0) this.spawnEnemy();
    });
  }

  hit() {
    if (this.invuln || this.over) return;
    this.hp--;
    this.invuln = true;
    this.ui.setText(`HP:${this.hp}  Score:${this.score}`);

    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      yoyo: true,
      repeat: 5,
      duration: 60,
      onComplete: () => {
        this.player.alpha = 1;
        this.invuln = false;
      }
    });

    if (this.hp <= 0) {
      this.over = true;
      this.add.text(W / 2, H / 2, 'GAME OVER\nR: restart', { align: 'center' }).setOrigin(0.5);
    }
  }

  update() {
    if (this.keyR.isDown) this.scene.restart();
    if (this.over) return;

    const b = this.player.body;
    b.setVelocity(0);
    if (this.cursors.left.isDown) b.setVelocityX(-this.speed);
    else if (this.cursors.right.isDown) b.setVelocityX(this.speed);
    if (this.cursors.up.isDown) b.setVelocityY(-this.speed);
    else if (this.cursors.down.isDown) b.setVelocityY(this.speed);

    if (this.input.activePointer.isDown) {
      const dx = this.touchX - this.player.x;
      const dy = this.touchY - this.player.y;
      const len = Math.hypot(dx, dy) || 1;
      b.setVelocity((dx / len) * this.speed, (dy / len) * this.speed);
    }

    this.enemies = this.enemies.filter(e => e.active);
    this.enemies.forEach(e => {
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const len = Math.hypot(dx, dy) || 1;
      e.body.setVelocity((dx / len) * (68 + this.score * 1.6), (dy / len) * (68 + this.score * 1.6));
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [Dungeon]
});
