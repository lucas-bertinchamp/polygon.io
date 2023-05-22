const { createServer } = require("http");
const { Server } = require("socket.io");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

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

  // Gestion des connexions websocket
  io.on("connection", (socket) => {
    console.log("Nouvelle connexion websocket");

    // Gérez les événements de websocket ici
  });
});

const io = new Server(httpServer);

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Serveur websocket en cours d'exécution sur le port ${port}`);
});
