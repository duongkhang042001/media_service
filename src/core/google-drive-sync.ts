import fs from "fs";
import path from "path";
import { File } from "../entities/file";
import { FastifyInstance } from "fastify";

export const GoogleDriveSync = async function (fastify: FastifyInstance) {
  if (!fastify.drive) {
    console.log(
      `⚡️ [Server] Drive is not available, GoogleDriveSync will not run`
    );
    return;
  }

  // const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  async function uploadFileToDrive(file: File): Promise<string> {
    const localFilePath = path.join(
      fastify.getStorageDir(file.folder, file.id),
      file.id
    );
    const dest = fs.createReadStream(localFilePath);
    // @ts-ignore
    const { data } = await fastify.drive.files.create({
      fields: "id",
      media: {
        mimeType: file.mimeType,
        body: dest,
      },
      // @ts-ignore
      resource: {
        name: file.name,
        parents: ["appDataFolder"],
      },
    });
    // @ts-ignore
    return data.id;
  }

  const maxDelay = 60000;
  let delayMs = 0;

  function reScheduleTask() {
    if (delayMs > maxDelay) delayMs = maxDelay;
    setTimeout(syncTask, delayMs);
  }

  async function syncTask() {
    try {
      const em = fastify.orm.em.fork(true, true);
      const file = await em
        .getRepository(File)
        .findOne({ googleDriveFileId: null });
      if (!file) {
        // console.log('no file to upload, inc delay');
        delayMs = delayMs === 0 ? 1000 : delayMs * 2;
        reScheduleTask();
        return;
      }
      delayMs = 0;

      // console.log('start upload file to drive')
      const id = await uploadFileToDrive(file);
      // console.log('upload file success', id);

      file.googleDriveFileId = id;
      file.googleDriveUploadTime = new Date();

      await em.flush();
      reScheduleTask();
    } catch (err) {
      console.error(`[GoogleDriveSync] error`, err);
      delayMs = delayMs === 0 ? 1000 : delayMs * 2;
      reScheduleTask();
    }
  }

  // kick start
  reScheduleTask();
};
