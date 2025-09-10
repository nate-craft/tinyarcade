
import { Game2048 } from "./2048/2048.js";
import { Game } from "./common/game.js";

document.addEventListener('DOMContentLoaded', () => {
  let game: Game;

  function onNav(name: String | undefined) {
    if (game) {
      game.end();
    }

    if (name === "2048") {
      game = new Game2048();
    }
  }

  document.getElementById("nav-2048")?.addEventListener("click", () => onNav("2048"));
  document.getElementById("nav-home")?.addEventListener("click", () => onNav(undefined));
});
