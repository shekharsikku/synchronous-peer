import { cleanEnv, str, url, port } from "envalid";
import "dotenv/config";

const env = cleanEnv(process.env, {
  GRIDFS_URI: url(),
  GRIDFS_DB: str(),
  GRIDFS_BKT: str(),

  COOKIES_SECRET: str(),
  PAYLOAD_LIMIT: str(),
  CORS_ORIGIN: str(),
  PORT: port(),

  NODE_ENV: str({
    choices: ["development", "production"],
    default: "development",
  }),
  LOG_LEVEL: str({
    choices: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
    default: "info",
  }),
});

export default env;
