import React, { useEffect, useState } from "react";
import style from "@/styles/Leaderboard.module.css";

const Leaderboard = ({ socket }) => {
  let [leaderboardData, setLeaderboardData] = useState([]);
  // Gestion du leaderboard

  socket.on("leaderboard", (data) => {
    setLeaderboardData(data);
  });

  /*const [leaderboardData, setLeaderboardData] = useState([]);

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
    }; */

  return (
    <div className={style.leaderboard}>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboardData.map(
          (entry, index) =>
            index < 10 && (
              <li
                key={entry.id}
                style={{ color: entry.color.replace("0x", "#") }}
              >
                <span>{index + 1}. </span>
                <span>{entry.name.substring(0, 13)}</span>
                <span>{entry.xp}</span>
              </li>
            )
        )}
      </ul>
    </div>
  );
};

export default Leaderboard;
