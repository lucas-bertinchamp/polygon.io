import Redis from "ioredis";
const redisClient = Redis.createClient(process.env.REDIS_URL);
import CONSTANTS from "../constants.js";

import { workerData, parentPort } from "worker_threads";

console.log(CONSTANTS.BULLET_SPEED);

parentPort.on("message", (msg) => {
  sendBullet();
});

const sendBullet = () => {
  const msg = Date.now();
  redisClient.hgetall("bullet", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }

    const values = Object.values(data);

    const bullet = values.map((value) => {
      let valueParsed = JSON.parse(value);
      const bullet = Proj(
        valueParsed.playerId,
        valueParsed.num,
        valueParsed.dx,
        valueParsed.dy,
        valueParsed.worldPosX,
        valueParsed.worldPosY,
        CONSTANTS.BULLET_SPEED,
        CONSTANTS.BULLET_DAMAGE,
        valueParsed.color
      );
      return bullet;
    });

    // Faire avancer les balles
    values.forEach((value) => {
      let valueParsed = JSON.parse(value);
      valueParsed.worldPosX += CONSTANTS.BULLET_SPEED * valueParsed.dx;
      valueParsed.worldPosY += CONSTANTS.BULLET_SPEED * valueParsed.dy;
      if (
        valueParsed.worldPosX < -CONSTANTS.WIDTH / 2 ||
        valueParsed.worldPosX > CONSTANTS.WIDTH / 2 ||
        valueParsed.worldPosY < -CONSTANTS.HEIGHT / 2 ||
        valueParsed.worldPosY > CONSTANTS.HEIGHT / 2
      ) {
        redisClient.hdel(
          "bullet",
          JSON.stringify({ id: valueParsed.playerId, num: valueParsed.num })
        );
      } else {
        redisClient.hset(
          "bullet",
          JSON.stringify({ id: valueParsed.playerId, num: valueParsed.num }),
          JSON.stringify(valueParsed)
        );
      }
    });

    // Envoyer les données aux clients via les connexions WebSocket
    parentPort.postMessage(bullet);
    //console.log("Temps écoulé : ", Date.now() - msg);
  });
};

const Proj = (
  playerId,
  num,
  dX,
  dY,
  worldPosX,
  worldPosY,
  speed,
  dmgValue,
  color
) => {
  return {
    playerId: playerId,
    num: num,
    sprite: null,
    worldPos: { x: worldPosX, y: worldPosY },
    dmgValue: dmgValue,
    speed_x: dX * speed,
    speed_y: dY * speed,
    color: color,
  };
};
