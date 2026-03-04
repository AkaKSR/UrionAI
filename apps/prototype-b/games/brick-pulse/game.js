const W=Math.min(innerWidth,480), H=innerHeight;
class S extends Phaser.Scene{
 create(){
  this.score=0; this.lives=3;
  this.add.rectangle(W/2,H/2,W,H,0x121a2f);
  this.scoreT=this.add.text(10,10,'Score:0',{fontSize:'16px'});
  this.lifeT=this.add.text(10,30,'Lives:3',{fontSize:'16px'});
  this.paddle=this.add.rectangle(W/2,H-40,90,14,0x7df9ff);
  this.ball=this.add.circle(W/2,H-70,8,0xffdf6b);
  this.physics.add.existing(this.paddle,true);
  this.physics.add.existing(this.ball);
  this.ball.body.setCollideWorldBounds(true,1,1).setBounce(1,1).setVelocity(160,-210);

  this.bricks=this.physics.add.staticGroup();
  const cols=7, rows=5, bw=(W-30)/cols-4;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const x=20+c*(bw+4)+bw/2, y=80+r*26;
    const b=this.add.rectangle(x,y,bw,20,Phaser.Display.Color.HSVColorWheel()[(r*40+c*8)%360].color);
    this.physics.add.existing(b,true); this.bricks.add(b);
  }

  this.physics.add.collider(this.ball,this.paddle,()=>{
    const diff=this.ball.x-this.paddle.x;
    this.ball.body.setVelocityX(diff*6);
  });
  this.physics.add.collider(this.ball,this.bricks,(ball,b)=>{ b.destroy(); this.score += 12; this.scoreT.setText('Score:'+this.score); if(this.bricks.countActive()===0) this.win(); });

  this.input.on('pointermove',p=>this.movePaddle(p.x));
  this.cursors=this.input.keyboard.createCursorKeys();
  this.keyR=this.input.keyboard.addKey('R');
 }
 movePaddle(x){this.paddle.x=Phaser.Math.Clamp(x,45,W-45); this.paddle.body.updateFromGameObject();}
 loseLife(){ this.lives--; this.lifeT.setText('Lives:'+this.lives); if(this.lives<=0){this.gameOver();return;} this.ball.setPosition(this.paddle.x,H-70); this.ball.body.setVelocity(170,-220); }
 gameOver(){this.ball.body.stop(); this.add.text(W/2,H/2,'GAME OVER\nR: restart',{align:'center'}).setOrigin(.5); this.over=true;}
 win(){this.ball.body.stop(); this.add.text(W/2,H/2,'CLEAR!\nR: restart',{align:'center'}).setOrigin(.5); this.over=true;}
 update(){
  if(this.keyR.isDown) this.scene.restart();
  if(this.cursors.left.isDown) this.movePaddle(this.paddle.x-7);
  else if(this.cursors.right.isDown) this.movePaddle(this.paddle.x+7);
  if(!this.over && this.ball.y>H+20) this.loseLife();
 }
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,physics:{default:'arcade',arcade:{debug:false}},scene:[S]});