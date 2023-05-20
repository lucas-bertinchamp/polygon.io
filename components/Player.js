import * as PIXI from "pixi.js";

const Player = (posX, posY, worldPosX, worldPosY, level, color, health) => {
  worldPosX = worldPosX;
  worldPosY = worldPosY;

  let spritePlayer = chooseSprite(level);
  spritePlayer.tint = color;
  spritePlayer.x = posX;
  spritePlayer.y = posY;

  return {
    sprite: spritePlayer,
    worldPos: { x: worldPosX, y: worldPosY },
    xpValue: 0,
    level: level,
    health: health,
    color: color,
  };
};

const chooseSprite = (level) => {
  let spritePlayer = null;
  switch (level) {
    case 1:
      spritePlayer = PIXI.Sprite.from("sprites/1_lvl_player.png");
      spritePlayer.anchor.set(0.5);
      spritePlayer.scale.set(1);
      return spritePlayer;
    case 2:
      spritePlayer = PIXI.Sprite.from("sprites/2_lvl_player.png");
      spritePlayer.anchor.set(0.5);
      spritePlayer.scale.set(0.5);
      return spritePlayer;
    case 3:
      spritePlayer = PIXI.Sprite.from("sprites/3_lvl_player.png");
      spritePlayer.anchor.set(0.5);
      spritePlayer.scale.set(0.2);
      return spritePlayer;
    case 4:
      spritePlayer = PIXI.Sprite.from("sprites/4_lvl_player.png");
      spritePlayer.anchor.set(0.5);
      spritePlayer.scale.set(0.2);
      return spritePlayer;
    case 5:
      spritePlayer = PIXI.Sprite.from("sprites/5_lvl_player.png");
      spritePlayer.anchor.set(0.5);
      spritePlayer.scale.set(0.2);
      return spritePlayer;
    case 6:
      spritePlayer = PIXI.Sprite.from("sprites/6_lvl_player.png");
      spritePlayer.anchor.set(0.5);
      spritePlayer.scale.set(0.2);
      return spritePlayer;
  }
};

export default Player;
