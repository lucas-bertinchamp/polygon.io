import styles from "@/styles/StartingMenu.module.css";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";

/*
Cette fonction met en place le menu principal du jeu. 
Dans ce menu le joueur choisit son nom et sa couleur.
Quand les deux champs ont été modifiés, il peut envoyer le formulaire et accéder au jeu.
*/
const StartingMenu = () => {
  const [playerName, setPlayerName] = useState("");
  const [playerColor, setPlayerColor] = useState("");

  /*
  Permet de récupérer le nom et la couleur choisis depuis l'espace de stockage de la session
  par le joueur et stocke ces données dans des variables chez le client.
  */
  useEffect(() => {
    const storedPlayerName = sessionStorage.getItem("playerName");
    const storedPlayerColor = sessionStorage.getItem("playerColor");
    if (storedPlayerName) {
      setPlayerName(storedPlayerName);
    }
    if (storedPlayerColor) {
      setPlayerColor(storedPlayerColor);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gère les erreurs de submission du sondage
  };

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
    sessionStorage.setItem("playerName", e.target.value);
  };

  const handleColorChange = (e) => {
    setPlayerColor(e.target.value);
    sessionStorage.setItem("playerColor", e.target.value);
  };

  
  function generateRandomNickname() {
    const adjectives = [
      "Crazy",
      "Brave",
      "Swift",
      "Mighty",
      "Epic",
      "Awesome",
      "Savage",
    ];
    const nouns = [
      "Warrior",
      "Hero",
      "Ninja",
      "Champion",
      "Legend",
      "Gamer",
      "Master",
    ];
  
  /*
  Pour faciliter la création de pseudonymes aléatoires, on met bout à bout un nom et
  un adjectif tirés de deux listes de mots.
  */
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNickname = `${randomAdjective} ${randomNoun}`;
    sessionStorage.setItem("playerName", randomNickname);

    setPlayerName(randomNickname);
  }

  /*
  Quand le sondage est soumis, si les deux champs ont été initialisés,
  l'accès au jeu est effectué par validation du formulaire (pression d'un bouton).
  */
  const renderPlayLink = () => {
    if (playerName && playerColor) {
      return (
        <Link href={"/game"}>
          <button className={styles.playButton}>Play</button>
        </Link>
      );
    }
    return null;
  };

  return (
    <div className={styles.background}>
      <div className={styles.starting_menu}>
        <Image
          src="/sprites/logo/logo.png"
          alt="polygon.io logo"
          width={200}
          height={200}
        />
        <h1>polygon.io</h1>
        <form onSubmit={handleSubmit}>
          <span className={styles.nickname_label}>Enter Your Nickname</span>
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              title="Enter Your Nickname"
            />
            <button
              type="button"
              onClick={generateRandomNickname}
              className={styles.randomButton}
            >
              Random
            </button>
          </div>
          <span className={styles.color_picker_label}>Choose Your Color</span>
          <input
            type="color"
            value={playerColor}
            onChange={handleColorChange}
            title="Choose Your Color"
          />
          {renderPlayLink()}
        </form>
      </div>
    </div>
  );
};

export default StartingMenu;
