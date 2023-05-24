import * as PIXI from "pixi.js";

const LifeBubble = (posX, posY, worldPosX, worldPosY) => {
  const bubbleSprite = PIXI.Sprite.from("sprites/bulle_vie.png");
  bubbleSprite.anchor.set(0.5);
  bubbleSprite.scale.set(0.5);

  bubbleSprite.x = posX;
  bubbleSprite.y = posY;

  return {
    sprite: bubbleSprite,
    worldPos: { x: worldPosX, y: worldPosY },
    lifeValue: 25,
  };
};

export default LifeBubble;
