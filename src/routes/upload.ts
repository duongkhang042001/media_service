import fs from "fs";
import path from "path";
import stream from "stream";
import util from "util";
import { ensureDir } from "fs-extra";
import ShortUniqueId from "short-unique-id";
import { errors, createError } from "../core/errors";
import { File } from "../entities/file";
import { FastifyInstance } from "fastify";

errors.ERR_NOT_A_MULTIPART_REQUEST = () =>
  createError("Request is not multipart", 400);
errors.ERR_UPLOAD_FAILURE = (errMsg) => createError("Upload failed %s", 500);

const pipeline = util.promisify(stream.pipeline);
const genUid = new ShortUniqueId({ length: 9 });

util.inherits(ByteCounter, stream.PassThrough);

function ByteCounter() {
  // @ts-ignore
  stream.PassThrough.call(this);
  // @ts-ignore
  this.size = 0;
}

ByteCounter.prototype._transform = function (chunk, encoding, callback) {
  this.size += chunk.length;
  this.push(chunk);
  callback();
};

export const UploadRoute = async function (fastify: FastifyInstance, opts) {
  async function onEnd() {}

  function uploadHandler(request, reply) {
    const folder = request.params.folder ?? "default";
    if (!request.isMultipart()) {
      reply.send(new errors.ERR_NOT_A_MULTIPART_REQUEST());
      return;
    }

    // @ts-ignore
    const handler = async (field, fileStream, fileName, encoding, mimeType) => {
      let fileLimitReached = false;

      fileStream.on("limit", () => {
        fileLimitReached = true;
        fileStream.emit("error");
      });

      let file: any = { name: fileName };
      const id = genUid();
      const uploadDir = fastify.getStorageDir(folder, id);
      const uploadFilePath = path.join(uploadDir, id);

      try {
        await ensureDir(uploadDir);

        const counter = new ByteCounter();
        await pipeline(
          fileStream,
          counter,
          fs.createWriteStream(uploadFilePath)
        );
        if (fileLimitReached) {
          throw new Error("file size limit reached");
        }

        file.id = id;
        file.mimeType = mimeType;
        file.size = counter.size;

        const em = request.em;
        const fileRepo = em.getRepository(File);
        const newFile = fileRepo.create({
          id,
          folder,
          name: fileName,
          size: counter.size,
          mimeType: mimeType,
          createTime: new Date(),
          updateTime: new Date(),
        });
        await em.persistAndFlush(newFile);

        reply.send(newFile);
      } catch (err) {
        fileStream.destroy();
        // delete failed upload file if exists
        fs.promises.unlink(uploadFilePath).catch();

        reply.send(new errors.ERR_UPLOAD_FAILURE((err as any).message));
      }
    };

    request.multipart(handler, onEnd);
  }

  fastify.post("/upload/:folder", async (request, reply) => {
    uploadHandler(request, reply);
  });

  fastify.post("/upload", async (request, reply) => {
    uploadHandler(request, reply);
  });
};
