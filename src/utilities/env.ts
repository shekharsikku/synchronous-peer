import { cleanEnv, str, url, num, port } from "envalid";
import "dotenv/config";

const env = cleanEnv(process.env, {
  GRIDFS_URI: url(),
  GRIDFS_DB: str(),
  GRIDFS_BKT: str(),

  COOKIES_SECRET: str(),
  PAYLOAD_LIMIT: str(),
  CORS_ORIGIN: str(),
  CORS_MAXAGE: num(),
  PORT: port(),

  NODE_ENV: str({
    choices: ["development", "production"],
    default: "development",
  }),
  LOG_LEVEL: str({
    choices: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
    default: "trace",
  }),
});

export default env;
