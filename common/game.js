export class Game {
  onKeyDown;
  gameDiv;

  constructor(onKeyDown) {
    this.onKeyDown = onKeyDown;
    this.gameDiv = document.getElementById("game-container");

    if (this.onKeyDown != null) {
      document.addEventListener("keydown", this.onKeyDown);
    }
  }

  initDOM(subDiv) {
    while (this.gameDiv.firstChild) {
      this.gameDiv.removeChild(this.gameDiv.firstChild);
    }

    this.gameDiv.appendChild(subDiv);
  }

  end() {
    if (this.onKeyDown != null) {
      document.removeEventListener("keydown", this.onKeyDown);
    }

    this.gameDiv.innerHTML = "";
  }
}
