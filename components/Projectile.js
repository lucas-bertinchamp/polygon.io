import * as PIXI from "pixi.js";

const Projectile  = (dX, dY, speed, color, dmgValue)  => {
    const missile_Sprite = PIXI.Sprite.from(
        "sprites/bullet.png"
      );

    missile_Sprite.anchor.set(0.5);
    missile_Sprite.scale.set(0.5);
    missile_Sprite.tint = color;

    return {
        sprite: missile_Sprite,
        worldPos: { x: null, y: null },
        dmgValue: dmgValue,
        speed_x: dX*speed,
        speed_y: dY*speed,
    };
};

export default Projectile;
