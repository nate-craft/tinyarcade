import { Game } from "../common/game.js"

export class Tile {
  div = null;
  value = 0;
  row;
  col;

  constructor(boardDiv, row, col) {
    this.div = document.createElement("div");
    this.col = col;
    this.row = row;
    this.setValue(this.value);

    boardDiv.appendChild(this.div);
  }

  setValue(value) {
    this.value = value;

    if (this.value === 0) {
      this.div.innerText = "";
    } else {
      this.div.innerText = this.value;
    }

    this.div.id = `tile${this.row}${this.col}`;
    this.div.className = "tile";
    this.div.classList.add(`tile${value}`);
  }

  double() {
    this.setValue(this.value * 2);
  }

  reset() {
    this.setValue(0);
  }
}

export class Game2048 extends Game {
  tiles = [[],[],[],[]];
  containerDiv;
  boardDiv;
  scoreDiv;

  constructor() {
    super((e) => {
      if (e.key === "ArrowUp") {
        if (this.moveUp()) {
          this.spawnRandom(1);
        }
      } else if (e.key === "ArrowDown") {
        if (this.moveDown()) {
          this.spawnRandom(1);
        } 
      } else if (e.key === "ArrowLeft") {
        if (this.moveLeft()) {
          this.spawnRandom(1);
        }
      } else if (e.key === "ArrowRight") {
        if (this.moveRight()) {
          this.spawnRandom(1);
        }
      }

      this.updateScore();
    });

    this.containerDiv = document.createElement("div");
    this.containerDiv.className = "container";

    this.boardDiv = document.createElement("div");
    this.boardDiv.className = "board";
    this.boardDiv.id = "board";

    this.scoreDiv = document.createElement("div");
    this.scoreDiv.id = "score";

    this.containerDiv.appendChild(this.boardDiv);
    this.containerDiv.appendChild(this.scoreDiv);

    super.initDOM(this.containerDiv);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        this.tiles[col][row] = new Tile(this.boardDiv, row, col);
      }
    }

    this.spawnRandom(2);  
  }

  getTile(col, row) {
    return this.tiles[row][col];
  }

  spawnRandom(total) {
    for (let updated = 0; updated < total; ) {
      let row = Math.round(Math.random() * 3);
      let col = Math.round(Math.random() * 3);
      let tile = this.getTile(row, col);

      if (tile.value === 0) {
        tile.setValue(2);
        updated++;
      }
    }
  }

  isFull() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.getTile(row, col).value == 0) {
          return false;
        }
      }
    }
    return true;
  }

  moveUp() {
    let changed = false;

    for (let i = 0; i < 4; i++) {
      for (let row = 3; row > 0; row--) {
        for (let col = 0; col < 4; col++) {
          let tile = this.getTile(row, col);
          let tileAbove = this.getTile(row - 1, col);

          if (tile.value === 0) {
            continue;
          }

          if (tile.value === tileAbove.value) {
            tileAbove.double();
            tile.reset();
            changed = true;
          } else if (tileAbove.value === 0) {
            tileAbove.setValue(tile.value);
            tile.reset();
            changed = true;
          } 
        }
      }
    }

    return changed;
  }

  moveDown() {
    let changed = false;

    for (let i = 0; i < 4; i++) {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          let tile = this.getTile(row, col);
          let tileBelow = this.getTile(row + 1, col);

          if (tile.value === 0) {
            continue;
          }

          if (tile.value === tileBelow.value) {
            tileBelow.double();
            tile.reset();
            changed = true;
          } else if (tileBelow.value === 0) {
            tileBelow.setValue(tile.value);
            tile.reset();
            changed = true;
          } 
        }
      }
    }

    return changed;
  }

  moveRight() { 
    let changed = false;

    for (let i = 0; i < 4; i++) {
      for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 4; row++) {
          let tile = this.getTile(row, col);
          let tileRight = this.getTile(row, col + 1);

          if (tile.value === 0) {
            continue;
          }

          if (tile.value === tileRight.value) {
            tileRight.double();
            tile.reset();
            changed = true;
          } else if (tileRight.value === 0) {
            tileRight.setValue(tile.value);
            tile.reset();
            changed = true;
          } 
        }
      }
    }

    return changed;
  }

  moveLeft() {
    let changed = false;

    for (let i = 0; i < 4; i++) {
      for (let col = 3; col > 0; col--) {
        for (let row = 0; row < 4; row++) {
          let tile = this.getTile(row, col);
          let tileRight = this.getTile(row, col - 1);

          if (tile.value === 0) {
            continue;
          }

          if (tile.value === tileRight.value) {
            tileRight.double();
            tile.reset();
            changed = true;
          } else if (tileRight.value === 0) {
            tileRight.setValue(tile.value);
            tile.reset();
            changed = true;
          } 
        }
      }
    }

    return changed;    
  }

  updateScore() {
    let score = 0;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        score = score + this.getTile(col, row).value;
      }
    }

    document.getElementById("score").innerText = `Score: ${score}`;
  }
}


