export type KeyDownHandler = (event: KeyboardEvent) => void;

export class Game {
  onKeyDown;
  gameDiv;

  constructor(onKeyDown: KeyDownHandler) {
    this.onKeyDown = onKeyDown;
    this.gameDiv = document.getElementById("game-container");

    if (this.onKeyDown != null) {
      document.addEventListener("keydown", this.onKeyDown);
    }
  }

  initDOM(subDiv: HTMLDivElement) {
    if (this.gameDiv != null) {
      while (this.gameDiv.firstChild) {
        this.gameDiv.removeChild(this.gameDiv.firstChild);
      }
      this.gameDiv.appendChild(subDiv); 
    }
  }

  end() {
    if (this.onKeyDown != null) {
      document.removeEventListener("keydown", this.onKeyDown);
    }

    if (this.gameDiv != null) {
      this.gameDiv.innerHTML = "";
    }
  }
}
