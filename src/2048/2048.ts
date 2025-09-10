import { Game } from "../common/game.js"

const TILE_COUNT = 4;
const DEFAULT_VALUE = 2;

enum Direction {
  Up,
  Down,
  Right,
  Left,
}

class ActiveTile {
  tileReference: Tile | undefined;
  tileTranslation: Tile;
  div: HTMLDivElement;
  translationX: number;
  translationY: number;
  value: number;

  constructor(gameContainer: HTMLElement | null, topLeftTileBlank: Tile | undefined, tileWanted: Tile, value: number) {
    this.tileReference = topLeftTileBlank;
    this.tileTranslation = tileWanted;

    if (!this.tileReference) {
      throw new Error("Top left tile cannot be blank");
    }

    const rect = this.tileReference.div.getBoundingClientRect();

    this.translationX = 0;
    this.translationY = 0;
    this.value = DEFAULT_VALUE;

    this.div = document.createElement("div");
    this.div.style.width = `${rect.width}px`;
    this.div.style.height = `${rect.height}px`;

    let desiredRect = this.tileTranslation.div.getBoundingClientRect();
    this.div.style.left = `${desiredRect.left}px`;
    this.div.style.top = `${desiredRect.top}px`;

    console.log(`${desiredRect.left}, ${desiredRect.top}`);
    console.log(`${this.div.style.left}, ${this.div.style.top}`);
    this.setValue(value);

    if (!gameContainer) {
      throw new Error("Top left tile cannot be blank");
    }

    gameContainer.appendChild(this.div);

    // Allow DOM-rearrangment 
    setTimeout(() => this.updateWithResize(), 1);
  }

  updateWithResize() {
    const rect = this.tileTranslation.div.getBoundingClientRect();

    this.div.style.width = `${rect.width}`;
    this.div.style.height = `${rect.height}`;
    if (this.div.style.transform.length !== 0) {
      this.div.style.transform = `translate(0,0)`
    }
    this.div.style.left = `${rect.left}px`;
    this.div.style.top = `${rect.top}px`;

    this.translationX = 0;
    this.translationY = 0;
  }

  moveDiv(newTile: Tile, direction: Direction) {
    const oldRec = this.tileTranslation.div.getBoundingClientRect();
    this.tileTranslation = newTile;
    const newRec = this.tileTranslation.div.getBoundingClientRect();

    if (direction === Direction.Right || direction === Direction.Left) {
      this.translationX += (newRec.left - oldRec.left);
    } else if (direction === Direction.Down || direction === Direction.Up) {
      this.translationY += (newRec.top - oldRec.top);
    }

    this.div.style.width = `${newRec.width}px`;
    this.div.style.height = `${newRec.height}px`;
    this.div.style.transform = `translate(${this.translationX}px, ${this.translationY}px)`
  }

  setValue(value: number) {
    this.value = value;

    this.div.id = `tile-moving${this.tileTranslation.row}${this.tileTranslation.col}-${Math.floor(Math.random()*1000)}`;
    this.div.className = "tile-moving";
    this.div.classList.add(`tile${value}`);
    this.div.innerText = String(this.value);
  }

  double() {
    this.setValue(this.value * 2);
  }
}

class Tile {
  div: HTMLDivElement;
  row: number;
  col: number;

  constructor(boardDiv: HTMLDivElement, col: number, row: number) {
    this.div = document.createElement("div");
    this.col = col;
    this.row = row;
    this.div.id = `tile${this.row}${this.col}`;
    this.div.className = "tile";
    this.div.classList.add(`tile0`);

    boardDiv.appendChild(this.div);
  }
}

export class Game2048 extends Game {
  tilesBlank: Tile[][];
  topLeftTileBlank: Tile | undefined;
  tilesActive: (ActiveTile | undefined)[][];
  containerDiv: HTMLDivElement;
  boardDiv: HTMLDivElement;
  scoreDiv: HTMLDivElement;
  overlay: HTMLDivElement;
  boardObserver: ResizeObserver | undefined;
  running: boolean = true;

