import { useRouter } from "next/router";
import Bars from "../components/Bars";
import { useState } from "react";
import styles from "@/styles/Game.module.css";
import Head from "next/head";
import Minimap from "../components/Minimap";

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
    const playerPosition = { top: "50%", left: "50%" };
    const objects = [
        { id: 1, position: { top: "30%", left: "40%" } },
        { id: 2, position: { top: "60%", left: "70%" } },
        // Add more objects as needed
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>{playerName} in polygon.io</title>
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
            <Minimap playerPosition={playerPosition} objects={objects} />
            <Bars barsData={barsData} />
        </div>
    );
}

export default Game;
