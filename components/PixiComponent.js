import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

import pako from "pako";

import Player from "./Player";

import Bars from "./Bars";
import BarsUtils from "./utils/BarsUtils";
import Leaderboard from "./Leaderboard";
import { io } from "socket.io-client";
import Chat from "./Chat";
import XpBubbleUtils from "./utils/XpBubbleUtils";
import HealthBubbleUtils from "./utils/HealthBubbleUtils";
import Minimap from "./Minimap";

import CONSTANTS from "../constants.js";

const socketClient = io();

const PixiComponent = ({ gameData }) => {
  // interact with the bars
  let barsUtils = BarsUtils();
  let xpBubbleUtils = XpBubbleUtils({ socket: socketClient });
  let healthBubbleUtils = HealthBubbleUtils({ socket: socketClient });

  let dataPlayerName = gameData.playerName;
  let dataPlayerColor = gameData.playerColor;
  let playerColorCoded = dataPlayerColor.replace("#", "0x"); // Changement du format de la couleur pour PIXI (format précédent issu de la sélection de couleur dans le menu)

  // Minimap data
  const [player, setPlayer] = useState();

  const [objects, setObjects] = useState([]);

  const updateMinimap = (newPlayer, newObjects) => {
    setPlayer((prevData) => (newPlayer ? newPlayer : prevData));
    setObjects((prevData) => (newObjects ? newObjects : prevData));
  };

  const pixiContainerRef = useRef(null);
  const xpNeeded = [0, 20, 40, 80, 160, 320, 200000]; // Pour chaque niveau, plafond d'expérience requis pour progresser (niveau 0 jamais utilisé en pratique)
  const healthByLevel = [0, 100, 120, 140, 160, 180, 200]; // Maximum de points de vie pour chaque niveau

  let totalBullets = 0; //Nombre de munitions

  const mousePos = { x: 0, y: 0 };

  useEffect(() => {
    // Crée une application PIXI
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      transparent: true, // couleur de fond
    });
    const pixiContainer = pixiContainerRef.current;
    pixiContainer.appendChild(app.view);

    const texture = PIXI.Texture.from("test3.png");
    const background = new PIXI.TilingSprite(
      texture,
      app.screen.width,
      app.screen.height
    );
    background.tileScale.set(1); // Régle l'échelle de la tuile sur 1 pour conserver la taille d'origine
    app.stage.addChild(background);

    // Création du joueur
    let player = Player(
      app.screen.width / 2,
      app.screen.height / 2,
      Math.floor(Math.random() * CONSTANTS.WIDTH - CONSTANTS.WIDTH / 2),
      Math.floor(Math.random() * CONSTANTS.HEIGHT - CONSTANTS.HEIGHT / 2),
      1,
      playerColorCoded,
      healthByLevel[1],
      0,
      dataPlayerName
    );
    app.stage.addChild(player.sprite);
    app.stage.addChild(player.playerNameText);

    setInterval(() => {
      // Regagne une munition toutes les 100ms si le joueur est de niveau 2 ou plus
      if (player.level > 1 && player.ammo < 100) {
        player.ammo += 0.5;
        barsUtils.setBarValue(3, player.ammo);
      }
    }, 100);

    // Evènement déclenché si la position de la souris change
    window.onmousemove = (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };

    // Evènement déclenché si l'on appuie sur la barre d'espace
    window.onkeyup = (e) => {
      e.preventDefault();
      console.log(document.activeElement.tagName !== "INPUT");
      // Vérifie que l'on n'est pas dans le chat
      if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
        creerProjectile();
      }
    };

    // Evènement déclenché si l'on clique gauche
    window.onclick = (e) => {
      e.preventDefault();
      creerProjectile();
    };

    const creerProjectile = (dx, dy) => {
      if (player.level > 1 && player.ammo > 5) {
        let theta = (2 * Math.PI) / player.level;
        for (let i = 0; i < player.level; i++) {
          let theta_0 = -Math.PI / 2;
          if (player.level % 2 == 0) {
            theta_0 += Math.PI / 2 + theta / 2;
          }
          if (player.level == 2 || player.level == 6) {
            theta_0 += Math.PI / 2;
          }
          let dx = Math.cos(theta_0 + theta * i);
          let dy = Math.sin(theta_0 + theta * i);
          let radius = (1.75 * player.sprite.height) / 2;

          let key = JSON.stringify({ id: socketClient.id, num: totalBullets });

          let value = {
            playerId: socketClient.id,
            num: totalBullets,
            worldPosX: player.worldPos.x + radius * dx,
            worldPosY: player.worldPos.y + radius * dy,
            dx: dx,
            dy: dy,
            color: player.color,
            spawnPoint: { x: player.worldPos.x, y: player.worldPos.y },
          };

          let data = JSON.stringify(value);
          // Envoie la balle tirée au server
          socketClient.emit("addBullet", { key: key, value: data });
          totalBullets++;
        }
        // Enlève la balle de la réserve du joueur
        player.ammo -= 5;
        barsUtils.setBarValue(3, player.ammo);
      }
    };

    /*
    Lorsqu'une personne se connecte, le serveur lui envoie des données compressées
    contenant toutes les informations sur l'état du monde.
    Cette fonction décompresse ces données aux moyens de la librairie pako. 
    */
    function decompressData(compressedData) {
      const inflatedData = pako.inflate(compressedData, { to: "string" });
      return JSON.parse(inflatedData);
    }

    let printedBullets = [];
    let bulletList = [];
    socketClient.on("server:allBullet", (message) => {
      //Enlever les missiles des autres joueurs
      message = decompressData(message);
      bulletList = [];
      message.forEach((bullet) => {
        bullet.sprite = PIXI.Sprite.from("/sprites/bullet.png");
        bullet.sprite.anchor.set(0.5);
        bullet.sprite.scale.set(0.5);
        bullet.sprite.x = null;
        bullet.sprite.y = null;
        bullet.sprite.tint = bullet.color;
        bulletList.push(bullet);
      });
    });

    let playerList = [];
    //Créer des joueurs
    socketClient.on("player", (data) => {
      data = decompressData(data);
      playerList.forEach((otherPlayer) => {
        if (otherPlayer.sprite.x !== null && otherPlayer.sprite.y !== null) {
          app.stage.removeChild(otherPlayer.sprite);
          app.stage.removeChild(otherPlayer.playerNameText);
        }
      });
      let temporaryPlayers = [];
      Object.values(data).forEach((otherPlayer) => {
        otherPlayer = JSON.parse(otherPlayer);
        if (otherPlayer.id !== socketClient.id) {
          let otherPlayerObject = Player(
            null,
            null,
            otherPlayer.worldPosX,
            otherPlayer.worldPosY,
            otherPlayer.level,
            otherPlayer.color,
            otherPlayer.hp,
            otherPlayer.xp,
            otherPlayer.name
          );
          temporaryPlayers.push(otherPlayerObject);
        }
      });
      playerList = temporaryPlayers;
    });

    // Initialise les différentes bulles
    let xpBubbleList = [];
    xpBubbleUtils.initialization();
    let healthBubbleList = [];
    healthBubbleUtils.initialization();

    // ---------------------- Joueur ----------------------

    setInterval(() => {
      //Actualise la position du joueur dans le monde
      const cursorX = (mousePos.x - app.screen.width / 2) / app.screen.width;
      const cursorY = (mousePos.y - app.screen.height / 2) / app.screen.height;
      if (
        player.worldPos.x + cursorX * CONSTANTS.PLAYER_SPEED <
          CONSTANTS.WIDTH / 2 &&
        player.worldPos.x + cursorX * CONSTANTS.PLAYER_SPEED >
          -CONSTANTS.WIDTH / 2
      ) {
        player.worldPos.x =
          player.worldPos.x + cursorX * CONSTANTS.PLAYER_SPEED;
        background.tilePosition.x -= cursorX * CONSTANTS.PLAYER_SPEED;
      }
      if (
        player.worldPos.y + cursorY * CONSTANTS.PLAYER_SPEED <
          CONSTANTS.HEIGHT / 2 &&
        player.worldPos.y + cursorY * CONSTANTS.PLAYER_SPEED >
          -CONSTANTS.HEIGHT / 2
      ) {
        player.worldPos.y =
          player.worldPos.y + cursorY * CONSTANTS.PLAYER_SPEED;
        background.tilePosition.y -= cursorY * CONSTANTS.PLAYER_SPEED;
      }

      //Envoie la postion du joueur au serveur
      if (socketClient.connected) {
        socketClient.emit("updatePlayer", {
          id: socketClient.id,
          name: player.name,
          color: player.color,
          worldPosX: player.worldPos.x,
          worldPosY: player.worldPos.y,
          level: player.level,
          hp: player.health,
          xp: player.xpTotal,
          ammo: 0,
        });
      }
    }, 1000 / 60);

    // ---------------------- Boucle du jeu ----------------------

    app.ticker.maxFPS = 65;
    // Boucle du jeu
    app.ticker.add(() => {
      // Enlève les joueurs de l'écran puis actualise leur position
      playerList.forEach((otherPlayer) => {
        if (otherPlayer.sprite.x !== null && otherPlayer.sprite.y !== null) {
          app.stage.removeChild(otherPlayer.sprite);
          app.stage.removeChild(otherPlayer.playerNameText);
        }

        const distX = Math.abs(otherPlayer.worldPos.x - player.worldPos.x);
        const distY = Math.abs(otherPlayer.worldPos.y - player.worldPos.y);

        if (distX < app.screen.width / 2 && distY < app.screen.height / 2) {
          otherPlayer.sprite.x =
            player.sprite.x + otherPlayer.worldPos.x - player.worldPos.x;
          otherPlayer.sprite.y =
            player.sprite.y + otherPlayer.worldPos.y - player.worldPos.y;
          otherPlayer.playerNameText.x = otherPlayer.sprite.x;
          otherPlayer.playerNameText.y = otherPlayer.sprite.y - 55;
        } else {
          otherPlayer.sprite.x = null;
          otherPlayer.sprite.y = null;
        }
      });

      // Mettre les joueurs assez proches du joueur
      playerList.forEach((otherPlayer) => {
        if (otherPlayer.sprite.x !== null && otherPlayer.sprite.y !== null) {
          app.stage.addChild(otherPlayer.sprite);
          app.stage.addChild(otherPlayer.playerNameText);
        }
      });

      // ---------------------- Expérience ----------------------

      // Effacer les anciennes bulles
      xpBubbleList.forEach((bubble) => {
        app.stage.removeChild(bubble.sprite);
      });

      // Récupérer les nouvelles bulles affichables
      xpBubbleList = xpBubbleUtils.getPrintableXpBubbleList(
        player,
        window.innerWidth,
        window.innerHeight
      );
      xpBubbleList.forEach((bubble) => {
        app.stage.addChild(bubble.sprite);
      });

      //Le joueur gagne de l'expérience par des bulles
      xpBubbleList.forEach((bubble) => {
        const distX = Math.abs(bubble.worldPos.x - player.worldPos.x);
        const distY = Math.abs(bubble.worldPos.y - player.worldPos.y);

        if (distX < 45 && distY < 45) {
          app.stage.removeChild(bubble.sprite);
          player.xpValue += bubble.xpValue;
          player.xpTotal += bubble.xpValue;
          xpBubbleUtils.deleteXpBubble(bubble);
          // update the bar
          barsUtils.setBarValue(2, player.xpValue);
        }
      });

      // ---------------------- Bulles de Vie ----------------------

      // Effacer les anciennes bulles
      healthBubbleList.forEach((bubble) => {
        app.stage.removeChild(bubble.sprite);
      });

      // Récupérer les nouvelles bulles affichables
      healthBubbleList = healthBubbleUtils.getPrintableHealthBubbleList(
        player,
        window.innerWidth,
        window.innerHeight
      );
      healthBubbleList.forEach((bubble) => {
        app.stage.addChild(bubble.sprite);
      });

      //Le joueur gagne de la vie par des bulles
      healthBubbleList.forEach((bubble) => {
        const distX = Math.abs(bubble.worldPos.x - player.worldPos.x);
        const distY = Math.abs(bubble.worldPos.y - player.worldPos.y);

        if (distX < 45 && distY < 45) {
          app.stage.removeChild(bubble.sprite);
          healthBubbleUtils.deleteHealthBubble(bubble);
          // change the health bar and the value of the player's health
          if (player.health + bubble.lifeValue < healthByLevel[player.level]) {
            barsUtils.setBarValue(1, player.health + bubble.lifeValue);
            player.health += bubble.lifeValue;
          } else {
            barsUtils.setBarValue(1, healthByLevel[player.level]);
            player.health = healthByLevel[player.level];
          }
        }
      });

      // ---------------------- Évolution ----------------------

      //Vérifie si le joueur peut évoluer
      if (player.xpValue >= xpNeeded[player.level]) {
        let previousAmmo = player.ammo;
        app.stage.removeChild(player.sprite);
        player = Player(
          app.screen.width / 2,
          app.screen.height / 2,
          player.worldPos.x,
          player.worldPos.y,
          player.level + 1,
          playerColorCoded,
          player.health,
          player.xpTotal,
          player.name
        );
        player.ammo = previousAmmo;
        if (player.level >= 1) {
          player.health +=
            healthByLevel[player.level] - healthByLevel[player.level - 1];
        } else {
          // should never happen
          console.log("level 0");
        }
        app.stage.addChild(player.sprite);
        // remettre le text du joueur devant
        app.stage.addChild(player.playerNameText);

        // si evolution : changer les valeurs maximales des barres
        barsUtils.setBarMaxValue(1, healthByLevel[player.level]);
        barsUtils.setBarMaxValue(2, xpNeeded[player.level]);
        // heal the player with the amount the level up gave him
        barsUtils.setBarValue(1, player.health);
        // remettre la barre d'XP à 0
        barsUtils.setBarValue(2, 0);
        // changer le nom de la barre d'XP
        barsUtils.setBarName(2, "XP " + player.level);
      }

      // ---------------------- Bullets ----------------------

      // Enlever les missiles des autres joueurs
      printedBullets.forEach((missile) => {
        app.stage.removeChild(missile.sprite);
      });
      printedBullets = [];

      // Actualiser les missiles
      bulletList.forEach((missile) => {
        let distX = Math.abs(missile.worldPos.x - player.worldPos.x);
        let distY = Math.abs(missile.worldPos.y - player.worldPos.y);
        if (distX < window.innerWidth / 2 && distY < window.innerHeight / 2) {
          missile.sprite.x =
            missile.worldPos.x + window.innerWidth / 2 - player.worldPos.x;
          missile.sprite.y =
            missile.worldPos.y + window.innerHeight / 2 - player.worldPos.y;
          printedBullets.push(missile);
        }
      });

      // Verifier si le joueur est touché par un missile
      printedBullets.forEach((missile) => {
        if (missile.playerId !== socketClient.id) {
          const distX = Math.abs(missile.worldPos.x - player.worldPos.x);
          const distY = Math.abs(missile.worldPos.y - player.worldPos.y);
          if (distX < 45 && distY < 45) {
            console.log("touché");
            player.health -= missile.dmgValue;

            bulletList = bulletList.filter((bullet) => {
              return (
                bullet.num !== missile.num ||
                bullet.playerId !== missile.playerId
              );
            });

            socketClient.emit(
              "client:deleteBullet",
              JSON.stringify({ id: missile.playerId, num: missile.num })
            );

            // change the health bar
            barsUtils.setBarValue(1, player.health);

            // if the player is dead
            if (player.health <= 0) {
              app.stage.removeChild(player.sprite);
              if (player.level === 1) {
                player = Player(
                  app.screen.width / 2,
                  app.screen.height / 2,
                  Math.floor(
                    Math.random() * CONSTANTS.WIDTH - CONSTANTS.WIDTH / 2
                  ),
                  Math.floor(
                    Math.random() * CONSTANTS.HEIGHT - CONSTANTS.HEIGHT / 2
                  ),
                  1,
                  player.color,
                  healthByLevel[1],
                  0,
                  player.name
                );
              } else {
                let previousAmmo = player.ammo;
                player = Player(
                  app.screen.width / 2,
                  app.screen.height / 2,
                  player.worldPos.x,
                  player.worldPos.y,
                  player.level - 1,
                  player.color,
                  healthByLevel[player.level - 1],
                  player.xpTotal - xpNeeded[player.level - 1] - player.xpValue,
                  player.name
                );
                player.ammo = previousAmmo;
              }

              app.stage.addChild(player.sprite);
              // remettre le text du joueur devant
              app.stage.addChild(player.playerNameText);

              // on change les max des bars au niveau en dessous
              barsUtils.setBarMaxValue(1, healthByLevel[player.level]);
              barsUtils.setBarMaxValue(2, xpNeeded[player.level]);
              // remettre la barre de vie à 100%
              barsUtils.setBarValue(1, healthByLevel[player.level]);
              // remettre la barre d'XP à 0
              barsUtils.setBarValue(2, 0);
              // changer le nom de la barre d'XP
              barsUtils.setBarName(
                2,
                "XP " + parseInt(player.level).toString()
              );
            }
          }
        }
      });

      // Afficher les missiles
      printedBullets.forEach((missile) => {
        app.stage.addChild(missile.sprite);
      });

      // ---------------------- Minimap ----------------------

      // update the minimap
      setPlayer((prevData) => ({
        top:
          (100 * (player.worldPos.y + CONSTANTS.HEIGHT / 2)) /
            CONSTANTS.HEIGHT +
          "%",
        left:
          (100 * (player.worldPos.x + CONSTANTS.WIDTH / 2)) / CONSTANTS.WIDTH +
          "%",
        backgroundColor: playerColorCoded.replace("0x", "#"),
      }));

      let posPlayer = playerList.map((otherPlayer, indice) => {
        return {
          id: indice,
          position: {
            top:
              (100 * (otherPlayer.worldPos.y + CONSTANTS.HEIGHT / 2)) /
                CONSTANTS.HEIGHT +
              "%",
            left:
              (100 * (otherPlayer.worldPos.x + CONSTANTS.WIDTH / 2)) /
                CONSTANTS.WIDTH +
              "%",
            backgroundColor: otherPlayer.color.replace("0x", "#"),
          },
        };
      });
      setObjects(posPlayer);
    });

    // ---------------------- Fin ----------------------

    // Nettoyez l'application PIXI lorsque le composant est démonté
    return () => {
      app.stage.removeChild(player.sprite);
      app.stage.removeChild(player.playerNameText);
      pixiContainer.removeChild(app.view);
      app.destroy();
    };
  }, []);
  return (
    <div ref={pixiContainerRef}>
      <Chat socket={socketClient} />
      <Bars barsData={barsUtils.barsData} />
      <Leaderboard socket={socketClient} />
      <Minimap player={player} objects={objects} />
    </div>
  );
};

export default PixiComponent;
