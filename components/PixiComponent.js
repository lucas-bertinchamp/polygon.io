import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import XpBubble from "./XpBubble";
import LifeBubble from "./LifeBubble";
import Player from "./Player";
import Bars from "./Bars";
import BarsUtils from "./utils/BarsUtils";

const PixiComponent = ({ gameData }) => {
    // interact with the bars
    let barsUtils = BarsUtils();

    let playerName = gameData.playerName;
    let playerColor = gameData.playerColor;
    let playerColorCoded = playerColor.replace("#", "0x");

    const worldWidth = 1000;
    const worldHeight = 1000;

    const nXpBubble = 20;
    const nLifeBubble = 4;
    const pixiContainerRef = useRef(null);
    const xpNeeded = [0, 10, 20, 40, 80, 160];
    const healthByLevel = [100, 120, 140, 160, 180, 200];

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
            0,
            0,
            1,
            playerColorCoded,
            100
        );
        app.stage.addChild(player.sprite);

        // Create playerName text
        const playerNameText = new PIXI.Text(playerName, {
            fill: 0x000000, // text color
        });
        playerNameText.anchor.set(0.5); // center the text
        playerNameText.position.set(player.sprite.x, player.sprite.y - 55);
        app.stage.addChild(playerNameText);

        // Evenement déclenché si la position de la souris change
        window.onmousemove = (e) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
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
            const cursorX =
                (mousePos.x - app.screen.width / 2) / app.screen.width;
            const cursorY =
                (mousePos.y - app.screen.height / 2) / app.screen.height;
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
                    // update the bar
                    barsUtils.setBarValue(
                        2,
                        barsUtils.getBarValue(2) + bubble.xpValue
                    );
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
                    if (
                        barsUtils.getBarValue(1) + bubble.lifeValue <
                        barsUtils.getBarMaxValue(1)
                    )
                        barsUtils.setBarValue(
                            1,
                            barsUtils.getBarValue(1) + bubble.lifeValue
                        );
                    else barsUtils.setBarValue(1, barsUtils.getBarMaxValue(1));
                }
            });

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
                    player.health
                );
                app.stage.addChild(player.sprite);
                // remettre le text du joueur devant
                app.stage.addChild(playerNameText);

                // si evolution : changer les valeurs maximales des barres
                barsUtils.setBarMaxValue(1, healthByLevel[player.level - 1]);
                barsUtils.setBarMaxValue(
                    2,
                    barsUtils.getBarMaxValue(2) + xpNeeded[player.level - 1]
                );
                // heal the player with the amount the level up gave him
                barsUtils.setBarValue(
                    1,
                    barsUtils.getBarValue(1) +
                        healthByLevel[player.level - 1] -
                        healthByLevel[player.level - 2]
                );
                // remettre la barre d'XP à 0
                barsUtils.setBarValue(2, 0);
                // changer le nom de la barre d'XP
                barsUtils.setBarName(2, "XP " + player.level);
            }

            //Enlever toutes les bulles
            xpBubbles.concat(lifeBubbles).forEach((bubble) => {
                app.stage.removeChild(bubble.sprite);
            });

            //Actualise la position des bulles sur l'écran
            xpBubbles.concat(lifeBubbles).forEach((bubble) => {
                const distX = Math.abs(bubble.worldPos.x - player.worldPos.x);
                const distY = Math.abs(bubble.worldPos.y - player.worldPos.y);

                if (
                    distX < app.screen.width / 2 &&
                    distY < app.screen.height / 2
                ) {
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

        // Nettoyez l'application PIXI lorsque le composant est démonté
        return () => {
            app.stage.removeChild(player.sprite);
            app.stage.removeChild(playerNameText);
            pixiContainer.removeChild(app.view);
            app.destroy();
        };
    }, []);
    return (
        <div ref={pixiContainerRef}>
            <Bars barsData={barsUtils.barsData} />
        </div>
    );
};

export default PixiComponent;
