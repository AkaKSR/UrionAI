const W = Math.min(innerWidth, 480), H = innerHeight;

class S extends Phaser.Scene {
  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0f1412);

    this.p = this.add.circle(W / 2, H / 2, 10, 0x7dd3fc);
    this.physics.add.existing(this.p);

    this.flowers = [];
    this.score = 0;
    this.ui = this.add.text(10, 10, 'Bloom:0');

    this.c = this.input.keyboard.createCursorKeys();
    this.r = this.input.keyboard.addKey('R');

    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (this.over) return;
        const f = this.add.circle(
          Phaser.Math.Between(20, W - 20),
          Phaser.Math.Between(20, H - 20),
          7,
          0xf9a8d4
        );
        this.physics.add.existing(f, true);
        this.flowers.push(f);

        this.physics.add.overlap(this.p, f, () => {
          if (!f.active) return;
          f.destroy();
          this.score++;
          this.ui.setText('Bloom:' + this.score);
          if (this.score >= 30) this.end('CLEAR');
        });
      }
    });
  }

  end(m) {
    if (this.over) return;
    this.over = true;
    this.add.text(W / 2, H / 2, m + '\nR', { align: 'center' }).setOrigin(0.5);
  }

  update() {
    if (this.r.isDown) this.scene.restart();
    if (this.over) return;

    const b = this.p.body;
    b.setVelocity(0);
    if (this.c.left.isDown) b.setVelocityX(-180);
    else if (this.c.right.isDown) b.setVelocityX(180);
    if (this.c.up.isDown) b.setVelocityY(-180);
    else if (this.c.down.isDown) b.setVelocityY(180);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  physics: { default: 'arcade' },
  scene: [S]
});
