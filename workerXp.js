const Redis = require("ioredis");
const redisClient = Redis.createClient(process.env.REDIS_URL);
const { workerData, parentPort } = require("worker_threads");

let nXpBubble = 100;

parentPort.on("message", (msg) => {
  checkXpBubble();
});

const checkXpBubble = () => {
  redisClient.hgetall("xpBubble", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }
    // Si pas assez de bulles d'expérience, en créer une nouvelle
    if (Object.keys(data).length < nXpBubble) {
      for (let i = 0; i < nXpBubble - Object.keys(data).length; i++) {
        data = createXpBubble();
        parentPort.postMessage(data);
      }
    }
  });
};

const sendXpBubble = () => {
  redisClient.hgetall("xpBubble", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }
    // Si pas assez de bulles d'expérience, en créer une nouvelle
    if (Object.keys(data).length < nXpBubble) {
      for (let i = 0; i < nXpBubble - Object.keys(data).length; i++) {
        createXpBubble();
      }
    }
    parentPort.postMessage(data);
  });
};

const createXpBubble = () => {
  let randomPosX = Math.floor(Math.random() * 1000 - 500);
  let randomPosY = Math.floor(Math.random() * 1000 - 500);
  let data = JSON.stringify(randomPosX) + ";" + JSON.stringify(randomPosY);
  redisClient.sadd(
    "xpBubble",
    JSON.stringify(worldPosX) + ";" + JSON.stringify(worldPosY)
  );
  return data;
};
