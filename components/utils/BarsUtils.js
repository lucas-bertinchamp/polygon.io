import { useState, useRef } from "react";

const BarsUtils = () => {
  const [barsData, setBarsData] = useState([
    { id: 1, value: 100, maxValue: 100, color: "red", name: "HP" },
    { id: 2, value: 0, maxValue: 20, color: "green", name: "XP 1" },
    { id: 3, value: 0, maxValue: 100, color: "yellow", name: "Ammo" },
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
    setBarName,
  };
};

export default BarsUtils;
