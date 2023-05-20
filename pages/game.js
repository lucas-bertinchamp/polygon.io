import { useRouter } from "next/router";
import Bars from "../components/Bars";
import { useState } from "react";
import styles from "@/styles/Game.module.css";
import Head from "next/head";

function Game() {
    const router = useRouter();
    const { playerName, playerColor } = router.query;

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

    return (
        <div className={styles.container}>
            <Head>
                <title>{playerName} in polygon.io</title>
            </Head>
            <h1>Welcome to the Game Page, {playerName}!</h1>
            <h1>Your color is {playerColor}!</h1>
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
            <Bars barsData={barsData} />
        </div>
    );
}

export default Game;
