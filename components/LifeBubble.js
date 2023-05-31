import * as PIXI from "pixi.js";

/*
Une bulle de vie spécifique est définie par sa position sur l'écran du joueur et celle dans l'ensemble de l'espace de jeu. 
*/
const LifeBubble = (posX, posY, worldPosX, worldPosY) => {

  //Définir l'apparence d'une bulle de vie
  const bubbleSprite = PIXI.Sprite.from("sprites/bulle_vie.png");
  bubbleSprite.anchor.set(0.5);
  bubbleSprite.scale.set(0.5);

  bubbleSprite.x = posX;
  bubbleSprite.y = posY;

  //Renvoie la bulle avec ses propriétés (apparence et position)
  return {
    sprite: bubbleSprite,
    worldPos: { x: worldPosX, y: worldPosY },
    lifeValue: 25,
  };
};

export default LifeBubble;
