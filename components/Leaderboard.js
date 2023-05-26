import React, { useEffect, useState } from "react";
import style from "@/styles/Leaderboard.module.css";

const Leaderboard = ({ socket }) => {
  let [leaderboardData, setLeaderboardData] = useState([]);
  // Gestion du leaderboard

  socket.on("leaderboard", (data) => {
    setLeaderboardData(data);
  });

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
