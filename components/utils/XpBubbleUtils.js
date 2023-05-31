import XpBubble from "../XpBubble";
import pako from "pako";

/*
Lorsqu'une personne se connecte, le serveur lui envoie des données compressées
contenant toutes les informations sur les bulles d'expérience dans le monde.
Cette fonction décompresse ces données aux moyens de la librairie pako. 
*/
const decompressData = (data) => {
  let decompressedData = pako.inflate(data, { to: "string" });
  return JSON.parse(decompressedData);
};

const XpBubbleUtils = ({ socket }) => {
  let clientSocket = socket;
  let xpBubbleList = new Set();
  let onBoardMap = new Map();

  /*
  Si le serveur demande par message via la socket de supprimer une bulle d'expérience, le client la supprime de sa liste.
  Les lignes suivantes permettent par un raisonnement analogue de créer une bulle d'expérience, ou plusieurs à l'initialisation.
  */
  clientSocket.on("server:deleteXpBubble", (message) => {
    xpBubbleList.delete(message);
  });

  clientSocket.on("server:addXpBubble", (message) => {
    xpBubbleList.add(message);
  });

  clientSocket.on("server:initialXpBubble", (message) => {
    message = decompressData(message);
    message.forEach((xpBubble) => {
      xpBubbleList.add(xpBubble);
    });
  });

  //Demande au serveur d'initialiser des bulles d'expérience
  const initialization = () => {
    clientSocket.emit("client:initialXpBubble");
  };

  /*
  Lorsque le client supprime une bulle d'expérience, il identifie ses propriétés, la supprime en local de sa liste
  puis envoie un message au serveur par la socket pour qu'il la supprime chez les autres joueurs. 
  */
  const deleteXpBubble = (message) => {
    let stringBubble =
      JSON.stringify(message.worldPos.x) +
      ";" +
      JSON.stringify(message.worldPos.y);
    xpBubbleList.delete(stringBubble);
    clientSocket.emit("client:deleteXpBubble", stringBubble);
  };

  const getXpBubbleList = () => {
    return xpBubbleList;
  };

  /*
  Récupére la liste des bulles d'expérience à afficher sur l'écran du joueur.
  Pour cela détermine leur distance au joueur puis crée les éléments effectifs (avec sprite) à afficher.
  */
  const getPrintableXpBubbleList = (player, width, height) => {
    let onBoardMap2 = new Map();
    for (let b of xpBubbleList) {
      let worldX = parseInt(b.split(";")[0]);
      let worldY = parseInt(b.split(";")[1]);
      let distX = Math.abs(worldX - player.worldPos.x);
      let distY = Math.abs(worldY - player.worldPos.y);
      if (distX < width / 2 && distY < height / 2) {
        if (!(onBoardMap.get(b) !== undefined)) {
          let element = XpBubble(
            worldX + width / 2 - player.worldPos.x,
            worldY + height / 2 - player.worldPos.y,
            worldX,
            worldY
          );
          onBoardMap2.set(b, element);
        } else {
          let element = onBoardMap.get(b);
          element.sprite.x = element.worldPos.x + width / 2 - player.worldPos.x;
          element.sprite.y =
            element.worldPos.y + height / 2 - player.worldPos.y;
          onBoardMap2.set(b, element);
        }
      }
    }
    onBoardMap = onBoardMap2;
    return [...onBoardMap.values()];
  };

  return {
    initialization,
    getXpBubbleList,
    getPrintableXpBubbleList,
    deleteXpBubble,
  };
};

export default XpBubbleUtils;
