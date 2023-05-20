import React from "react";
import styles from "@/styles/Minimap.module.css";

const Minimap = ({ playerPosition, objects }) => {
    return (
        <div className={styles.minimap}>
            <div className={styles.player} style={playerPosition}></div>
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
