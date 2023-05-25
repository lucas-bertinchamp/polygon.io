import XpBubble from "../XpBubble";

const XpBubbleUtils = ({ socket }) => {
  let clientSocket = socket;
  let xpBubbleList = new Set();
  let onBoardMap = new Map();

  clientSocket.on("server:deleteXpBubble", (message) => {
    xpBubbleList.delete(message);
  });

  clientSocket.on("server:addXpBubble", (message) => {
    xpBubbleList.add(message);
  });

  clientSocket.on("server:initialXpBubble", (message) => {
    message.forEach((xpBubble) => {
      xpBubbleList.add(xpBubble);
    });
  });

  const initialization = () => {
    clientSocket.emit("client:initialXpBubble");
  };

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
