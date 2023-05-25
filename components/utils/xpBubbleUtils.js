import XpBubble from "../XpBubble";

const XpBubbleUtils = (socket) => {
  let xpBubbleList = set();

  socket.on("deleteXpBubble", (message) => {
    xpBubbleList.delete(message.xpBubble);
  });

  socket.on("addXpBubble", (message) => {
    xpBubbleList.add(message.xpBubble);
  });

  const deleteXpBubble = (message) => {
    xpBubbleList.delete(message);
    socket.emit("deleteXpBubble", message);
  };

  const getXpBubbleList = () => {
    return xpBubbleList;
  };

  const getPrintableXpBubbleList = (player, width, height) => {
    let printableXpBubbleList = [];
    xpBubbleList.forEach((xpBubble) => {
      distX = Math.abs(xpBubble.posX - player.posX);
      distY = Math.abs(xpBubble.posY - player.posY);
      if (distX < width / 2 && distY < height / 2) {
        printableXpBubbleList.push(
          XpBubble(
            null,
            null,
            xpBubble.worldPosX,
            xpBubble.worldPosY,
            xpBubble.xpVal
          )
        );
      }
    });

    return { getXpBubbleList, getPrintableXpBubbleList, deleteXpBubble };
  };
};

export default XpBubbleUtils;
