import styles from "@/styles/StartingMenu.module.css";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const StartingMenu = () => {
    const [playerName, setPlayerName] = useState("");
    const [playerColor, setPlayerColor] = useState("#bf91bb"); // Initial color value

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission or other logic
    };

    const handleNameChange = (e) => {
        setPlayerName(e.target.value);
        localStorage.setItem("playerName", e.target.value);
    };

    const handleColorChange = (e) => {
        setPlayerColor(e.target.value);
        localStorage.setItem("playerColor", e.target.value);
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

        const randomAdjective =
            adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNickname = `${randomAdjective} ${randomNoun}`;

        setPlayerName(randomNickname);
    }

    const renderPlayLink = () => {
        if (playerName) {
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
                    <span className={styles.nickname_label}>
                        Enter Your Nickname
                    </span>
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
                    <span className={styles.color_picker_label}>
                        Choose Your Color
                    </span>
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
