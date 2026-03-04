const W=Math.min(innerWidth,480),H=innerHeight, CELL=64, COLS=6, ROWS=8;
class MergeAlchemy extends Phaser.Scene{
create(){
 this.add.rectangle(W/2,H/2,W,H,0x131018);
 this.types=[0x8ec5ff,0xff9ecb,0xa6ff9e,0xffdf8a,0xc3a6ff,0xffb4a2];
 this.grid=Array.from({length:ROWS},()=>Array(COLS).fill(0).map(()=>Phaser.Math.Between(0,2)));
 this.score=0; this.ui=this.add.text(10,10,'Score:0',{fontSize:'16px'});
 this.draw(); this.sel=null;
 this.input.on('pointerdown',p=>this.pick(p.x,p.y));
}
cellXY(c,r){const ox=(W-COLS*CELL)/2+CELL/2, oy=(H-ROWS*CELL)/2+CELL/2; return [ox+c*CELL,oy+r*CELL];}
draw(){ if(this.g) this.g.destroy(true); this.g=this.add.group();
 for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){const [x,y]=this.cellXY(c,r); const v=this.grid[r][c]; const s=18+v*6; const o=this.add.circle(x,y,s,this.types[v%this.types.length]).setStrokeStyle(2,0xffffff,.4); o.meta={c,r}; this.g.add(o);} }
pick(x,y){const ox=(W-COLS*CELL)/2, oy=(H-ROWS*CELL)/2; const c=Math.floor((x-ox)/CELL), r=Math.floor((y-oy)/CELL); if(c<0||c>=COLS||r<0||r>=ROWS) return;
 if(!this.sel){this.sel={c,r}; return;}
 const a=this.sel, b={c,r}; if(Math.abs(a.c-b.c)+Math.abs(a.r-b.r)!==1){this.sel=b; return;}
 this.swap(a,b); this.sel=null;
}
swap(a,b){
 const t=this.grid[a.r][a.c];
 this.grid[a.r][a.c]=this.grid[b.r][b.c];
 this.grid[b.r][b.c]=t;
 if(!this.resolve()){
  // 매치가 없으면 원복(재귀 금지)
  const t2=this.grid[a.r][a.c];
  this.grid[a.r][a.c]=this.grid[b.r][b.c];
  this.grid[b.r][b.c]=t2;
 }
 this.draw();
}
resolve(){ let merged=false;
 for(let r=0;r<ROWS;r++) for(let c=0;c<COLS-2;c++){
   const v=this.grid[r][c]; if(v===this.grid[r][c+1]&&v===this.grid[r][c+2]){this.grid[r][c]=v+1; this.grid[r][c+1]=0; this.grid[r][c+2]=0; this.score+=35; merged=true;}
 }
 for(let c=0;c<COLS;c++) for(let r=ROWS-1;r>=0;r--){ if(this.grid[r][c]===0){ for(let k=r-1;k>=0;k--){ if(this.grid[k][c]!==0){ this.grid[r][c]=this.grid[k][c]; this.grid[k][c]=0; break; } } if(this.grid[r][c]===0) this.grid[r][c]=Phaser.Math.Between(0,2);} }
 this.ui.setText('Score:'+this.score); return merged;
}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,scene:[MergeAlchemy]});