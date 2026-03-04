const W=Math.min(innerWidth,480),H=innerHeight;
class DriftLoop extends Phaser.Scene{
create(){
 this.add.rectangle(W/2,H/2,W,H,0x0d0d0f);
 this.track=this.add.graphics(); this.track.lineStyle(40,0x2b2b31).strokeEllipse(W/2,H/2,W*0.75,H*0.55);
 this.track.lineStyle(2,0xffffff,.2).strokeEllipse(W/2,H/2,W*0.75,H*0.55);
 this.car=this.add.rectangle(W/2+W*0.33,H/2,16,10,0x66e0ff);
 this.v=0.012; this.a=-Math.PI/2; this.score=0; this.over=false;
 this.ui=this.add.text(10,10,'Lap:0 Speed:0',{fontSize:'16px'});
 this.input.on('pointerdown',()=>this.boost=true); this.input.on('pointerup',()=>this.boost=false);
 this.cursors=this.input.keyboard.createCursorKeys(); this.keyR=this.input.keyboard.addKey('R');
 this.lastSide=1;
}
update(){if(this.keyR.isDown)this.scene.restart(); if(this.over)return;
 const accel=(this.boost||this.cursors.up.isDown)?0.004:-0.002; this.v=Phaser.Math.Clamp(this.v+accel,0.01,0.04); this.a+=this.v;
 const rx=W*0.375, ry=H*0.275; this.car.x=W/2+Math.cos(this.a)*rx; this.car.y=H/2+Math.sin(this.a)*ry;
 const tx=-Math.sin(this.a), ty=Math.cos(this.a); this.car.rotation=Math.atan2(ty,tx);
 if(this.cursors.left.isDown) this.a-=0.01; if(this.cursors.right.isDown) this.a+=0.01;
 const side=Math.sign(Math.cos(this.a)); if(this.lastSide<0 && side>=0){this.score++; if(this.score>=5){this.over=true; this.add.text(W/2,H/2,'CLEAR!\nR: restart',{align:'center'}).setOrigin(.5);} }
 this.lastSide=side; this.ui.setText(`Lap:${this.score} Speed:${(this.v*1000|0)}`);
}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,scene:[DriftLoop]});