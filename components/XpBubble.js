import * as PIXI from "pixi.js";

/*
Une bulle d'expérience spécifique est définie par sa position sur l'écran du joueur et celle dans l'ensemble de l'espace de jeu. 
*/
const XpBubble = (posX, posY, worldPosX, worldPosY) => {
  const nSprite = ((Math.abs(worldPosX) + Math.abs(worldPosY)) % 2) + 1;
  const bubbleSprite = PIXI.Sprite.from("sprites/bulle_XP_" + nSprite + ".png");
  bubbleSprite.anchor.set(0.5);
  bubbleSprite.scale.set(0.5);

  bubbleSprite.x = posX;
  bubbleSprite.y = posY;

  //Renvoie la bulle avec ses propriétés (apparence et position)
  return {
    sprite: bubbleSprite,
    worldPos: { x: worldPosX, y: worldPosY },
    xpValue: 2,
  };
};

export default XpBubble;
