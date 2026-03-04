const W=Math.min(innerWidth,480),H=innerHeight;
class SkyHook extends Phaser.Scene{
create(){
 this.add.rectangle(W/2,H/2,W,H,0x0b1020);
 this.score=0; this.best=0; this.over=false;
 this.ui=this.add.text(10,10,'Score:0',{fontSize:'16px',color:'#fff'});
 this.player=this.add.circle(W*0.2,H*0.6,10,0x6cf9ff); this.physics.add.existing(this.player); this.player.body.setGravityY(450);
 this.hooks=this.physics.add.staticGroup();
 for(let i=0;i<6;i++){const x=80+i*70,y=120+((i%2)*80); const h=this.add.circle(x,y,8,0xffd166); this.physics.add.existing(h,true); this.hooks.add(h);}
 this.goal=this.add.rectangle(W-30,60,20,20,0x52ff7a); this.physics.add.existing(this.goal,true);
 this.rope=null; this.anchor=null; this.line=this.add.graphics();
 this.input.on('pointerdown',p=>this.tryHook(p.x,p.y));
 this.input.on('pointerup',()=>this.releaseHook());
 this.cursors=this.input.keyboard.createCursorKeys();
 this.keyR=this.input.keyboard.addKey('R');
 this.physics.add.overlap(this.player,this.goal,()=>this.nextPoint());
}
tryHook(x,y){if(this.over) return; let best=null,bd=99999; this.hooks.getChildren().forEach(h=>{const d=Phaser.Math.Distance.Between(x,y,h.x,h.y); if(d<45&&d<bd){bd=d;best=h;}}); if(best){this.anchor=best; this.rope=Phaser.Math.Distance.Between(this.player.x,this.player.y,best.x,best.y)+8;} }
releaseHook(){this.anchor=null; this.rope=null; this.line.clear();}
nextPoint(){this.score++; this.ui.setText('Score:'+this.score); this.goal.x=Phaser.Math.Between(50,W-30); this.goal.y=Phaser.Math.Between(50,H-120); if(this.score>=8){this.add.text(W/2,H/2,'CLEAR!\nR: restart',{align:'center'}).setOrigin(.5); this.over=true; this.player.body.setVelocity(0,0);} }
update(){ if(this.keyR.isDown) this.scene.restart(); if(this.over) return;
 const b=this.player.body;
 if(this.cursors.left.isDown) b.setVelocityX(-160); else if(this.cursors.right.isDown) b.setVelocityX(160);
 if(this.anchor){const dx=this.player.x-this.anchor.x, dy=this.player.y-this.anchor.y; const d=Math.hypot(dx,dy)||1; const diff=d-this.rope; const pull=diff*6; b.velocity.x += (-dx/d)*pull; b.velocity.y += (-dy/d)*pull; this.line.clear().lineStyle(2,0xffffff,.8).beginPath().moveTo(this.player.x,this.player.y).lineTo(this.anchor.x,this.anchor.y).strokePath();}
 if(this.player.y>H+50){this.add.text(W/2,H/2,'FALL!\nR: restart',{align:'center'}).setOrigin(.5); this.over=true;}
}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,physics:{default:'arcade',arcade:{debug:false}},scene:[SkyHook]});