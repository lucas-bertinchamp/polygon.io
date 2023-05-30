import { useState, useRef } from "react";

const BarsUtils = () => {
  const [barsData, setBarsData] = useState([
    { id: 1, value: 100, maxValue: 100, color: "red", name: "HP" }, //jauge de vie initialisée à 100 points de vie
    { id: 2, value: 0, maxValue: 20, color: "green", name: "XP 1" }, //jauge d'expérience de niveau 1 (du fait de son plafond) initialisée vide
    { id: 3, value: 0, maxValue: 100, color: "yellow", name: "Ammo" }, //jauge de munitions initialisée vide
  ]);

  const barsDataRef = useRef(barsData);
  barsDataRef.current = barsData;

  //Permet de modifier la valeur d'une jauge spécifique
  const setBarValue = (barId, newValue) => {
    setBarsData((prevBarsData) =>
      prevBarsData.map((bar) =>
        bar.id === barId ? { ...bar, value: newValue } : bar
      )
    );
  };

  //Modifie le maximum d'une jauge spécifique, en pratique cette fonction est utilisée pour manifester les effets d'un changement de niveau pour les jauges  
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
