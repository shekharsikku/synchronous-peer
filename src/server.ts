import { createServer } from "node:http";
import { ExpressPeerServer } from "peer";
import { logger } from "#/middlewares/index.js";
import env from "#/utils/env.js";
import app from "#/app.js";

const server = createServer(app);

const peerServer = ExpressPeerServer(server, {
  corsOptions: {
    origin: env.CORS_ORIGIN,
    credentials: true,
    maxAge: env.CORS_MAXAGE,
  },
  allow_discovery: env.isDev,
});

peerServer.on("connection", (client) => {
  logger.info("Peer connected: %s", client.getId());
});

peerServer.on("disconnect", (client) => {
  logger.info("Peer disconnected: %s", client.getId());
});

app.use("/synchronous", peerServer);

export default server;
