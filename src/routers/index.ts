import { Router } from "express";
import filesRoutes from "./files.js";
import { HttpResponse } from "#/utils/response.js";

const router = Router();

router.use("/files", filesRoutes);

router.get("/wakeup", async (req, res) => {
  const from = req.query["from"] ?? "Unknown";
  const ts = new Date().toISOString();
  return new HttpResponse(200, `Wake up server by ${from} at ${ts}!`).send(res);
});

export default router;
