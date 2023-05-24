import { useState, useEffect } from "react";
import styles from "@/styles/Game.module.css";
import Head from "next/head";
import Minimap from "../components/Minimap";
import Chat from "../components/Chat";
import PixiComponent from "@/components/PixiComponent";

function Game() {
  let storedPlayerName = "";
  let storedPlayerColor = "";

  if (typeof sessionStorage !== "undefined") {
    storedPlayerName = sessionStorage.getItem("playerName");
    storedPlayerColor = sessionStorage.getItem("playerColor");
  }

  let gameData = {
    playerName: storedPlayerName,
    playerColor: storedPlayerColor,
  };

  // Minimap data
  const [player, setPlayer] = useState({
    top: "50%",
    left: "50%",
    backgroundColor: storedPlayerName,
  });
  const [objects, setObjects] = useState([
    {
      id: 1,
      position: { top: "30%", left: "40%", backgroundColor: "blue" },
    },
    {
      id: 2,
      position: { top: "60%", left: "70%", backgroundColor: "orange" },
    },
    // Add more objects as needed
  ]);

  const updateMinimap = (newPlayer, newObjects) => {
    setPlayer((prevData) => (newPlayer ? newPlayer : prevData));
    setObjects((prevData) => (newObjects ? newObjects : prevData));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{storedPlayerName} in polygon.io</title>
        <meta
          name="description"
          content="For the Advanced Software Engineering class"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <PixiComponent gameData={gameData} />
      <Minimap player={player} objects={objects} />
    </div>
  );
}

export default Game;
