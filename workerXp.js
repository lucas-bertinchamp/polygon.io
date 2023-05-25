const Redis = require("ioredis");
const redisClient = Redis.createClient(process.env.REDIS_URL);
const { workerData, parentPort } = require("worker_threads");

let nXpBubble = 100;

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
    if (data.length < nXpBubble) {
      for (let i = 0; i < nXpBubble - data.length; i++) {
        let bubble = createXpBubble();
        parentPort.postMessage(bubble);
      }
    }
  });
};

const createXpBubble = () => {
  let randomPosX = Math.floor(Math.random() * 1000 - 500);
  let randomPosY = Math.floor(Math.random() * 1000 - 500);
  let data = JSON.stringify(randomPosX) + ";" + JSON.stringify(randomPosY);
  redisClient.sadd("xpBubble", data);
  return data;
};
