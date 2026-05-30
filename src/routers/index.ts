import { Router, type Request, type Response } from "express";
import { formatBytes, formatUptime } from "#/utilities/helpers.js";
import { HttpResponse } from "#/utilities/response.js";
import filesRoutes from "./files.js";

const router = Router();

router.use("/files", filesRoutes);

router.get("/wakeup", async (req: Request<{}, {}, {}, { from?: string }>, res: Response) => {
  const from = req.query["from"] ?? "Unknown";
  const ts = new Date().toISOString();
  return new HttpResponse(200, `Wake up server by ${from} at ${ts}!`).send(res);
});

router.get("/stats", async (_req: Request, res: Response) => {
  const memory = process.memoryUsage();

  const data = {
    timestamp: new Date().toISOString(),
    uptime: formatUptime(),
    memory: {
      rss: {
        bytes: memory.rss,
        human: formatBytes(memory.rss),
      },
      heap_total: {
        bytes: memory.heapTotal,
        human: formatBytes(memory.heapTotal),
      },
      heap_used: {
        bytes: memory.heapUsed,
        human: formatBytes(memory.heapUsed),
      },
      external: {
        bytes: memory.external,
        human: formatBytes(memory.external),
      },
      array_buffers: {
        bytes: memory.arrayBuffers,
        human: formatBytes(memory.arrayBuffers),
      },
    },
    node: process.version,
    pid: process.pid,
  };

  return new HttpResponse(200, "Runtime memory stats!", { data }).send(res);
});

export default router;
