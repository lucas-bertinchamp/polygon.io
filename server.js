const { createServer } = require("http");
const { Server } = require("socket.io");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const Redis = require("ioredis");

let sockets = [];

let nXpBubble = 100;

const httpServer = createServer((req, res) => {
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

const io = new Server(httpServer);

// Connexion à la base de données Redis
const redisClient = Redis.createClient(process.env.REDIS_URL);

setInterval(() => {
  console.log("Rafraîchissement des données de la base de données Redis");
  // Effectuer l'appel à la base de données pour récupérer les données mises à jour
  redisClient.hgetall("xpBubble", (err, data) => {
    if (err) {
      // Gérer les erreurs de la base de données
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
}, 2500); // Rafraîchir toutes les secondes

// Gestion des connexions websocket
io.on("connection", (socket) => {
  console.log("Nouvelle connexion websocket");
  sockets.push(socket);
  console.log(`Il y a ${sockets.length} connexions websocket`);

  socket.on("deleteXpBubble", (socket) => {
    console.log("Suppression d'une bulle d'expérience");
    redisClient.hdel(
      "xpBubble",
      JSON.stringify(socket.xpBubblePosX) +
        ";" +
        JSON.stringify(socket.xpBubblePosY)
    );
  });
  // Gérez les événements de websocket ici

  // Gestion des déconnexions websocket
  socket.on("disconnect", () => {
    console.log("Déconnexion websocket");
    sockets = sockets.filter((s) => s !== socket);
    console.log(`Il y a ${sockets.length} connexions websocket`);
  });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Serveur websocket en cours d'exécution sur le port ${port}`);
});

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
