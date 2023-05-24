const Redis = require("ioredis");
const redisClient = Redis.createClient(process.env.REDIS_URL);
const { workerData, parentPort } = require("worker_threads");

let nHealthBubble = 10;

parentPort.on("message", (msg) => {
  sendHealthBubble();
});

const sendHealthBubble = () => {
  redisClient.hgetall("healthBubble", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }

    // Si pas assez de bulles de vie, en créer une nouvelle
    if (Object.keys(data).length < nHealthBubble) {
      for (let i = 0; i < nHealthBubble - Object.keys(data).length; i++) {
        createHealthBubble();
      }
    }
    parentPort.postMessage(data);
  });
};

const createHealthBubble = () => {
  let randomPosX = Math.floor(Math.random() * 1000 - 500);
  let randomPosY = Math.floor(Math.random() * 1000 - 500);
  let newXpBubble = {
    worldPosX: randomPosX,
    worldPosY: randomPosY,
    health: 25,
  };
  redisClient.hset(
    "healthBubble",
    JSON.stringify(newXpBubble.worldPosX) +
      ";" +
      JSON.stringify(newXpBubble.worldPosY),
    JSON.stringify(newXpBubble)
  );
};
