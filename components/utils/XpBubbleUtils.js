import XpBubble from "../XpBubble";

const XpBubbleUtils = ({ socket }) => {
  let clientSocket = socket;
  let xpBubbleList = new Set();

  socket.emit("client:initialXpBubble");

  clientSocket.on("server:deleteXpBubble", (message) => {
    let x = parseInt(message.split(";")[0]);
    let y = parseInt(message.split(";")[1]);
    xpBubbleList.delete(
      JSON.stringify({ worldPosX: x, worldPosY: y, xpVal: 2 })
    );
  });

  clientSocket.on("server:addXpBubble", (message) => {
    let x = parseInt(message.split(";")[0]);
    let y = parseInt(message.split(";")[1]);
    xpBubbleList.add(JSON.stringify({ worldPosX: x, worldPosY: y, xpVal: 2 }));
  });

  clientSocket.on("server:initialXpBubble", (message) => {
    message.forEach((xpBubble) => {
      let x = parseInt(xpBubble.split(";")[0]);
      let y = parseInt(xpBubble.split(";")[1]);
      xpBubbleList.add(
        JSON.stringify({ worldPosX: x, worldPosY: y, xpVal: 2 })
      );
    });
  });

  const deleteXpBubble = (message) => {
    let bubble = JSON.stringify({
      worldPosX: message.worldPos.x,
      worldPosY: message.worldPos.y,
      xpVal: 2,
    });
    xpBubbleList.delete(bubble);
    let stringBubble =
      JSON.stringify(message.worldPos.x) +
      ";" +
      JSON.stringify(message.worldPos.y);
    clientSocket.emit("client:deleteXpBubble", stringBubble);
  };

  const getXpBubbleList = () => {
    return xpBubbleList;
  };

  const getPrintableXpBubbleList = (player, width, height) => {
    let printableXpBubbleList = [...xpBubbleList]
      .map((xpBubble) => {
        xpBubble = JSON.parse(xpBubble);
        let distX = Math.abs(xpBubble.worldPosX - player.worldPos.x);
        let distY = Math.abs(xpBubble.worldPosY - player.worldPos.y);
        if (distX < width / 2 && distY < height / 2) {
          return XpBubble(
            xpBubble.worldPosX - player.worldPos.x + width / 2,
            xpBubble.worldPosY - player.worldPos.y + height / 2,
            xpBubble.worldPosX,
            xpBubble.worldPosY,
            xpBubble.xpVal
          );
        }
      })
      .filter((xpBubble) => {
        return xpBubble !== undefined;
      });
    return printableXpBubbleList;
  };
  return { getXpBubbleList, getPrintableXpBubbleList, deleteXpBubble };
};

export default XpBubbleUtils;
