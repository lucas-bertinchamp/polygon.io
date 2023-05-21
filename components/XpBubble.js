import * as PIXI from "pixi.js";

const XpBubble = (posX, posY, worldPosX, worldPosY) => {
  const randomSprite = Math.floor(Math.random() * 2) + 1;
  const bubbleSprite = PIXI.Sprite.from(
    "sprites/bulle_XP_" + randomSprite + ".png"
  );
  bubbleSprite.anchor.set(0.5);
  bubbleSprite.scale.set(0.5);

  bubbleSprite.x = posX;
  bubbleSprite.y = posY;

  return {
    sprite: bubbleSprite,
    worldPos: { x: worldPosX, y: worldPosY },
    xpValue: 5,
  };
};

export default XpBubble;