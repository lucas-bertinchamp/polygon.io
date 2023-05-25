const Redis = require("ioredis");
const redisClient = Redis.createClient(process.env.REDIS_URL);
const { workerData, parentPort } = require("worker_threads");

let nHealthBubble = 5;

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
    if (data.length < nHealthBubble) {
      for (let i = 0; i < nHealthBubble - data.length; i++) {
        let bubble = createHealthBubble();
        parentPort.postMessage(bubble);
      }
    }
  });
};

const createHealthBubble = () => {
  let randomPosX = Math.floor(Math.random() * 1000 - 500);
  let randomPosY = Math.floor(Math.random() * 1000 - 500);
  let data = JSON.stringify(randomPosX) + ";" + JSON.stringify(randomPosY);
  redisClient.sadd("healthBubble", data);
  return data;
};
