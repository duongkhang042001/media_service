import fs from "fs";
import path from "path";
import util from "util";
import _ from "lodash";
import { ensureDir, pathExists } from "fs-extra";
import { File } from "../entities/file";
import { createError, errors } from "../core/errors";
import stream from "stream";
import sharp from "sharp";
import { FastifyInstance } from "fastify";
import { QueryOrder } from "@mikro-orm/core";

const pipeline = util.promisify(stream.pipeline);

errors.ERR_FILE_NOT_EXISTS_IN_GOOGLE_DRIVE = (id, name) =>
  createError(`File id %s name %s not exists in google drive`, 404);
errors.ERR_FILE_NOT_EXISTS_IN_SERVER = (id, name) =>
  createError(`File id %s name %s not exists in server`, 404);

export const FileRoute = async function (fastify: FastifyInstance, opts) {
  async function downloadFileFromDrive(file: File) {
    if (!file.googleDriveFileId) {
      throw new errors.ERR_FILE_NOT_EXISTS_IN_GOOGLE_DRIVE(file.id, file.name);
    }

    const localFileDir = fastify.getStorageDir(file.folder, file.id);
    await ensureDir(localFileDir);
    const localFilePath = path.join(localFileDir, file.id);
    const dest = fs.createWriteStream(localFilePath);
    const res = await fastify.drive.files.get(
      {
        fileId: file.googleDriveFileId,
        alt: "media",
      },
      { responseType: "stream" }
    );

    try {
      // @ts-ignore
      const resStream = res.data as stream.Readable;
      await pipeline(resStream, dest);
    } catch (err) {
      console.log("download error", err);
      fs.promises.unlink(localFilePath).catch();
      throw err;
    }
  }

  fastify.get<{
    Params: { id: string };
  }>("/file/:id", {}, async (request, reply) => {
    // @ts-ignore
    const fileRepo = request.em.getRepository(File);
    const file = await fileRepo.findOne({ id: request.params.id });
    if (!file)
      throw new errors.ERR_FILE_NOT_EXISTS_IN_SERVER(request.params.id, "");
    const filePath = path.join(
      fastify.getStorageDir(file.folder, file.id),
      request.params.id
    );

    // serve from local if exists
    if (!(await pathExists(filePath))) {
      if (fastify.drive) {
        console.log(
          `file ${file.id} not exists in local, start fetch from drive`
        );
        await downloadFileFromDrive(file);
      } else {
        throw new errors.ERR_FILE_NOT_EXISTS_IN_SERVER(file.id, file.name);
      }
    } else {
      // console.log(`file ${file.id} exists in local, start fetch from local`)
    }

    reply.type(file.mimeType);
    if (file.mimeType.startsWith("image")) {
    } else {
      reply.header(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(file.name)}`
      );
    }
    reply.send(fs.createReadStream(filePath));
  });

  function parseFormat(format, largestDimension): any {
    const parts = format.split("-");
    if (parts.length === 0) return {};
    else {
      let ret: any = {};
      for (const item of parts) {
        const sizeMatches = item.match(/s(\d+)/);
        if (sizeMatches && sizeMatches.length === 2) {
          ret[largestDimension] = parseInt(sizeMatches[1]);
          continue;
        }

        const widthMatches = item.match(/w(\d+)/);
        if (widthMatches && widthMatches.length === 2) {
          ret.width = parseInt(widthMatches[1]);
          continue;
        }

        const heightMatches = item.match(/h(\d+)/);
        if (heightMatches && heightMatches.length === 2) {
          ret.height = parseInt(heightMatches[1]);
          continue;
        }
      }
      if (ret.width && ret.width > 4096) ret.width = 4096;
      if (ret.height && ret.height > 4096) ret.height = 4096;
      return ret;
    }
  }

  fastify.get<{
    Params: { id: string; format: string };
  }>("/file/:id/:format", {}, async (request, reply) => {
    // @ts-ignore
    const fileRepo = request.em.getRepository(File);
    // TODO handle 304 và them cache header
    const file = await fileRepo.findOne({ id: request.params.id });
    if (!file)
      throw new errors.ERR_FILE_NOT_EXISTS_IN_SERVER(request.params.id, "");
    const filePath = path.join(
      fastify.getStorageDir(file.folder, file.id),
      request.params.id
    );
    const transformedFilePath = filePath + "-" + request.params.format;

    if (!file.mimeType.startsWith("image/")) {
      // TODO throw 404 with error message
      reply.code(404).send();
      return;
    }
    // serve from local if exists
    if (await pathExists(transformedFilePath)) {
      reply.type(file.mimeType);
      reply.send(fs.createReadStream(transformedFilePath));
      return;
    }

    if (!(await pathExists(filePath))) {
      if (fastify.drive) {
        console.log(
          `file ${file.id} not exists in local, start fetch from drive`
        );
        await downloadFileFromDrive(file);
      } else {
        throw new errors.ERR_FILE_NOT_EXISTS_IN_SERVER(file.id, file.name);
      }
    }

    // TODO su dung worker threads de transform image
    const img = sharp(filePath);
    const { width, height } = await img.metadata();

    const format = parseFormat(
      request.params.format,
      width > height ? "width" : "height"
    );
    // console.log('format', format)
    if (!format.width && !format.height) {
      // no transform then send original file
      reply.type(file.mimeType);
      reply.send(fs.createReadStream(filePath));
      return;
    }

    await img.resize(format).toFile(transformedFilePath);

    reply.type(file.mimeType);
    if (file.mimeType.startsWith("image")) {
    } else {
      reply.header(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(file.name)}`
      );
    }
    reply.send(fs.createReadStream(transformedFilePath));
  });

  fastify.get("/file/folders", async (request, reply) => {
    // @ts-ignore
    const fileRepo = request.em.getRepository(File);
    const queryBuilder = fileRepo.createQueryBuilder();
    const folders = await queryBuilder.select("folder", true).execute();
    return _.map(folders, "folder");
  });

  fastify.get<{
    Querystring: { offset?: number; limit?: number };
    Params: { folder: string };
  }>(
    `/folder/:folder`,
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            offset: { type: "number", default: 0 },
            limit: { type: "number", default: 100 },
          },
        },
        params: {
          type: "object",
          properties: {
            folder: { type: "string", minLength: 3 },
          },
        },
      },
    },
    async (request, reply) => {
      const offset = request.query.offset || 0;
      let limit = request.query.limit || 100;
      if (limit > 100) limit = 100;

      // @ts-ignore
      const fileRepo = request.em.getRepository(File);
      const [files, count] = await fileRepo.findAndCount(
        { folder: request.params.folder },
        [],
        { createTime: QueryOrder.DESC },
        limit,
        offset
      );
      return {
        offset,
        limit,
        total: count,
        items: files,
      };
    }
  );

  fastify.delete<{
    Params: { id: string };
  }>(
    `/file/:id`,
    {
      schema: {
        params: {
          type: "object",
          properties: { id: { type: "string" } },
        },
      },
    },
    async (request, reply) => {
      // @ts-ignore
      const repository = request.em.getRepository(File);
      const file = await repository.findOne({ id: request.params.id });
      if (file) {
        try {
          const filePath = path.join(
            fastify.getStorageDir(file.folder, file.id),
            request.params.id
          );
          fs.unlinkSync(filePath);
        } catch {}
      }

      const affected = await repository.nativeDelete({ id: request.params.id });
      return { deleted: affected };
    }
  );
};
