import * as PIXI from "pixi.js";

const Projectile = (
  playerId,
  num,
  dX, //déplacement élémentaire en x par unité de vitesse
  dY, //déplacement élémentaire en y par unité de vitesse
  worldPosX,
  worldPosY,
  speed, //vitesse de déplacement dans la direction du tir
  color,
  dmgValue //nombre de points de vie ôtés à l'éventuelle cible touchée
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
    color: color,
  };
};

export default Projectile;
