import { parentPort } from "worker_threads";
import Redis from "ioredis";
const redisClient = Redis.createClient(process.env.REDIS_URL);
import CONSTANTS from "../constants.js";

parentPort.on("message", (msg) => {
  checkHealthBubble();
});

const checkHealthBubble = () => {
  redisClient.smembers("healthBubble", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }
    // Si pas assez de bulles d'ehealthérience, en créer une nouvelle
    if (data.length < CONSTANTS.N_HEALTH_BUBBLE) {
      for (let i = 0; i < CONSTANTS.N_HEALTH_BUBBLE - data.length; i++) {
        let bubble = createHealthBubble();
        parentPort.postMessage(bubble);
      }
    }
  });
};

const createHealthBubble = () => {
  let randomPosX = Math.floor(
    Math.random() * CONSTANTS.WIDTH - CONSTANTS.WIDTH / 2
  );
  let randomPosY = Math.floor(
    Math.random() * CONSTANTS.HEIGHT - CONSTANTS.HEIGHT / 2
  );
  let data = JSON.stringify(randomPosX) + ";" + JSON.stringify(randomPosY);
  redisClient.sadd("healthBubble", data);
  return data;
};
