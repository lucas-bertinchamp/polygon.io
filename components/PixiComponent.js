import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import XpBubble from "./XpBubble";
import LifeBubble from "./LifeBubble";
import Player from "./Player";
import Projectile from "./Projectile";
import Bars from "./Bars";
import BarsUtils from "./utils/BarsUtils";
import Leaderboard from "./Leaderboard";
import { io } from "socket.io-client";
import Chat from "./Chat";
import XpBubbleUtils from "./utils/XpBubbleUtils";
import HealthBubbleUtils from "./utils/HealthBubbleUtils";

const socketClient = io();

const PixiComponent = ({ gameData }) => {
  // interact with the bars
  let barsUtils = BarsUtils();
  let xpBubbleUtils = XpBubbleUtils({ socket: socketClient });
  let healthBubbleUtils = HealthBubbleUtils({ socket: socketClient });

  let dataPlayerName = gameData.playerName;
  let dataPlayerColor = gameData.playerColor;
  let playerColorCoded = dataPlayerColor.replace("#", "0x");

  // Leaderboard data (for testing, it should be fetched from the API)
  let testLeaderboardData = [
    { id: 1, playerName: "Elie", score: 10000, color: "red" },
    { id: 2, playerName: "John", score: 80, color: "blue" },
    { id: 3, playerName: "Laulau2", score: 120, color: "green" },
    { id: 4, playerName: dataPlayerName, score: 0, color: playerColorCoded },
    { id: 5, playerName: "Laulau1", score: 666, color: "yellow" },
    { id: 6, playerName: "Laulau4", score: 777, color: "purple" },
    { id: 7, playerName: "Laulau3", score: -4 },
    { id: 8, playerName: "Laulau5", score: 1 },
    { id: 9, playerName: "Laulau6", score: 30 },
    { id: 10, playerName: "Laulau7".slice(0, 13), score: 420 },
    { id: 11, playerName: "DoitPasEtreAffiche".slice(0, 13), score: -420 },
  ];

  const worldWidth = 1000;
  const worldHeight = 1000;

  const pixiContainerRef = useRef(null);
  const xpNeeded = [0, 10, 20, 40, 80, 160, 100000]; // 0 to start at index 1 for level 1
  const healthByLevel = [0, 100, 120, 140, 160, 180, 200]; // 0 to start at index 1 for level 1

  let totalBullets = 0;

  const mousePos = { x: 0, y: 0 };

  useEffect(() => {
    // Créer une application PIXI
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xffffff, // couleur de fond
    });
    const pixiContainer = pixiContainerRef.current;
    pixiContainer.appendChild(app.view);

    // Création du joueur
    let player = Player(
      app.screen.width / 2,
      app.screen.height / 2,
      Math.floor(Math.random() * worldWidth - worldWidth / 2),
      Math.floor(Math.random() * worldHeight - worldHeight / 2),
      1,
      playerColorCoded,
      healthByLevel[1],
      0,
      dataPlayerName
    );
    app.stage.addChild(player.sprite);
    app.stage.addChild(player.playerNameText);

    // Evenement déclenché si la position de la souris change
    window.onmousemove = (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };

    let ownBullet = [];
    // Evenement déclenché si on clique
    window.onclick = (e) => {
      if (player.level > 1) {
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
          let radius = (1.5 * player.sprite.height) / 2;
          const missile = Projectile(
            socketClient.id,
            totalBullets,
            dx,
            dy,
            null,
            null,
            10,
            player.color,
            5
          );
          missile.sprite.x = player.sprite.x + radius * dx;
          missile.sprite.y = player.sprite.y + radius * dy;
          missile.worldPos.x = player.worldPos.x + radius * dx;
          missile.worldPos.y = player.worldPos.y + radius * dy;
          let key = JSON.stringify({ id: socketClient.id, num: totalBullets });
          let value = JSON.stringify({
            playerId: socketClient.id,
            num: totalBullets,
            dX: dx,
            dY: dy,
            worldPosX: missile.worldPos.x,
            worldPosY: missile.worldPos.y,
            color: player.color,
            dmgValue: missile.dmgValue,
          });
          let data = JSON.stringify({ key: key, value: value });
          // Envoyer la bullets au server
          socketClient.emit("addBullet", data);
          totalBullets++;
          ownBullet.push(missile);
        }
      }
    };

    let otherBulletParsed = [];
    let otherBullet = [];
    // Créer les projectiles des autres joueurs
    socketClient.on("allBullet", (data) => {
      otherBulletParsed = [];
      // Ne garder que les projectiles des autres joueurs
      Object.keys(data).forEach((key) => {
        let parsedKey = JSON.parse(key);
        if (parsedKey.id !== socketClient.id) {
          let value = JSON.parse(data[key]);
          value.playerId = parsedKey.id;
          otherBulletParsed.push(value);
        }
      });
    });

    socketClient.on("deleteContactBullet", (data) => {
      let parsedData = JSON.parse(data);
      ownBullet.forEach((bullet) => {
        if (
          bullet.num === parsedData.num &&
          bullet.playerId === parsedData.id
        ) {
          app.stage.removeChild(bullet.sprite);
          ownBullet.splice(ownBullet.indexOf(bullet), 1);
        }
      });
      otherBullet.forEach((bullet) => {
        if (
          bullet.num === parsedData.num &&
          bullet.playerId === parsedData.id
        ) {
          app.stage.removeChild(bullet.sprite);
          otherBullet.splice(otherBullet.indexOf(bullet), 1);
        }
      });
    });

    let playerList = [];
    //Créer des joueurs
    socketClient.on("player", (data) => {
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

    let xpBubbleList = [];
    let healthBubbleList = [];

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

      // ---------------------- Autres ----------------------

      //Vérifie si le joueur peut évoluer
      if (player.xpValue >= xpNeeded[player.level]) {
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

      //Enlever toutes les bulles
      healthBubbleList.forEach((bubble) => {
        app.stage.removeChild(bubble.sprite);
      });

      //Actualise la position des bulles sur l'écran
      healthBubbleList.forEach((bubble) => {
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

      healthBubbleList.forEach((bubble) => {
        if (bubble.sprite.x !== null && bubble.sprite.y !== null) {
          app.stage.addChild(bubble.sprite);
        }
      });

      //Enlever les missiles
      ownBullet.forEach((missile) => {
        app.stage.removeChild(missile.sprite);
      });

      // Deplacer les missiles
      ownBullet.forEach((missile) => {
        missile.worldPos.x += missile.speed_x;
        missile.worldPos.y += missile.speed_y;

        let key = JSON.stringify({ id: socketClient.id, num: missile.num });
        let value = JSON.stringify({
          playerId: socketClient.id,
          num: missile.num,
          dX: missile.speed_x,
          dY: missile.speed_y,
          worldPosX: missile.worldPos.x,
          worldPosY: missile.worldPos.y,
          color: player.color,
          dmgValue: missile.dmgValue,
        });
        let data = JSON.stringify({ key: key, value: value });
        // Envoyer la bullet au server
        socketClient.emit("addBullet", data);

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

        if (
          missile.worldPos.x > worldWidth / 2 ||
          missile.worldPos.x < -worldWidth / 2 ||
          missile.worldPos.y > worldHeight / 2 ||
          missile.worldPos.y < -worldHeight / 2
        ) {
          ownBullet.splice(ownBullet.indexOf(missile), 1);
          //suprimer la bullet de la base de données
          socketClient.emit(
            "deleteBullet",
            JSON.stringify({
              id: socketClient.id,
              num: missile.num,
            })
          );
        }
      });

      // Afficher les bullets des autres joueurs assez proches du joueur
      otherBullet.forEach((missile) => {
        app.stage.removeChild(missile.sprite);
      });
      otherBullet = [];
      otherBulletParsed.forEach((missile) => {
        let distX = Math.abs(missile.worldPosX - player.worldPos.x);
        let distY = Math.abs(missile.worldPosY - player.worldPos.y);

        if (distX < app.screen.width / 2 && distY < app.screen.height / 2) {
          let bullet = Projectile(
            missile.playerId,
            missile.num,
            missile.dX,
            missile.dY,
            missile.worldPosX,
            missile.worldPosY,
            10,
            missile.color,
            missile.dmgValue
          );
          bullet.sprite.x =
            player.sprite.x + bullet.worldPos.x - player.worldPos.x;
          bullet.sprite.y =
            player.sprite.y + bullet.worldPos.y - player.worldPos.y;
          app.stage.addChild(bullet.sprite);
          otherBullet.push(bullet);
        }
      });

      // vérifier si le joueur est touché par un missile
      otherBullet.forEach((missile) => {
        const distX = Math.abs(missile.worldPos.x - player.worldPos.x);
        const distY = Math.abs(missile.worldPos.y - player.worldPos.y);
        if (distX < 45 && distY < 45) {
          // augmenter les valeurs de comparaison avec distX et distY pour tester la suite (45 = valeurs de base)
          console.log("touché");

          app.stage.removeChild(missile.sprite);
          otherBullet.splice(otherBullet.indexOf(missile), 1);

          player.health -= missile.dmgValue;

          otherBulletParsed.forEach((bullet) => {
            if (
              bullet.num === missile.num &&
              bullet.playerId === missile.playerId
            ) {
              otherBulletParsed.splice(otherBulletParsed.indexOf(bullet), 1);
            }
          });

          // Dire au serveur d'enlever la bullet
          socketClient.emit(
            "deleteContactBullet",
            JSON.stringify({
              id: missile.playerId,
              num: missile.num,
            })
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
                Math.floor(Math.random() * worldWidth - worldWidth / 2),
                Math.floor(Math.random() * worldHeight - worldHeight / 2),
                1,
                player.color,
                healthByLevel[1],
                0,
                player.name
              );
            } else {
              player = Player(
                app.screen.width / 2,
                app.screen.height / 2,
                player.worldPos.x,
                player.worldPos.y,
                player.level - 1,
                player.color,
                healthByLevel[player.level - 1],
                player.xpTotal - xpNeeded[player.level - 1],
                player.name
              );
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
            barsUtils.setBarName(2, "XP " + parseInt(player.level).toString());
          }
        }
      });

      // Remettre les missiles assez proches du joueur
      ownBullet.forEach((missile) => {
        if (missile.sprite.x !== null && missile.sprite.y !== null) {
          app.stage.addChild(missile.sprite);
        }
      });
    });

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
    </div>
  );
};

export default PixiComponent;
