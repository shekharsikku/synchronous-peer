import { filesService } from "#/services/files.js";
import { logger } from "#/middlewares/index.js";
import jobs from "#/services/jobs.js";
import env from "#/utilities/env.js";
import server from "#/server.js";

const port = env.PORT;

(async () => {
  try {
    await filesService.connect();

    jobs.start();

    server.listen(port, () => {
      logger.info("Server running on port: %s", port);
    });
  } catch (err) {
    logger.error({ err }, "Server startup failed!");
    process.exit(1);
  }
})();
