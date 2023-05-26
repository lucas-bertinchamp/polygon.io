const Redis = require("ioredis");
const redisClient = Redis.createClient(process.env.REDIS_URL);
const { workerData, parentPort } = require("worker_threads");

parentPort.on("message", (msg) => {
  sendBullet();
});

const sendBullet = () => {
  redisClient.hgetall("bullet", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }

    const values = Object.values(data);

    // Envoyer les données aux clients via les connexions WebSocket
    parentPort.postMessage(values);
  });
};
