import type { NextFunction, Request, Response } from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import requestIp from "request-ip";
import { limiter, logger } from "#/middlewares/index.js";
import routers from "#/routers/index.js";
import env from "#/utils/env.js";
import { HttpError, HttpResponse } from "#/utils/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/** Pino - HttpLogger */
app.use(pinoHttp({ logger }));

/** CORS - Allow Origin */
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    maxAge: env.CORS_MAXAGE,
  })
);

/** Body Parser - Json & Form Data */
app.use(
  express.json({
    limit: env.PAYLOAD_LIMIT,
    strict: true,
  })
);

app.use(
  express.urlencoded({
    limit: env.PAYLOAD_LIMIT,
    extended: true,
  })
);

/** Trust Proxy */
if (env.isProd) {
  app.set("trust proxy", 1);
}

/** Request IP Address */
app.use(requestIp.mw());

/** Cookies Parser */
app.use(cookieParser(env.COOKIES_SECRET));

/** Body Compression */
app.use(
  compression({
    filter: (req: Request, res: Response) => {
      if (req.headers.accept === "text/event-stream") return false;
      return compression.filter(req, res);
    },
  })
);

/** Public Static Assets */
app.use("/public/temp", express.static(join(__dirname, "../public/temp")));

/** Rate Limiter & Api Routers */
app.use("/api", limiter(), routers);

app.get("/", (req: Request, res: Response) => {
  const name = req.query["name"] ?? "Unknown";
  return new HttpResponse(200, `Express + Peer says hello to ${name}!`).send(res);
});

/**  Global Error Handler */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);

  if (err instanceof HttpError) {
    req.log.warn({ err }, "Handled http error!");
    return new HttpResponse(err.code, err.message).send(res);
  }

  req.log.error({ err }, "Unhandled http error!");
  return new HttpResponse(500, "Internal server error!").send(res);
});

export default app;
