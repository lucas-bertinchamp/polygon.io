import Projectile from "../Projectile";

const BulletUtils = ({ socket }) => {
  let clientSocket = socket;
  let bulletList = new Set();
  let ownOnBoardMap = new Map();
  let otherOnBoardMap = new Map();

  clientSocket.on("server:allBullet", (message) => {
    bulletList.clear();
    console.log("ping");
    message.forEach((bullet) => {
      bulletList.add(bullet);
    });
  });

  const deleteBullet = (bullet) => {
    let stringBullet = JSON.stringify({
      id: bullet.playerId,
      num: bullet.num,
    });
    console.log("stringBullet : " + stringBullet);
    clientSocket.emit("deleteBullet", stringBullet);
  };

  const separateBullet = (bulletList) => {
    let ownBullet = new Set();
    let otherBullet = new Set();
    for (let b of bulletList) {
      let parseBullet = JSON.parse(b);
      if (parseBullet.playerId === clientSocket.id) {
        ownBullet.add(parseBullet);
      } else {
        otherBullet.add(parseBullet);
      }
    }
    return { ownBullet, otherBullet };
  };

  const actionBullet = (player, width, height) => {
    let { ownBullet, otherBullet } = separateBullet(bulletList);

    let ownPrintableBullet = actionOwnBullet(player, ownBullet, width, height);
    let otherPrintableBullet = actionOtherBullet(
      player,
      otherBullet,
      width,
      height
    );
    console.log("pong");
    return [ownPrintableBullet, otherPrintableBullet];
  };

  const actionOwnBullet = (player, ownBullet, width, height) => {
    let ownOnBoardMap2 = new Map();
    for (let b of ownBullet) {
      if (
        b.worldPosX < -width / 2 ||
        b.worldPosX > width / 2 ||
        b.worldPosY < -height / 2 ||
        b.worldPosY > height / 2
      ) {
        deleteBullet(b);
      } else {
        b.worldPosX += b.dx * b.speed;
        b.worldPosY += b.dy * b.speed;
        let distX = Math.abs(b.worldPosX - player.worldPos.x);
        let distY = Math.abs(b.worldPosY - player.worldPos.y);
        if (distX < window.innerWidth / 2 && distY < window.innerHeight / 2) {
          if (!(ownOnBoardMap.get(b) !== undefined)) {
            let element = Projectile(
              b.playerId,
              b.num,
              b.dx,
              b.dy,
              b.worldPosX,
              b.worldPosY,
              b.speed,
              b.color,
              5
            );
            element.sprite.x =
              element.worldPos.x + window.innerWidth / 2 - player.worldPos.x;
            element.sprite.y =
              element.worldPos.y + window.innerHeight / 2 - player.worldPos.y;
            ownOnBoardMap2.set(b, element);
          } else {
            let element = ownOnBoardMap.get(b);
            element.sprite.x =
              element.worldPos.x + window.innerWidth / 2 - player.worldPos.x;
            element.sprite.y =
              element.worldPos.y + window.innerHeight / 2 - player.worldPos.y;
            ownOnBoardMap2.set(b, element);
          }
        }
        let key = JSON.stringify({ id: b.playerId, num: b.num });
        socket.emit("addBullet", { key: key, value: JSON.stringify(b) });
      }
    }
    ownOnBoardMap = ownOnBoardMap2;
    return [...ownOnBoardMap.values()];
  };

  const actionOtherBullet = (player, otherBullet, width, height) => {
    let otherOnBoardMap2 = new Map();
    for (let b of otherBullet) {
      let distX = Math.abs(b.worldPosX - player.worldPos.x);
      let distY = Math.abs(b.worldPosY - player.worldPos.y);
      if (distX < window.innerWidth / 2 && distY < window.innerHeight / 2) {
        if (!(otherOnBoardMap.get(b) !== undefined)) {
          let element = Projectile(
            b.playerId,
            b.num,
            b.dx,
            b.dy,
            b.worldPosX,
            b.worldPosY,
            b.speed,
            b.color,
            5
          );
          element.sprite.x =
            element.worldPos.x + window.innerWidth / 2 - player.worldPos.x;
          element.sprite.y =
            element.worldPos.y + window.innerHeight / 2 - player.worldPos.y;
          otherOnBoardMap2.set(b, element);
        } else {
          let element = otherOnBoardMap.get(b);
          element.sprite.x =
            element.worldPos.x + window.innerWidth / 2 - player.worldPos.x;
          element.sprite.y =
            element.worldPos.y + window.innerHeight / 2 - player.worldPos.y;
          otherOnBoardMap2.set(b, element);
        }
      }
    }
    otherOnBoardMap = otherOnBoardMap2;
    return [...otherOnBoardMap.values()];
  };

  return {
    actionBullet,
    deleteBullet,
  };
};

export default BulletUtils;
