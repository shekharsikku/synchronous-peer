import { Readable } from "node:stream";
import { GridFSBucket, MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { logger } from "#/middlewares/index.js";
import { HttpError } from "#/utils/response.js";
import env from "#/utils/env.js";

class FilesService {
  private mongo: MongoClient;
  private bucket: GridFSBucket;

  constructor(gridfsUri: string, dbName: string, bucketName: string) {
    this.mongo = new MongoClient(gridfsUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    this.mongo.on("open", () => {
      logger.info("Mongo connection success!");
    });

    this.mongo.on("error", (err) => {
      logger.error({ err }, "Mongo connection error!");
    });

    const database = this.mongo.db(dbName);

    this.bucket = new GridFSBucket(database, {
      bucketName,
      chunkSizeBytes: 1024 * 1024,
    });
  }

  async connect() {
    await this.mongo.connect();
  }

  async uploadFile(fileData: Express.Multer.File, userId: string) {
    const readableStream = new Readable();

    readableStream.push(fileData.buffer);
    readableStream.push(null);

    const uploadStream = this.bucket.openUploadStream(fileData.originalname, {
      metadata: {
        contentType: fileData.mimetype,
        fileOwner: userId,
      },
    });

    readableStream.pipe(uploadStream);

    return await new Promise<{ fid: ObjectId }>((resolve, reject) => {
      uploadStream.on("finish", () => {
        resolve({ fid: uploadStream.id });
      });

      uploadStream.on("error", reject);
    });
  }

  async getFile(fileId: string) {
    const objectId = new ObjectId(fileId);

    const [fileData] = await this.bucket.find({ _id: objectId }).toArray();

    if (!fileData) {
      throw new HttpError(404, "File not found!");
    }

    const fileStream = this.bucket.openDownloadStream(objectId);

    return { fileData, fileStream };
  }

  async deleteFile(fileId: string, userId: string) {
    const objectId = new ObjectId(fileId);

    const fileData = await this.bucket.find({ _id: objectId }).next();

    if (!fileData) {
      throw new HttpError(404, "File not found!");
    }

    if (fileData.metadata?.["fileOwner"] !== userId) {
      throw new HttpError(403, "Deletion not allowed!");
    }

    await this.bucket.delete(objectId);

    return fileData;
  }
}

export const filesService = new FilesService(env.GRIDFS_URI, env.GRIDFS_DB, env.GRIDFS_BKT);
