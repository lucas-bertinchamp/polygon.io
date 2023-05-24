import * as PIXI from "pixi.js";

const Projectile = (
  playerId,
  num,
  dX,
  dY,
  worldPosX,
  worldPosY,
  speed,
  color,
  dmgValue
) => {
  const missile_Sprite = PIXI.Sprite.from("/sprites/bullet.png");

  missile_Sprite.anchor.set(0.5);
  missile_Sprite.scale.set(0.5);
  missile_Sprite.tint = color;

  return {
    playerId: playerId,
    num: num,
    sprite: missile_Sprite,
    worldPos: { x: worldPosX, y: worldPosY },
    dmgValue: dmgValue,
    speed_x: dX * speed,
    speed_y: dY * speed,
  };
};

export default Projectile;
