import { filesService } from "#/services/files.js";
import { HttpError, HttpResponse, asyncHandler } from "#/utils/response.js";

const forbiddenTypes = ["video/mp4", "video/mpeg", "video/ogg", "video/webm", "video/quicktime"];
const forbiddenExtensions = [".mp4", ".mpeg", ".ogg", ".webm", ".mov"];

export const uploadFile = asyncHandler<{}, {}, {}, { uid: string }>(async (req, res) => {
  const fileData = req.file;
  const userId = req.query["uid"];

  if (!fileData) {
    throw new HttpError(400, "Invalid file for upload!");
  }

  if (!userId) {
    throw new HttpError(400, "User id required!");
  }

  const fileType = fileData.mimetype.toLowerCase();
  const fileName = fileData.originalname.toLowerCase();

  if (forbiddenTypes.includes(fileType) || forbiddenExtensions.some((ext) => fileName.endsWith(ext))) {
    throw new HttpError(403, "Video files are not allowed!");
  }

  const uploadResult = await filesService.uploadFile(fileData, userId);

  if (!uploadResult.fileData) {
    throw new HttpError(500, "Failed to upload file!");
  }

  return new HttpResponse(200, "File uploaded successfully!", { data: uploadResult.fileData }).send(res);
});

export const getFile = asyncHandler<{ fid: string }, {}, {}, { action: string }>(async (req, res) => {
  const fileId = req.params["fid"];
  const action = req.query["action"];

  const { fileData, fileStream } = await filesService.getFile(fileId);

  const disposition = action === "download" ? "attachment" : "inline";
  const filename = encodeURIComponent(fileData.filename);

  res.set({
    "Content-Type": fileData.metadata?.["contentType"] || "application/octet-stream",
    "Content-Disposition": `${disposition}; filename="${filename}"`,
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: fileData._id.toString(),
  });

  fileStream.on("error", () => {
    if (!res.headersSent) {
      throw new HttpError(500, "Failed to stream file!");
    }
  });

  return fileStream.pipe(res);
});

export const deleteFile = asyncHandler<{ fid: string }, {}, {}, { uid: string }>(async (req, res) => {
  const fileId = req.params["fid"];
  const userId = req.query["uid"];

  const deleteResult = await filesService.deleteFile(fileId, userId);

  return new HttpResponse(200, "File deleted successfully!", { data: deleteResult }).send(res);
});
