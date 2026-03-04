const W=Math.min(innerWidth,480),H=innerHeight;
class RailDefender extends Phaser.Scene{
create(){
 this.add.rectangle(W/2,H/2,W,H,0x101410);
 this.score=0; this.hp=12; this.over=false;
 this.ui=this.add.text(10,10,'HP:12  Score:0',{fontSize:'16px',color:'#fff'});
 this.path=[{x:30,y:80},{x:W-30,y:80},{x:W-30,y:H-80},{x:30,y:H-80}];
 for(let i=0;i<this.path.length-1;i++) this.add.line(0,0,this.path[i].x,this.path[i].y,this.path[i+1].x,this.path[i+1].y,0x6f8f6f).setOrigin(0,0).setLineWidth(6,6);
 this.enemies=this.physics.add.group(); this.bullets=this.physics.add.group(); this.towers=[];
 this.time.addEvent({delay:1200,loop:true,callback:()=>this.spawnEnemy()});
 this.time.addEvent({delay:500,loop:true,callback:()=>this.towerFire()});
 this.input.on('pointerdown',p=>this.placeTower(p.x,p.y));
 this.keyR=this.input.keyboard.addKey('R');
 this.physics.add.overlap(this.bullets,this.enemies,(b,e)=>{b.destroy(); e.hp--; if(e.hp<=0){e.destroy(); this.score+=10; this.ui.setText(`HP:${this.hp}  Score:${this.score}`);} });
}
placeTower(x,y){ if(this.over) return; if(this.towers.length>=10) return; const t=this.add.circle(x,y,10,0x7dd3fc); this.towers.push(t); }
spawnEnemy(){ if(this.over) return; const e=this.add.rectangle(this.path[0].x,this.path[0].y,16,16,0xff6b6b); this.physics.add.existing(e); e.hp=2; e.seg=0; this.enemies.add(e); }
towerFire(){ if(this.over) return; this.towers.forEach(t=>{ let target=null, bd=140; this.enemies.getChildren().forEach(e=>{const d=Phaser.Math.Distance.Between(t.x,t.y,e.x,e.y); if(d<bd){bd=d; target=e;}}); if(target){const b=this.add.circle(t.x,t.y,4,0xfff); this.physics.add.existing(b); const a=Phaser.Math.Angle.Between(t.x,t.y,target.x,target.y); b.body.setVelocity(Math.cos(a) *245,Math.sin(a) *245); this.bullets.add(b);} }); }
update(){ if(this.keyR.isDown) this.scene.restart(); if(this.over) return;
 this.enemies.getChildren().forEach(e=>{ const n=this.path[e.seg+1]; if(!n){ this.hp--; e.destroy(); this.ui.setText(`HP:${this.hp}  Score:${this.score}`); if(this.hp<=0){this.over=true; this.add.text(W/2,H/2,'GAME OVER\nR: restart',{align:'center'}).setOrigin(.5);} return; }
 const a=Phaser.Math.Angle.Between(e.x,e.y,n.x,n.y); e.body.setVelocity(Math.cos(a)*70,Math.sin(a)*70);
 if(Phaser.Math.Distance.Between(e.x,e.y,n.x,n.y)<8) e.seg++;
 });
 this.bullets.getChildren().forEach(b=>{if(b.x<0||b.x>W||b.y<0||b.y>H)b.destroy();});
}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,physics:{default:'arcade',arcade:{debug:false}},scene:[RailDefender]});