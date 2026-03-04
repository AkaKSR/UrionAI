const W = Math.min(innerWidth, 480), H = innerHeight, CELL = 56, C = 6, R = 8;

class TinyTactics extends Phaser.Scene {
  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x121212);
    this.gridX = (W - C * CELL) / 2;
    this.gridY = (H - R * CELL) / 2;
    this.units = [];
    this.turn = 'P';
    this.sel = null;

    this.ui = this.add.text(10, 10, 'Turn: Player', { fontSize: '16px' });
    for (let i = 0; i < 3; i++) this.units.push({ x: i, y: R - 1, hp: 3, t: 'P' });
    for (let i = 0; i < 3; i++) this.units.push({ x: C - 1 - i, y: 0, hp: 2, t: 'E' });

    this.input.on('pointerdown', p => this.click(p.x, p.y));
    this.keyR = this.input.keyboard.addKey('R');

    this.g = this.add.graphics();
    this.piecesLayer = this.add.layer();
    this.draw();
  }

  cellToPix(x, y) {
    return [this.gridX + x * CELL + CELL / 2, this.gridY + y * CELL + CELL / 2];
  }

  unitAt(x, y) {
    return this.units.find(u => u.x === x && u.y === y && u.hp > 0);
  }

  draw() {
    this.g.clear();
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < C; x++) {
        this.g.lineStyle(1, 0x444).strokeRect(this.gridX + x * CELL, this.gridY + y * CELL, CELL, CELL);
      }
    }

    this.piecesLayer.removeAll(true);
    this.units.filter(u => u.hp > 0).forEach(u => {
      const [px, py] = this.cellToPix(u.x, u.y);
      const color = u.t === 'P' ? 0x7ad3ff : 0xff7a7a;
      this.piecesLayer.add(this.add.circle(px, py, 18, color).setDepth(2));
      this.piecesLayer.add(this.add.text(px - 5, py - 8, String(u.hp), { fontSize: '14px' }).setDepth(3));
    });
  }

  click(px, py) {
    if (this.turn !== 'P') return;

    const x = Math.floor((px - this.gridX) / CELL);
    const y = Math.floor((py - this.gridY) / CELL);
    if (x < 0 || y < 0 || x >= C || y >= R) return;

    const u = this.unitAt(x, y);
    if (u && u.t === 'P') {
      this.sel = u;
      return;
    }
    if (!this.sel) return;

    const d = Math.abs(this.sel.x - x) + Math.abs(this.sel.y - y);
    if (d !== 1) return;

    const target = this.unitAt(x, y);
    if (target && target.t === 'E') {
      target.hp--;
    } else if (!target) {
      this.sel.x = x;
      this.sel.y = y;
    }

    this.sel = null;
    this.turn = 'E';
    this.enemyTurn();
  }

  enemyTurn() {
    const es = this.units.filter(u => u.t === 'E' && u.hp > 0);
    const ps = this.units.filter(u => u.t === 'P' && u.hp > 0);
    if (!ps.length) return this.end('패배');
    if (!es.length) return this.end('승리');

    es.forEach(e => {
      const p = ps.sort((a, b) =>
        Math.abs(a.x - e.x) + Math.abs(a.y - e.y) - (Math.abs(b.x - e.x) + Math.abs(b.y - e.y))
      )[0];
      if (!p) return;

      if (Math.abs(p.x - e.x) + Math.abs(p.y - e.y) === 1) {
        p.hp--;
        return;
      }

      const dx = Math.sign(p.x - e.x);
      const dy = Math.sign(p.y - e.y);
      const nx = e.x + (Math.abs(p.x - e.x) > Math.abs(p.y - e.y) ? dx : 0);
      const ny = e.y + (Math.abs(p.x - e.x) > Math.abs(p.y - e.y) ? 0 : dy);
      if (!this.unitAt(nx, ny)) {
        e.x = nx;
        e.y = ny;
      }
    });

    this.turn = 'P';
    this.ui.setText('Turn: Player');
    this.draw();

    const aliveP = this.units.some(u => u.t === 'P' && u.hp > 0);
    const aliveE = this.units.some(u => u.t === 'E' && u.hp > 0);
    if (!aliveP) this.end('패배');
    if (!aliveE) this.end('승리');
  }

  end(t) {
    this.turn = 'X';
    this.add.text(W / 2, H / 2, `${t}\nR: restart`, { align: 'center' }).setOrigin(0.5);
  }

  update() {
    if (this.keyR.isDown) this.scene.restart();
  }
}

new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: W, height: H, scene: [TinyTactics] });
