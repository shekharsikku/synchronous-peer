import { Router } from "express";
import { upload } from "#/middlewares/index.js";
import { uploadFile, getFile, deleteFile } from "#/controllers/files.js";

const router = Router();

router.post("/", upload.single("file"), uploadFile);
router.get("/:fid", getFile);
router.delete("/:fid", deleteFile);

export default router;
