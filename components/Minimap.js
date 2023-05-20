import React from "react";
import styles from "@/styles/Minimap.module.css";

const Minimap = ({ player, objects }) => {
    return (
        <div className={styles.minimap}>
            <div className={styles.player} style={player}></div>
            {objects.map((object) => (
                <div
                    key={object.id}
                    className={styles.object}
                    style={object.position}
                ></div>
            ))}
        </div>
    );
};

export default Minimap;
