import { parentPort } from "worker_threads";
import Redis from "ioredis";
const redisClient = Redis.createClient(process.env.REDIS_URL);

parentPort.on("message", (msg) => {
  sendPlayer();
});

const sendPlayer = () => {
  redisClient.hgetall("player", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }

    // Envoyer les données aux clients via les connexions WebSocket
    parentPort.postMessage(data);
  });
};
