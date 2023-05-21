import { useState, useEffect } from "react";
import styles from "@/styles/Game.module.css";
import Head from "next/head";
import Minimap from "../components/Minimap";
import Leaderboard from "../components/Leaderboard";
import Chat from "../components/Chat";
import PixiComponent from "@/components/PixiComponent";
import { useRouter } from "next/dist/client/router";

function Game() {
    const router = useRouter();
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Check if the F5 key is pressed
            if (event.key === "F5") {
                // Prevent the default browser refresh behavior
                event.preventDefault();

                // Redirect to the "/" path (home page)
                router.push("/");
            }
        };
        // Add event listener for keydown event
        window.addEventListener("keydown", handleKeyPress);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [router]);

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

    // Leaderboard data (for testing, it should be fetched from the API)
    const testLeaderboardData = [
        { id: 1, playerName: "Elie", score: 10000 },
        { id: 2, playerName: "John", score: 80 },
        { id: 3, playerName: "Laulau2", score: 120 },
        { id: 4, playerName: storedPlayerName, score: 0 },
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
                <title>{storedPlayerName} in polygon.io</title>
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

            <PixiComponent gameData={gameData} />
            <Minimap player={player} objects={objects} />
            <Leaderboard testLeaderboardData={testLeaderboardData} />
            <Chat playerName={storedPlayerName} />
        </div>
    );
}

export default Game;
