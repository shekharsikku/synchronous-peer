import { Router, type Request, type Response } from "express";
import { HttpResponse } from "#/utilities/response.js";
import filesRoutes from "./files.js";

const router = Router();

router.use("/files", filesRoutes);

router.get("/wakeup", async (req: Request<{}, {}, {}, { from?: string }>, res: Response) => {
  const from = req.query["from"] ?? "Unknown";
  const ts = new Date().toISOString();
  return new HttpResponse(200, `Wake up server by ${from} at ${ts}!`).send(res);
});

export default router;
