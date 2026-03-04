const W=Math.min(innerWidth,480),H=innerHeight;
class RhythmRunner extends Phaser.Scene{
create(){
 this.add.rectangle(W/2,H/2,W,H,0x120a16);
 this.groundY=H-90;
 this.player=this.add.rectangle(70,this.groundY,24,24,0x9dff6e); this.physics.add.existing(this.player); this.player.body.setGravityY(700);
 this.beats=[650,600,500,450,350,350,450,600]; this.bi=0;
 this.obs=this.physics.add.group(); this.score=0; this.over=false;
 this.ui=this.add.text(10,10,'Score:0',{fontSize:'16px'});
 this.spawnBeat();
 this.input.on('pointerdown',()=>this.jump());
 this.cursors=this.input.keyboard.createCursorKeys(); this.keyR=this.input.keyboard.addKey('R');
 this.physics.add.overlap(this.player,this.obs,()=>this.end(),null,this);
 this.add.rectangle(W/2,this.groundY+18,W,4,0xffffff,.3);
}
spawnBeat(){this.time.addEvent({delay:this.beats[this.bi],callback:()=>{if(this.over)return; const o=this.add.rectangle(W+20,this.groundY,22,22,0xff7ad9); this.physics.add.existing(o); o.body.setVelocityX(-205); this.obs.add(o); this.score++; this.ui.setText('Score:'+this.score); this.bi=(this.bi+1)%this.beats.length; this.spawnBeat();}})}
jump(){ if(this.over)return; if(this.player.y>=this.groundY-1) this.player.body.setVelocityY(-360); }
end(){ if(this.over)return; this.over=true; this.add.text(W/2,H/2,'GAME OVER\nR: restart',{align:'center'}).setOrigin(.5); this.player.body.setVelocity(0,0); }
update(){ if(this.keyR.isDown)this.scene.restart(); if(this.over)return; if(this.cursors.up.isDown) this.jump(); this.obs.getChildren().forEach(o=>{if(o.x<-30)o.destroy();}); if(this.score>=40){this.over=true; this.add.text(W/2,H/2,'CLEAR!\nR: restart',{align:'center'}).setOrigin(.5);} }
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,physics:{default:'arcade',arcade:{debug:false}},scene:[RhythmRunner]});