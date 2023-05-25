import LifeBubble from "../LifeBubble";
import HealthBubble from "../LifeBubble";

const HealthBubbleUtils = ({ socket }) => {
  let clientSocket = socket;
  let healthBubbleList = new Set();

  socket.emit("client:initialHealthBubble");

  clientSocket.on("server:deleteHealthBubble", (message) => {
    let x = parseInt(message.split(";")[0]);
    let y = parseInt(message.split(";")[1]);
    healthBubbleList.delete(
      JSON.stringify({ worldPosX: x, worldPosY: y, xpVal: 2 })
    );
  });

  clientSocket.on("server:addHealthBubble", (message) => {
    let x = parseInt(message.split(";")[0]);
    let y = parseInt(message.split(";")[1]);
    healthBubbleList.add(
      JSON.stringify({ worldPosX: x, worldPosY: y, healthVal: 2 })
    );
  });

  clientSocket.on("server:initialHealthBubble", (message) => {
    message.forEach((healthBubble) => {
      let x = parseInt(healthBubble.split(";")[0]);
      let y = parseInt(healthBubble.split(";")[1]);
      healthBubbleList.add(
        JSON.stringify({ worldPosX: x, worldPosY: y, healthVal: 2 })
      );
    });
  });

  const deleteHealthBubble = (message) => {
    let bubble = JSON.stringify({
      worldPosX: message.worldPos.x,
      worldPosY: message.worldPos.y,
      healthVal: 2,
    });
    healthBubbleList.delete(bubble);
    let stringBubble =
      JSON.stringify(message.worldPos.x) +
      ";" +
      JSON.stringify(message.worldPos.y);
    clientSocket.emit("client:deleteHealthBubble", stringBubble);
  };

  const getHealthBubbleList = () => {
    return healthBubbleList;
  };

  const getPrintableHealthBubbleList = (player, width, height) => {
    let printableHealthBubbleList = [...healthBubbleList]
      .map((healthBubble) => {
        healthBubble = JSON.parse(healthBubble);
        let distX = Math.abs(healthBubble.worldPosX - player.worldPos.x);
        let distY = Math.abs(healthBubble.worldPosY - player.worldPos.y);
        if (distX < width / 2 && distY < height / 2) {
          return LifeBubble(
            healthBubble.worldPosX - player.worldPos.x + width / 2,
            healthBubble.worldPosY - player.worldPos.y + height / 2,
            healthBubble.worldPosX,
            healthBubble.worldPosY,
            healthBubble.healthVal
          );
        }
      })
      .filter((healthBubble) => {
        return healthBubble !== undefined;
      });
    return printableHealthBubbleList;
  };
  return {
    getHealthBubbleList,
    getPrintableHealthBubbleList,
    deleteHealthBubble,
  };
};

export default HealthBubbleUtils;
