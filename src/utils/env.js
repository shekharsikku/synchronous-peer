const env = {
  PAYLOAD_LIMIT: process.env.PAYLOAD_LIMIT ?? "1mb",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ?? "5000",
};

export default env;
