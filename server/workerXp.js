import Redis from "ioredis";
const redisClient = Redis.createClient(process.env.REDIS_URL);
import { workerData, parentPort } from "worker_threads";
import CONSTANTS from "../constants.js";

parentPort.on("message", (msg) => {
  checkXpBubble();
});

const checkXpBubble = () => {
  redisClient.smembers("xpBubble", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }
    // Si pas assez de bulles d'expérience, en créer une nouvelle
    if (data.length < CONSTANTS.N_XP_BUBBLE) {
      for (let i = 0; i < CONSTANTS.N_XP_BUBBLE - data.length; i++) {
        let bubble = createXpBubble();
        parentPort.postMessage(bubble);
      }
    }
  });
};

const createXpBubble = () => {
  let randomPosX = Math.floor(
    Math.random() * CONSTANTS.WIDTH - CONSTANTS.WIDTH / 2
  );
  let randomPosY = Math.floor(
    Math.random() * CONSTANTS.HEIGHT - CONSTANTS.HEIGHT / 2
  );
  let data = JSON.stringify(randomPosX) + ";" + JSON.stringify(randomPosY);
  redisClient.sadd("xpBubble", data);
  return data;
};
