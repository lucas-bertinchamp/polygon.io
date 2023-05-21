import React, { useEffect, useState } from "react";
import style from "@/styles/Leaderboard.module.css";

const Leaderboard = ({ testLeaderboardData }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        // Fetch leaderboard data from API
        fetchLeaderboardData();
    }, []);

    const fetchLeaderboardData = async () => {
        try {
            // Make an API request to fetch leaderboard data
            const response = await fetch("/api/leaderboard"); // Replace with your API endpoint
            const data = await response.json();

            // Update the leaderboard data state
            setLeaderboardData(
                data.sort((a, b) => b.score - a.score).slice(0, 10)
            );
        } catch (error) {
            // If there's an error, set the leaderboard data to the test data
            // TEST DATA !!
            setLeaderboardData(
                testLeaderboardData
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10)
            );
            console.log("Error fetching leaderboard data:", error);
        }
    };

    return (
        <div className={style.leaderboard}>
            <h2>Leaderboard</h2>
            <ul>
                {leaderboardData.map((entry, index) => (
                    <li key={entry.id}>
                        <span>{index + 1}. </span>
                        <span>{entry.playerName}</span>
                        <span>{entry.score}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
