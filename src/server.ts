import { createServer } from "node:http";
import type { Request, Response } from "express";
import { ExpressPeerServer } from "peer";
import { logger } from "#/middlewares/index.js";
import env from "#/utilities/env.js";
import app from "#/app.js";
import { HttpResponse } from "./utilities/response.js";

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

app.use((req: Request, res: Response) => {
  const message = `Requested url '${req.url}' no found!`;
  return new HttpResponse(404, message).send(res);
});

export default server;
