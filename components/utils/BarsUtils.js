import { useState, useRef } from "react";

const BarsUtils = () => {
    const [barsData, setBarsData] = useState([
        { id: 1, value: 100, maxValue: 100, color: "red", name: "HP" },
        { id: 2, value: 0, maxValue: 10, color: "green", name: "XP 1" },
        { id: 3, value: 5, maxValue: 5, color: "yellow", name: "Ammo" },
    ]);

    const barsDataRef = useRef(barsData);
    barsDataRef.current = barsData;

    const addBarValue = (barId, addedValue) => {
        setBarsData((prevBarsData) =>
            prevBarsData.map((bar) =>
                bar.id === barId
                    ? { ...bar, value: bar.value + addedValue }
                    : bar
            )
        );
    };

    const addBarMaxValue = (barId, addedMaxValue) => {
        setBarsData((prevBarsData) =>
            prevBarsData.map((bar) =>
                bar.id === barId
                    ? { ...bar, maxValue: bar.maxValue + addedMaxValue }
                    : bar
            )
        );
    };

    const getBarValue = (barId) => {
        console.log(
            "getBarValue",
            barsDataRef.current.find((bar) => bar.id === barId).value
        );
        const bar = barsDataRef.current.find((bar) => bar.id === barId);
        return bar.value;
    };

    const setBarName = (barId, newName) => {
        setBarsData((prevBarsData) =>
            prevBarsData.map((bar) =>
                bar.id === barId ? { ...bar, name: newName } : bar
            )
        );
    };

    return { barsData, addBarValue, addBarMaxValue, getBarValue, setBarName };
};

export default BarsUtils;
