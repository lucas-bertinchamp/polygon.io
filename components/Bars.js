import React, { useEffect, useState } from "react";
import styles from "@/styles/Bars.module.css";

const Bars = ({ barsData }) => {
    useEffect(() => {
        updateBars();
    }, [barsData]);

    const updateBars = () => {
        barsData.forEach((bar) => {
            const { id, value, maxValue, color, name } = bar;
            const barElement = document.getElementById(`bar_${id}`);
            const height = (value / maxValue) * 100;
            barElement.style.height = `${height}%`;
            barElement.style.backgroundColor = color;

            const valueElement = document.getElementById(`value_${id}`);
            valueElement.innerText = `${Math.round(value)}`;

            const nameBar = document.getElementById(`name_${id}`);
            nameBar.innerText = `${name}`;
        });
    };

    return (
        <div className={styles.bars_container}>
            {barsData.map((bar) => (
                <div className={styles.bar} key={bar.id}>
                    <div
                        id={`name_${bar.id}`}
                        className={styles.bar_name}
                    ></div>
                    <div
                        id={`bar_${bar.id}`}
                        className={styles.bar_inner}
                    ></div>
                    <div
                        id={`value_${bar.id}`}
                        className={styles.bar_value}
                    ></div>
                </div>
            ))}
        </div>
    );
};

export default Bars;
