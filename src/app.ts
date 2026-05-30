import type { NextFunction, Request, Response } from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { MulterError } from "multer";
import { pinoHttp } from "pino-http";
import requestIp from "request-ip";
import { limiter, logger } from "#/middlewares/index.js";
import routers from "#/routers/index.js";
import env from "#/utilities/env.js";
import { HttpError, HttpResponse } from "#/utilities/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/** Trust Proxy */
if (env.isProd) {
  app.set("trust proxy", 1);
}

/** Logging */
app.use(pinoHttp({ logger }));

/** Security */
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true, maxAge: env.CORS_MAXAGE }));
app.use(requestIp.mw());

/** Parsing */
app.use(cookieParser(env.COOKIES_SECRET));
app.use(express.json({ limit: env.PAYLOAD_LIMIT, strict: true }));
app.use(express.urlencoded({ limit: env.PAYLOAD_LIMIT, extended: true }));

/** Compression */
app.use(
  compression({
    filter: (req: Request, res: Response) => {
      if (req.headers.accept === "text/event-stream") return false;
      return compression.filter(req, res);
    },
  })
);

/** Static Files */
app.use("/public/temp", express.static(join(__dirname, "../public/temp")));

/** API Routes */
app.use("/api", limiter(), routers);

app.get("/", (req: Request<{}, {}, {}, { name?: string }>, res: Response) => {
  const name = req.query["name"] ?? "Unknown";
  return new HttpResponse(200, `Express + Peer says hello to ${name}!`).send(res);
});

/** Error Handler */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);

  if (err instanceof MulterError) {
    return new HttpResponse(400, err.message).send(res);
  }

  if (err instanceof HttpError) {
    return new HttpResponse(err.code, err.message).send(res);
  }

  req.log.error({ err }, "Unhandled server error!");
  return new HttpResponse(500, "Internal server error!").send(res);
});

export default app;
