const { createServer } = require("http");
const { Server } = require("socket.io");
const socketIo = require("socket.io");
const { parse } = require("url");
const next = require("next");
const express = require("express");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const Redis = require("ioredis");
const { send } = require("process");

let sockets = [];
const port = process.env.PORT || 3000;

let nXpBubble = 100;
let nHealthBubble = 10;

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

// Connexion à la base de données Redis
const redisClient = Redis.createClient(process.env.REDIS_URL);

setInterval(() => {
  console.log("Rafraîchissement des bulles d'expérience et de vie");
  // Effectuer l'appel à la base de données pour récupérer les données mises à jour
  sendXpBubble();
  sendHealthBubble();
}, 1000); // Rafraîchir toutes les secondes

setInterval(() => {
  console.log("Rafraîchissement des joueurs");
  // Effectuer l'appel à la base de données pour récupérer les données mises à jour
  sendPlayer();
}, 100); // Rafraîchir toutes les secondes

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
    console.log("Mise à jour d'un joueur");
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

  // Gérez les événements de websocket ici

  // Gestion des déconnexions websocket
  socket.on("disconnect", () => {
    console.log("Déconnexion websocket");
    sockets = sockets.filter((s) => s !== socket);
    console.log(`Il y a ${sockets.length} connexions websocket`);

    // Supprimer les données du joueur de la base de données Redis
    redisClient.hdel("player", JSON.stringify(socket.id));
  });
});

httpServer.listen(port, () => {
  console.log(`Serveur websocket en cours d'exécution sur le port ${port}`);
});

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

    // Envoyer les données aux clients via les connexions WebSocket
    io.sockets.emit("xpBubble", data);
  });
};

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

    // Envoyer les données aux clients via les connexions WebSocket
    io.sockets.emit("healthBubble", data);
  });
};
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
    io.sockets.emit("player", data);
  });
};

const createXpBubble = () => {
  let randomPosX = Math.floor(Math.random() * 1000 - 500);
  let randomPosY = Math.floor(Math.random() * 1000 - 500);
  let newXpBubble = {
    worldPosX: randomPosX,
    worldPosY: randomPosY,
    xp: 5,
  };
  redisClient.hset(
    "xpBubble",
    JSON.stringify(newXpBubble.worldPosX) +
      ";" +
      JSON.stringify(newXpBubble.worldPosY),
    JSON.stringify(newXpBubble)
  );
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
