import LifeBubble from "../LifeBubble";

const HealthBubbleUtils = ({ socket }) => {
  let clientSocket = socket;
  let healthBubbleList = new Set();
  let onBoardMap = new Map();

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

  const initialization = () => {
    clientSocket.emit("client:initialHealthBubble");
  };

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
