import { useState, useRef } from "react";

const BarsUtils = () => {
    const [barsData, setBarsData] = useState([
        { id: 1, value: 20, maxValue: 100, color: "red", name: "HP" },
        { id: 2, value: 0, maxValue: 10, color: "green", name: "XP 1" },
        { id: 3, value: 5, maxValue: 5, color: "yellow", name: "Ammo" },
    ]);

    const barsDataRef = useRef(barsData);
    barsDataRef.current = barsData;

    const setBarValue = (barId, newValue) => {
        setBarsData((prevBarsData) =>
            prevBarsData.map((bar) =>
                bar.id === barId ? { ...bar, value: newValue } : bar
            )
        );
    };

    const setBarMaxValue = (barId, newMaxValue) => {
        setBarsData((prevBarsData) =>
            prevBarsData.map((bar) =>
                bar.id === barId ? { ...bar, maxValue: newMaxValue } : bar
            )
        );
    };

    const getBarValue = (barId) => {
        const bar = barsDataRef.current.find((bar) => bar.id === barId);
        return bar.value;
    };

    const getBarMaxValue = (barId) => {
        const bar = barsDataRef.current.find((bar) => bar.id === barId);
        return bar.maxValue;
    };

    const setBarName = (barId, newName) => {
        setBarsData((prevBarsData) =>
            prevBarsData.map((bar) =>
                bar.id === barId ? { ...bar, name: newName } : bar
            )
        );
    };

    return {
        barsData,
        setBarValue,
        setBarMaxValue,
        getBarValue,
        getBarMaxValue,
        setBarName,
    };
};

export default BarsUtils;
