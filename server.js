const { createServer } = require("http");
const { Server } = require("socket.io");
const socketIo = require("socket.io");
const { parse } = require("url");
const next = require("next");
const express = require("express");

const { Worker } = require("worker_threads");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const Redis = require("ioredis");
const { send } = require("process");
const { stringify } = require("querystring");

let sockets = [];
const port = process.env.PORT || 3000;

const httpServer = createServer((req, res) => {
  console.log(req.url);
  const parsedUrl = parse(req.url, true);
  const { pathname, query } = parsedUrl;
  // Gestion des routes Next.js
  app.prepare().then(() => {
    handle(req, res, parsedUrl);
  });

  if (pathname === "/") {
    // Rendre la page d'accueil
    app.render(req, res, "/", query);
  }
});

const io = socketIo(httpServer);

let nMessage = 20;

const workerXp = new Worker("./workerXp.js");
const workerHealth = new Worker("./workerHealth.js");
const workerPlayer = new Worker("./workerPlayer.js");

workerXp.on("message", (data) => {
  io.emit("xpBubble", data);
});

workerHealth.on("message", (data) => {
  io.emit("healthBubble", data);
});

workerPlayer.on("message", (data) => {
  io.emit("player", data);
});

// Connexion à la base de données Redis
const redisClient = Redis.createClient(process.env.REDIS_URL);

setInterval(() => {
  // Supprimer la base de données de joueur
  redisClient.del("player");
}, 1000 * 60 * 10);

setInterval(() => {
  // Effectuer l'appel à la base de données pour récupérer les données mises à jour
  workerXp.postMessage({});
  workerHealth.postMessage({});
}, 75);

setInterval(() => {
  // Effectuer l'appel à la base de données pour récupérer les données mises à jour
  sendBullet();
  workerPlayer.postMessage({});
}, 20);

setInterval(() => {
  // Effectuer l'appel à la base de données pour envoyer les messages
  sendMessages();
}, 500);

// Gestion des connexions websocket
io.on("connection", (socket) => {
  console.log("Nouvelle connexion websocket");
  sockets.push(socket);
  console.log(`Il y a ${sockets.length} connexions websocket`);

  socket.on("deleteXpBubble", (socket) => {
    redisClient.hdel(
      "xpBubble",
      JSON.stringify(socket.xpBubblePosX) +
        ";" +
        JSON.stringify(socket.xpBubblePosY)
    );
  });

  socket.on("deleteHealthBubble", (socket) => {
    redisClient.hdel(
      "healthBubble",
      JSON.stringify(socket.healthBubblePosX) +
        ";" +
        JSON.stringify(socket.healthBubblePosY)
    );
  });

  socket.on("updatePlayer", (socket) => {
    if (socket.id !== "") {
      let playerData = {
        id: socket.id,
        name: socket.name,
        color: socket.color,
        worldPosX: socket.worldPosX,
        worldPosY: socket.worldPosY,
        level: socket.level,
        hp: socket.hp,
        xp: socket.xp,
        ammo: socket.ammo,
      };
      redisClient.hset(
        "player",
        JSON.stringify(socket.id),
        JSON.stringify(playerData)
      );
    }
  });

  socket.on("message", (message) => {
    //Récupérer le nom du joueur
    redisClient.hget("player", JSON.stringify(socket.id), (err, data) => {
      if (err) {
        console.error(
          "Erreur lors de la récupération des données depuis Redis",
          err
        );
        return;
      }
      let playerData = JSON.parse(data);
      let playerName = playerData.name;
      console.log(playerData);
      message = playerName + " : " + message;
      // Enregistrer le message dans la base de données Redis
      redisClient.lpush("message", message);
    });
  });

  socket.on("addBullet", (data) => {
    let bulletData = JSON.parse(data);
    redisClient.hset("bullet", bulletData.key, bulletData.value);
  });

  socket.on("deleteBullet", (data) => {
    redisClient.hdel("bullet", data);
  });

  socket.on("deleteContactBullet", (data) => {
    redisClient.hdel("bullet", data);

    io.sockets.emit("deleteContactBullet", data);
  });

  // Gérez les événements de websocket ici

  // Gestion des déconnexions websocket
  socket.on("disconnect", () => {
    console.log("Déconnexion websocket");
    sockets = sockets.filter((s) => s !== socket);
    console.log(`Il y a ${sockets.length} connexions websocket`);

    // Supprimer les données du joueur de la base de données Redis
    redisClient.hdel("player", JSON.stringify(socket.id));

    // Supprimer les balles du joueur de la base de données Redis
    redisClient.hgetall("bullet", (err, data) => {
      if (err) {
        console.error(
          "Erreur lors de la récupération des données depuis Redis",
          err
        );
        return;
      }
      for (const [key, value] of Object.entries(data)) {
        let bulletKey = JSON.parse(key);
        if (bulletKey.id === socket.id) {
          redisClient.hdel("bullet", key);
        }
      }
    });
  });
});

httpServer.listen(port, () => {
  console.log(`Serveur websocket en cours d'exécution sur le port ${port}`);
});

const sendMessages = () => {
  redisClient.lrange("message", 0, nMessage, (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }

    // Envoyer les données aux clients via les connexions WebSocket
    io.sockets.emit("messageList", data);
  });
};

const sendBullet = () => {
  redisClient.hgetall("bullet", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }

    // Envoyer les données aux clients via les connexions WebSocket
    io.sockets.emit("allBullet", data);
  });
};
