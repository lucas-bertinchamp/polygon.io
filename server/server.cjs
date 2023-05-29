const { createServer } = require("http");
const socketIo = require("socket.io");
const { parse } = require("url");
const next = require("next");
const PIXI = require("pixi.js");
const pako = require("pako");

const { Worker } = require("worker_threads");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const Redis = require("ioredis");

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

const workerXp = new Worker("./server/workerXp.js");
const workerHealth = new Worker("./server/workerHealth.js");
const workerPlayer = new Worker("./server/workerPlayer.js");
const workerBullet = new Worker("./server/workerBullet.js");

workerXp.on("message", (data) => {
  io.emit("server:addXpBubble", data);
});

workerHealth.on("message", (data) => {
  io.emit("server:addHealthBubble", data);
});

workerPlayer.on("message", (data) => {
  io.emit("player", compressData(data));
});

workerBullet.on("message", (data) => {
  io.emit("server:allBullet", compressData(data));
});

// Connexion à la base de données Redis
const redisClient = Redis.createClient(process.env.REDIS_URL);
redisClient.del("player");
redisClient.del("bullet");
redisClient.del("xpBubble");
redisClient.del("healthBubble");
redisClient.sadd("xpBubble", "0;0");
redisClient.del("message");

setInterval(() => {
  // Supprimer la base de données de joueur
  redisClient.del("player");
}, 1000 * 60 * 10);

setInterval(() => {
  // Effectuer l'appel à la base de données pour récupérer les données mises à jour
  workerXp.postMessage({});
  workerHealth.postMessage({});
}, 100);

setInterval(() => {
  // Effectuer l'appel à la base de données pour récupérer les données mises à jour
  workerBullet.postMessage({});
  workerPlayer.postMessage({});
}, 20);

setInterval(() => {
  // Effectuer l'appel à la base de données pour envoyer les messages
  sendMessages();
}, 500);

setInterval(() => {
  sendLeaderboard();
}, 1000);

// Gestion des connexions websocket
io.on("connection", (socket) => {
  console.log("Nouvelle connexion websocket");
  sockets.push(socket);
  console.log(`Il y a ${sockets.length} connexions websocket`);

  // ------------------------- Event Expérience ------------------------- //

  socket.on("client:initialXpBubble", (message) => {
    redisClient.smembers("xpBubble", (err, res) => {
      if (err) {
        console.log(err);
      } else {
        socket.emit("server:initialXpBubble", compressData(res));
      }
    });
  });

  socket.on("client:deleteXpBubble", (message) => {
    redisClient.srem("xpBubble", message);
    io.sockets.emit("server:deleteXpBubble", message);
  });

  // ------------------------- Event Vie ------------------------- //

  socket.on("client:initialHealthBubble", (message) => {
    redisClient.smembers("healthBubble", (err, res) => {
      if (err) {
        console.log(err);
      } else {
        socket.emit("server:initialHealthBubble", res);
      }
    });
  });

  socket.on("client:deleteHealthBubble", (message) => {
    redisClient.srem("healthBubble", message);
    io.sockets.emit("server:deleteHealthBubble", message);
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
    if (message.message !== "") {
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
        message.message = playerName + " : " + message.message;
        // Enregistrer le message dans la base de données Redis
        redisClient.lpush("message", JSON.stringify(message));
      });
    }
  });

  socket.on("addBullet", (data) => {
    redisClient.hset("bullet", data.key, data.value);
  });

  socket.on("client:deleteBullet", (data) => {
    redisClient.hdel("bullet", data);
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

    // Supprimer les vieux messages
    data.forEach((message) => {
      message = JSON.parse(message);
      if (message.time < Date.now() - 1000 * 60) {
        redisClient.lrem("message", 1, JSON.stringify(message));
      }
    });

    // Envoyer les données aux clients via les connexions WebSocket
    io.sockets.emit("messageList", data);
  });
};

const sendLeaderboard = () => {
  redisClient.hgetall("player", (err, data) => {
    if (err) {
      console.error(
        "Erreur lors de la récupération des données depuis Redis",
        err
      );
      return;
    }

    let parsedValues = Object.values(data).map((value) => {
      return JSON.parse(value);
    });
    let values = Object.values(parsedValues).sort((a, b) => {
      return b.xp - a.xp;
    });
    // Envoyer les données aux clients via les connexions WebSocket
    io.sockets.emit("leaderboard", values);
  });
};

function compressData(data) {
  const compressedData = pako.deflate(JSON.stringify(data));
  return compressedData;
}