  constructor() {
    super((e: KeyboardEvent) => {
      if (!this.running) {
        if (e.key == " ") {
          this.restart();
        }

        return;
      }
      
      let tileMoved = false;
      let moveKeyPressed = false;

      for (let i = 0; i < 4; i++) {
        if (e.key === "ArrowUp" || e.key === "w") {
          if (this.moveUp(false)) {
            tileMoved = true;
          }
          moveKeyPressed = true;
        } else if (e.key === "ArrowDown" || e.key === "s") {
          if (this.moveDown(false)) {
            tileMoved = true;
          }
          moveKeyPressed = true;
        } else if (e.key === "ArrowLeft" || e.key === "a") {
          if (this.moveLeft(false)) {
            tileMoved = true;
          }
          moveKeyPressed = true;
        } else if (e.key === "ArrowRight" || e.key === "d") {
          if (this.moveRight(false)) {
            tileMoved = true;
          }
          moveKeyPressed = true;
        }
      }

      if (this.gameDiv) {
        let lastWidth = this.boardDiv.offsetWidth;
        let lastHeight = this.boardDiv.offsetHeight;

        this.boardObserver = new ResizeObserver(() => {
          const currentWidth = this.boardDiv.offsetWidth;
          const currentHeight = this.boardDiv.offsetHeight;

          if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
            lastWidth = currentWidth;
            lastHeight = currentHeight;
          } else {
            return;
          }

          for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
              let tile = this.getActiveTile(col, row);
              if (tile) {
                tile.updateWithResize();
              }
            }
          }
        });
        this.boardObserver.observe(this.containerDiv);
        this.boardObserver.observe(document.body);
      } else {
        this.boardObserver = undefined;
      }

      if (tileMoved) {
        this.spawnRandom(1);
        this.updateScore();
      }

