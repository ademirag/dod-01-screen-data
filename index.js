const fs = require("fs");
const keypress = require("keypress");

const WIDTH = 16;
const HEIGHT = 9;

var gameData;

var screenBuffer = [];

const createGameData = () => {
  var data = {
    screenBuffer: [],
    gameState: {
      mode: "intro",
      position: 0
    },
    inputMap: { left: {}, up: {}, right: {}, down: {} }
  };

  for (var i = 0; i < WIDTH * HEIGHT; i++) data.screenBuffer.push(".");

  data.screenBuffer[data.gameState.position] = "X";

  for (var j = 0; j < HEIGHT; j++) {
    for (var i = 1; i < WIDTH; i++) {
      data.inputMap.left[j * WIDTH + i] = -1;
    }
  }

  for (var j = 0; j < HEIGHT; j++) {
    for (var i = 0; i < WIDTH - 1; i++) {
      data.inputMap.right[j * WIDTH + i] = 1;
    }
  }

  for (var j = 1; j < HEIGHT; j++) {
    for (var i = 0; i < WIDTH; i++) {
      data.inputMap.up[j * WIDTH + i] = -WIDTH;
    }
  }

  for (var j = 0; j < HEIGHT - 1; j++) {
    for (var i = 0; i < WIDTH; i++) {
      data.inputMap.down[j * WIDTH + i] = WIDTH;
    }
  }

  fs.writeFileSync("gamedata.json", JSON.stringify(data), {
    encoding: "utf-8"
  });
};

const loadGameData = () => {
  gameData = JSON.parse(fs.readFileSync("gamedata.json", "utf-8"));
};

const render = () => {
  console.clear();
  for (var y = 0; y < HEIGHT; y++) {
    for (var x = 0; x < WIDTH; x++) {
      process.stdout.write(gameData.screenBuffer[y * WIDTH + x]);
    }
    process.stdout.write("\n");
  }
};

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

(async () => {
  if (!fs.existsSync("gamedata.json")) {
    createGameData();
  }

  loadGameData();
  keypress(process.stdin);

  // listen for the "keypress" event
  process.stdin.on("keypress", function(ch, key) {
    if (
      gameData.inputMap[key.name] &&
      gameData.inputMap[key.name][gameData.gameState.position]
    ) {
      gameData.screenBuffer[gameData.gameState.position] = ".";
      gameData.gameState.position +=
        gameData.inputMap[key.name][gameData.gameState.position];
      gameData.screenBuffer[gameData.gameState.position] = "X";
    }

    if (key && key.ctrl && key.name == "c") {
      process.exit(1);
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  while (true) {
    render();
    await sleep(500);
  }
})();
