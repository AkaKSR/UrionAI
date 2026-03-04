const W = Math.min(window.innerWidth, 480);
const H = window.innerHeight;

class MainScene extends Phaser.Scene {
  constructor(){ super('main'); }
  create(){
    this.score = 0;
    this.speed = 200;
    this.gameOver = false;

    this.add.rectangle(W/2, H/2, W, H, 0x0f1022);
    this.add.text(12, 40, 'Neon Dodger', {fontSize:'20px', color:'#84f7ff'});
    this.scoreText = this.add.text(12, 66, 'Score: 0', {fontSize:'16px', color:'#ffffff'});

    this.player = this.add.rectangle(W/2, H-80, 32, 32, 0x48ff96).setStrokeStyle(2,0xffffff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    this.obstacles = this.physics.add.group();
    this.spawnTimer = this.time.addEvent({delay:700, callback:this.spawnObstacle, callbackScope:this, loop:true});

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey('R');

    this.physics.add.overlap(this.player, this.obstacles, ()=>this.endGame(), null, this);

    this.input.on('pointermove', (p)=>{
      if (!p.isDown || this.gameOver) return;
      this.player.x = Phaser.Math.Clamp(p.x, 16, W-16);
    });
    this.input.on('pointerdown', (p)=>{
      if (this.gameOver) return;
      this.player.x = Phaser.Math.Clamp(p.x, 16, W-16);
    });

    this.time.addEvent({delay:1000, loop:true, callback:()=>{
      if(this.gameOver) return;
      this.score += 1;
      this.speed = Math.min(360, this.speed + 2);
      this.scoreText.setText(`Score: ${this.score}`);
    }});
  }

  spawnObstacle(){
    if(this.gameOver) return;
    const x = Phaser.Math.Between(18, W-18);
    const w = Phaser.Math.Between(20, 50);
    const h = Phaser.Math.Between(20, 50);
    const obs = this.add.rectangle(x, -40, w, h, 0xff4d6d).setStrokeStyle(2,0xffffff);
    this.physics.add.existing(obs);
    obs.body.setVelocityY(this.speed + Phaser.Math.Between(0, 100));
    obs.body.setImmovable(true);
    this.obstacles.add(obs);
  }

  endGame(){
    if(this.gameOver) return;
    this.gameOver = true;
    this.spawnTimer.remove(false);
    this.add.rectangle(W/2, H/2, W*0.8, 120, 0x000000, 0.7);
    this.add.text(W/2, H/2-20, 'GAME OVER', {fontSize:'28px', color:'#ff7b9c'}).setOrigin(0.5);
    this.add.text(W/2, H/2+18, `점수 ${this.score} · R 키로 재시작`, {fontSize:'16px', color:'#fff'}).setOrigin(0.5);
  }

  update(){
    if(this.keyR.isDown){ this.scene.restart(); return; }
    if(this.gameOver) return;

    const body = this.player.body;
    body.setVelocityX(0);
    if(this.cursors.left.isDown) body.setVelocityX(-320);
    else if(this.cursors.right.isDown) body.setVelocityX(320);

    this.obstacles.getChildren().forEach(o=>{ if(o.y > H+60){ o.destroy(); } });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  physics: { default:'arcade', arcade:{ debug:false } },
  scene: [MainScene],
  backgroundColor: '#0f1022',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
});