      if (moveKeyPressed && this.isFull()) {
        this.running = false;
        this.overlay.style.display = String("flex");

        if (!this.overlay.firstElementChild) {
          let gameOverDiv = document.createElement("div");
          let instructionDiv = document.createElement("div");

          gameOverDiv.innerText = "GAME OVER";
          instructionDiv.innerText = "Press Space To Restart!";

          this.overlay.appendChild(gameOverDiv);
          this.overlay.appendChild(instructionDiv);
        } 
      }
    });

    this.tilesBlank = [[], [], [], []];
    this.tilesActive = [[], [], [], []];

    this.containerDiv = document.createElement("div");
    this.containerDiv.className = "container";

    this.boardDiv = document.createElement("div");
    this.boardDiv.className = "board";
    this.boardDiv.id = "board";

    this.scoreDiv = document.createElement("div");
    this.scoreDiv.id = "score";

    this.overlay = document.createElement("div");
    this.overlay.id = "overlay";
    this.overlay.className = "overlay";

    this.containerDiv.appendChild(this.scoreDiv);
    this.containerDiv.appendChild(this.boardDiv);
    this.boardDiv.appendChild(this.overlay);

    super.initDOM(this.containerDiv);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        this.setBlankTile(col, row, new Tile(this.boardDiv, col, row));
        this.setActiveTile(col, row, undefined);
      }
    }

    this.topLeftTileBlank = this.getBlankTile(0, 0);

    this.spawnRandom(1);
    this.updateScore();
  }

  restart() {
    this.overlay.style.display = String("none");
    this.running = true;

    if (this.gameDiv) {
      document.querySelectorAll('.tile-moving').forEach(tile => {
          tile.remove();
      });
    }

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        this.setActiveTile(col, row, undefined);
      }
    }

    this.spawnRandom(1);
    this.updateScore();    
  }

  override end() {
    super.end();
    if (this.boardObserver) {
      this.boardObserver.disconnect();
    }
  }

  getBlankTile(col: number, row: number): Tile | undefined {
    let tiles = this.tilesBlank[row];

    if (tiles) {
      return tiles[col];
    }
  }


  getActiveTile(col: number, row: number): ActiveTile | undefined {
    let tiles = this.tilesActive[row];

    if (tiles) {
      return tiles[col];
    }
  }


  setBlankTile(col: number, row: number, tile: Tile) {
    let tiles = this.tilesBlank[row];
    if (tiles) {
      tiles[col] = tile;
    }
  }

  setActiveTile(col: number, row: number, tile: ActiveTile | undefined) {
    let tiles = this.tilesActive[row];
    if (tiles) {
      tiles[col] = tile;
    }
  }

  reset(tile: ActiveTile) {
    let tiles = this.tilesActive[tile.tileTranslation.row];

    if (tiles) {
      tile.div.remove();
      tiles[tile.tileTranslation.col] = undefined;
    }
  }

  spawnRandom(total: number) {
    for (let limit = 0, updated = 0; updated < total && limit < 1000; limit++) {
      let row = Math.round(Math.random() * 3);
      let col = Math.round(Math.random() * 3);

      let blank = this.getBlankTile(col, row);
      let existing = this.getActiveTile(col, row);

      if (blank && !existing) {
        this.setActiveTile(col, row, new ActiveTile(this.gameDiv, this.topLeftTileBlank, blank, DEFAULT_VALUE));
        updated++
      }
    }
  }

  isFull() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        let tile = this.getActiveTile(col, row);
        if (!tile) {
          return false;
        }
      }
    }

    return !this.moveUp(true) && !this.moveDown(true) && !this.moveRight(true) && !this.moveLeft(true);
  }

  moveNext(
    col: number,
    row: number,
    colNext: number,
    rowNext: number,
    dryRun: boolean,
    direction: Direction
  ): boolean {
    const tile = this.getActiveTile(col, row);
    const tileNext = this.getActiveTile(colNext, rowNext);
    const tileNextBlank = this.getBlankTile(colNext, rowNext);

    if (!tile || !tileNextBlank) {
      return false;
    }

    if (tileNext && tile.value === tileNext.value) {
      if (!dryRun) {
        this.reset(tileNext);

        tile.moveDiv(tileNextBlank, direction);
        tile.double();
        this.setActiveTile(colNext, rowNext, tile);
        this.setActiveTile(col, row, undefined);
      }
      return true;
    } else if (!tileNext) {
      if (!dryRun) {
        tile.moveDiv(tileNextBlank, direction);
        this.setActiveTile(colNext, rowNext, tile);
        this.setActiveTile(col, row, undefined);
      }
      return true;
    }

    return false;
  }

  moveUp(dryRun: boolean) {
    let changed = false;

    for (let row = TILE_COUNT - 1; row > 0; row--) {
      for (let col = 0; col < TILE_COUNT; col++) {
        if (this.moveNext(col, row, col, row - 1, dryRun, Direction.Up)) {
          changed = true;
        }
      }
    }

    return changed;
  }

  moveDown(dryRun: boolean) {
    let changed = false;

    for (let row = 0; row < TILE_COUNT - 1; row++) {
      for (let col = 0; col < TILE_COUNT; col++) {
        if (this.moveNext(col, row, col, row + 1, dryRun, Direction.Down)) {
          changed = true;
        }
      }
    }

    return changed;
  }

  moveRight(dryRun: boolean) {
    let changed = false;

    for (let col = 0; col < TILE_COUNT - 1; col++) {
      for (let row = 0; row < TILE_COUNT; row++) {
        if (this.moveNext(col, row, col + 1, row, dryRun, Direction.Right)) {
          changed = true;
        }
      }
    }

    return changed;
  }

  moveLeft(dryRun: boolean) {
    let changed = false;

    for (let col = TILE_COUNT - 1; col > 0; col--) {
      for (let row = 0; row < TILE_COUNT; row++) {
        if (this.moveNext(col, row, col - 1, row, dryRun, Direction.Left)) {
          changed = true;
        }
      }
    }

    return changed;
  }

  updateScore() {
    let score = 0;

    for (let row = 0; row < TILE_COUNT; row++) {
      for (let col = 0; col < TILE_COUNT; col++) {
        let tile = this.getActiveTile(col, row);
        if (tile) {
          score = score + tile.value;
        }
      }
    }

    if (this.scoreDiv != null) {
      this.scoreDiv.innerText = `Score: ${score}`;
    }
  }
}


