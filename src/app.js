import express from "express";
import cors from "cors";
import morgan from "morgan";
import env from "./utils/env.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: env.PAYLOAD_LIMIT,
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    limit: env.PAYLOAD_LIMIT,
    extended: true,
  }),
);

if (env.NODE_ENV === "development") {
  app.use(morgan("short"));
} else {
  app.set("trust proxy", 1);
  app.use(morgan("tiny"));
}

app.get("/", (req, res) => {
  const name = req.query["name"] ?? "Unknown";
  return res
    .status(200)
    .json({ message: `Express + Peer says hello to ${name}!` });
});

app.get("/wakeup", async (req, res) => {
  const from = req.query["from"] ?? "Unknown";
  const timestamp = new Date().toISOString();
  return res
    .status(200)
    .json({ message: `Wake up server by ${from} at ${timestamp}!` });
});

app.use((err, _req, res, next) => {
  console.error(`Error: ${err.message}`);
  return res.status(500).json({ message: "Internal server error!" });
});

export default app;
