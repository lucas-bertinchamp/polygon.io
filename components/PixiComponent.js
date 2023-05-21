import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import XpBubble from "./XpBubble";
import LifeBubble from "./LifeBubble";
import Player from "./Player";
import { Projectile } from "./Projectile";

const PixiComponent = () => {
  const worldWidth = 1000;
  const worldHeight = 1000;

  const nXpBubble = 10;
  const nLifeBubble = 2;
  const pixiContainerRef = useRef(null);
  const xpNeeded = [0, 10, 20, 40, 80, 160];

  const mousePos = { x: 0, y: 0 };

  useEffect(() => {
    // Créer une application PIXI
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x0a0a0a, // couleur de fond
    });
    const pixiContainer = pixiContainerRef.current;
    pixiContainer.appendChild(app.view);

    // Création du joueur
    let player = Player(
      app.screen.width / 2,
      app.screen.height / 2,
      0,
      0,
      1,
      0x00ff00,
      100
    );
    app.stage.addChild(player.sprite);

    // Créer des missiles
    const missiles = []

    // Evenement déclenché si la position de la souris change
    window.onmousemove = (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };

    // Evenement déclenché si on clique
    window.onclick = (e) => {
      if (Player.level > 1) {
        //theta = e(2i*pi/Player.level)
        theta = Math.complex({ r: 1, phi: 2*Math.PI/Player.level})
        for (let i = 0; i < Player.level; i++) {
          z_0 = math.complex(0,1)
          if (Player.level %2 == 1) {
            z_0 = math.multiply(z_0,theta.pow(1/2))
          }  
          dx = math.multiply(z_0, theta.pow(i)).re
          dy = math.multiply(z_0, theta.pow(i)).im
          radius = Player.sprite.height / 2;
          const missile = Projectile(dx, dy,10, Player.color, 1);
          missile.sprite.x = Player.sprite.x + radius * dx;
          missile.sprite.y = Player.sprite.y + radius * dy;
          missile.worldPos.x = Player.worldPos.x + radius * dx;
          missile.worldPos.y = Player.worldPos.y + radius * dy;
          missiles.push(missile);
        }
      }
    };

    // Créer des bulles d'expérience
    const xpBubbles = [];
    for (let i = 0; i < nXpBubble; i++) {
      xpBubbles.push(
        XpBubble(
          null,
          null,
          (Math.random() * 2 - 1) * 500,
          (Math.random() * 2 - 1) * 500
        )
      );
    }

    //Créer des bulles de vie
    const lifeBubbles = [];
    for (let i = 0; i < nLifeBubble; i++) {
      lifeBubbles.push(
        LifeBubble(
          null,
          null,
          (Math.random() * 2 - 1) * 500,
          (Math.random() * 2 - 1) * 500
        )
      );
    }

    // Boucle du jeu
    app.ticker.add(() => {
      const speed = 7.5;

      //Actualise la position du joueur dans le monde
      const cursorX = (mousePos.x - app.screen.width / 2) / app.screen.width;
      const cursorY = (mousePos.y - app.screen.height / 2) / app.screen.height;
      if (
        player.worldPos.x + cursorX * speed < worldWidth / 2 &&
        player.worldPos.x + cursorX * speed > -worldWidth / 2
      ) {
        player.worldPos.x = player.worldPos.x + cursorX * speed;
      }
      if (
        player.worldPos.y + cursorY * speed < worldHeight / 2 &&
        player.worldPos.y + cursorY * speed > -worldHeight / 2
      ) {
        player.worldPos.y = player.worldPos.y + cursorY * speed;
      }

      //Le joueur gagne de l'expérience par des bulles
      xpBubbles.forEach((bubble) => {
        const distX = Math.abs(bubble.worldPos.x - player.worldPos.x);
        const distY = Math.abs(bubble.worldPos.y - player.worldPos.y);

        if (distX < 45 && distY < 45) {
          app.stage.removeChild(bubble.sprite);
          xpBubbles.splice(xpBubbles.indexOf(bubble), 1);
          player.xpValue += bubble.xpValue;
        }
      });

      //Le joueur gagne de la vie par des bulles
      lifeBubbles.forEach((bubble) => {
        const distX = Math.abs(bubble.worldPos.x - player.worldPos.x);
        const distY = Math.abs(bubble.worldPos.y - player.worldPos.y);

        if (distX < 45 && distY < 45) {
          app.stage.removeChild(bubble.sprite);
          lifeBubbles.splice(lifeBubbles.indexOf(bubble), 1);
          player.health += bubble.lifeValue;
        }
      });

      console.log(player.health);

      //Vérifie si le joueur peut évoluer
      if (player.xpValue >= xpNeeded[player.level]) {
        app.stage.removeChild(player.sprite);
        player = Player(
          app.screen.width / 2,
          app.screen.height / 2,
          player.worldPos.x,
          player.worldPos.y,
          player.level + 1,
          0x00ff00,
          player.health
        );
        app.stage.addChild(player.sprite);
      }

      //Enlever toutes les bulles
      xpBubbles.concat(lifeBubbles).forEach((bubble) => {
        app.stage.removeChild(bubble.sprite);
      });

      //Actualise la position des bulles sur l'écran
      xpBubbles.concat(lifeBubbles).forEach((bubble) => {
        const distX = Math.abs(bubble.worldPos.x - player.worldPos.x);
        const distY = Math.abs(bubble.worldPos.y - player.worldPos.y);

        if (distX < app.screen.width / 2 && distY < app.screen.height / 2) {
          bubble.sprite.x =
            player.sprite.x + bubble.worldPos.x - player.worldPos.x;
          bubble.sprite.y =
            player.sprite.y + bubble.worldPos.y - player.worldPos.y;
        } else {
          bubble.sprite.x = null;
          bubble.sprite.y = null;
        }
      });

      // Remettre toutes les bulles d'expérience assez proches du joueur
      xpBubbles.forEach((bubble) => {
        if (bubble.sprite.x !== null && bubble.sprite.y !== null) {
          app.stage.addChild(bubble.sprite);
        }
      });
      lifeBubbles.forEach((bubble) => {
        if (bubble.sprite.x !== null && bubble.sprite.y !== null) {
          app.stage.addChild(bubble.sprite);
        }
      });
    });


      //Enlever les missiles
      missiles.forEach((missile) => {
        app.stage.removeChild(missile.sprite);
      });

      // Deplacer les missiles
      missiles.forEach((missile) => {
        missile.worldPos.x += missile.speed.x;
        missile.worldPos.y += missile.speed.y;

        const distX = Math.abs(missile.worldPos.x - player.worldPos.x);
        const distY = Math.abs(missile.worldPos.y - player.worldPos.y);

        if (distX < app.screen.width / 2 && distY < app.screen.height / 2) {
          missile.sprite.x =
            player.sprite.x + missile.worldPos.x - player.worldPos.x;
          missile.sprite.y =
            player.sprite.y + missile.worldPos.y - player.worldPos.y;
        } else {
          missile.sprite.x = null;
          missile.sprite.y = null;
        }
      });

      // vérifier si le joueur est touché par un missile
      missiles.forEach((missile) => {
        const distX = Math.abs(missile.worldPos.x - player.worldPos.x);
        const distY = Math.abs(missile.worldPos.y - player.worldPos.y);

        if (distX < 45 && distY < 45) {
          app.stage.removeChild(missile.sprite);
          missiles.splice(missiles.indexOf(missile), 1);
          player.health -= missile.damage;
        }
      });

      // Remettre les missiles assez proches du joueur
      missiles.forEach((missile) => {
        if (missile.sprite.x !== null && missile.sprite.y !== null) {
          app.stage.addChild(missile.sprite);
        }
      });

    // Nettoyez l'application PIXI lorsque le composant est démonté
    return () => {
      pixiContainer.removeChild(app.view);
      app.destroy();
    };
  }, []);
  return <div ref={pixiContainerRef} />;
};

export default PixiComponent;