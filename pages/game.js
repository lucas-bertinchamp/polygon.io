import { useState, useEffect } from "react";
import styles from "@/styles/Game.module.css";
import Head from "next/head";
import Minimap from "../components/Minimap";
import Chat from "../components/Chat";
import PixiComponent from "@/components/PixiComponent";

function Game() {
  let storedPlayerName = "";
  let storedPlayerColor = "";
  /*
  Récupère le nom et la couleur choisis par le joueur depuis l'espace de stockage de la session.
  */
  if (typeof sessionStorage !== "undefined") {
    storedPlayerName = sessionStorage.getItem("playerName");
    storedPlayerColor = sessionStorage.getItem("playerColor");
  }

  let gameData = {
    playerName: storedPlayerName,
    playerColor: storedPlayerColor,
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
    </div>
  );
}

export default Game;
