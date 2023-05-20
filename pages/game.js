import { useRouter } from "next/router";
import Bars from "../components/Bars";
import { useState } from "react";
import styles from "@/styles/Game.module.css";
import Head from "next/head";
import Minimap from "../components/Minimap";
import Leaderboard from "../components/Leaderboard";
import Chat from "../components/Chat";

function Game() {
    // Get the player name and color from the URL
    const router = useRouter();
    const { playerName, playerColor } = router.query;

    // Bars data
    const [barsData, setBarsData] = useState([
        { id: 1, value: 80, maxValue: 100, color: "red", name: "HP" },
        { id: 2, value: 60, maxValue: 100, color: "green", name: "XP" },
        { id: 3, value: 1, maxValue: 5, color: "yellow", name: "Ammo" },
    ]);

    const updateBarValue = (barId, toAddValue) => {
        setBarsData((prevBarsData) =>
            prevBarsData.map((bar) =>
                bar.id === barId
                    ? { ...bar, value: bar.value + toAddValue }
                    : bar
            )
        );
    };

    // Minimap data
    const [player, setPlayer] = useState({
        top: "50%",
        left: "50%",
        backgroundColor: playerColor,
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

    // Leaderboard data (for testing, it should be fetched from the API)
    const testLeaderboardData = [
        { id: 1, playerName: "Elie", score: 10000 },
        { id: 2, playerName: "John", score: 80 },
        { id: 3, playerName: "Laulau2", score: 120 },
        { id: 4, playerName: playerName, score: 0 },
        { id: 5, playerName: "Laulau1", score: 666 },
        { id: 6, playerName: "Laulau4", score: 777 },
        { id: 7, playerName: "Laulau3", score: -4 },
        { id: 8, playerName: "Laulau5", score: 1 },
        { id: 9, playerName: "Laulau6", score: 30 },
        { id: 10, playerName: "Laulau7".slice(0, 13), score: 420 },
        { id: 11, playerName: "DoitPasEtreAffiche".slice(0, 13), score: -420 },
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>{playerName} in polygon.io</title>
                <meta
                    name="description"
                    content="For the Advanced Software Engineering class"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossorigin
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700;900&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <h1>
                Welcome to the Game Page, <u>{playerName}</u>!
            </h1>
            <h1>
                Your color is <u>{playerColor}</u>!
            </h1>
            <br />
            <span>Just some buttons to update the bars:</span>
            <br />
            <button onClick={() => updateBarValue(1, 1)}>
                Increase Bar 1 by 1
            </button>
            <button onClick={() => updateBarValue(2, 1)}>
                Increase Bar 2 by 1
            </button>
            <button onClick={() => updateBarValue(3, 1)}>
                Increase Bar 3 by 1
            </button>
            <br />
            <button onClick={() => updateBarValue(1, -1)}>
                Decrease Bar 1 by 1
            </button>
            <button onClick={() => updateBarValue(2, -1)}>
                Decrease Bar 2 by 1
            </button>
            <button onClick={() => updateBarValue(3, -1)}>
                Decrease Bar 3 by 1
            </button>
            <br />
            <button
                onClick={() =>
                    updateMinimap({
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        backgroundColor: `rgb(${Math.floor(
                            Math.random() * 256
                        )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
                            Math.random() * 256
                        )})`,
                    })
                }
            >
                Random Player on Minimap
            </button>
            <Minimap player={player} objects={objects} />
            <Bars barsData={barsData} />
            <Leaderboard testLeaderboardData={testLeaderboardData} />
            <Chat playerName={playerName} />
        </div>
    );
}

export default Game;
