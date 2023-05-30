import LifeBubble from "../LifeBubble";

const HealthBubbleUtils = ({ socket }) => {
  let clientSocket = socket;
  let healthBubbleList = new Set();
  let onBoardMap = new Map();

  /*
  Si le serveur demande par message via la socket de supprimer une bulle de vie, le client la supprime de sa liste.
  Les lignes suivantes permettent par un raisonnement analogue de créer une bulle de vie, ou plusieurs à l'initialisation.
  */
  clientSocket.on("server:deleteHealthBubble", (message) => {
    healthBubbleList.delete(message);
  });

  clientSocket.on("server:addHealthBubble", (message) => {
    healthBubbleList.add(message);
  });

  clientSocket.on("server:initialHealthBubble", (message) => {
    message.forEach((healthBubble) => {
      healthBubbleList.add(healthBubble);
    });
  });

  //Demande au serveur d'initialiser des bulles de vie
  const initialization = () => {
    clientSocket.emit("client:initialHealthBubble");
  };

  /*
  Lorsque le client supprime une bulle de vie, il identifie ses propriétés, la supprime en local de sa liste
  puis envoie un message au serveur par la socket pour qu'il la supprime chez les autres joueurs. 
  */
  const deleteHealthBubble = (message) => {
    let stringBubble =
      JSON.stringify(message.worldPos.x) +
      ";" +
      JSON.stringify(message.worldPos.y);
    healthBubbleList.delete(stringBubble);
    clientSocket.emit("client:deleteHealthBubble", stringBubble);
  };

  const getHealthBubbleList = () => {
    return healthBubbleList;
  };

  /*
  Récupére la liste des bulles de vie à afficher sur l'écran du joueur.
  Pour cela détermine leur distance au joueur puis crée les éléments effectifs (avec sprite) à afficher.
  */
  const getPrintableHealthBubbleList = (player, width, height) => {
    let onBoardMap2 = new Map();
    for (let b of healthBubbleList) {
      let worldX = parseInt(b.split(";")[0]);
      let worldY = parseInt(b.split(";")[1]);
      let distX = Math.abs(worldX - player.worldPos.x);
      let distY = Math.abs(worldY - player.worldPos.y);
      if (distX < width / 2 && distY < height / 2) {
        if (!(onBoardMap.get(b) !== undefined)) {
          let element = LifeBubble(
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
    getHealthBubbleList,
    getPrintableHealthBubbleList,
    deleteHealthBubble,
  };
};

export default HealthBubbleUtils;
