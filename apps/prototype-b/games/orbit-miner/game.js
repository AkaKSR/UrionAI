const W=Math.min(innerWidth,480),H=innerHeight;
class OrbitMiner extends Phaser.Scene{
create(){
 this.add.rectangle(W/2,H/2,W,H,0x09121a);
 this.core=this.add.circle(W/2,H/2,26,0x7aa2ff);
 this.orb=this.add.circle(W/2+90,H/2,10,0x8affc1);
 this.rocks=this.physics.add.group(); this.score=0; this.energy=100;
 this.ui=this.add.text(10,10,'Ore:0  Energy:100',{fontSize:'16px'});
 this.a=0; this.r=90; this.speed=0.026;
 this.input.on('pointermove',p=>{this.speed=Phaser.Math.Clamp((p.x/W)*0.07,0.012,0.07)});
 this.time.addEvent({delay:800,loop:true,callback:()=>this.spawnRock()});
 this.physics.add.existing(this.orb); this.physics.add.overlap(this.orb,this.rocks,(_,r)=>{r.destroy();this.score++;this.energy=Math.min(100,this.energy+3);this.ui.setText(`Ore:${this.score}  Energy:${this.energy}`);});
 this.time.addEvent({delay:400,loop:true,callback:()=>{this.energy--;this.ui.setText(`Ore:${this.score}  Energy:${this.energy}`); if(this.energy<=0&&!this.over){this.over=true;this.add.text(W/2,H/2,'OUT OF ENERGY\nR: restart',{align:'center'}).setOrigin(.5);}}});
 this.keyR=this.input.keyboard.addKey('R');
}
spawnRock(){if(this.over)return;const a=Math.random()*Math.PI*2,d=Phaser.Math.Between(120,220);const x=W/2+Math.cos(a)*d,y=H/2+Math.sin(a)*d;const r=this.add.circle(x,y,8,0xffb86c);this.physics.add.existing(r);this.rocks.add(r);this.tweens.add({targets:r, x:W/2, y:H/2, duration:2400, onComplete:()=>{if(r.active){r.destroy();this.energy-=8;this.ui.setText(`Ore:${this.score}  Energy:${this.energy}`);}}});}
update(){if(this.keyR.isDown)this.scene.restart(); if(this.over)return; this.a+=this.speed; this.orb.x=W/2+Math.cos(this.a)*this.r; this.orb.y=H/2+Math.sin(this.a)*this.r;}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,physics:{default:'arcade',arcade:{debug:false}},scene:[OrbitMiner]});