const env = process.env.NODE_ENV === "development" ? "dev" : "prod";

import fs from "fs";
import Fastify, { FastifyInstance } from "fastify";
import FastifyMultiPart from "fastify-multipart";
import FastifyStatic from "fastify-static";
import FastifyCors from "fastify-cors";
import FastifyBasicAuth from "fastify-basic-auth";
import path from "path";
import _ from "lodash";
import { drive_v3, google } from "googleapis";

import { MikroORM } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/sqlite";
import { FavIconRoute, GoogleDriveSync } from "./core";
import { DownloadAppRoute, FileRoute, UploadRoute } from "./routes";

import { createError, errors } from "./core/errors";

errors.ERR_UNAUTHENTICATED = () => createError(`need account to access this`);

const pkg = JSON.parse(fs.readFileSync(__dirname + "/../package.json", "utf8"));

interface Config {
  host: string;
  port: number;
  storageDir: string;
  uiUsers: { username: string; password: string }[];
}

declare module "fastify" {
  interface FastifyInstance {
    drive: drive_v3.Drive;
    config: Config;
    orm: MikroORM;
    // em: EntityManager
    getStorageDir: (folder: string, id: string) => string;
  }

  interface FastifyRequest {
    em: EntityManager;
  }
}

async function createDrive() {
  try {
    const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf8"));
    const token = JSON.parse(fs.readFileSync("token.json", "utf8"));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    oAuth2Client.setCredentials(token);
    return google.drive({ version: "v3", auth: oAuth2Client });
  } catch {
    console.log(
      "⚡️ [Server] Google drive token (token.json) not found, please run npm script auth"
    );
    return undefined;
  }
}

(async () => {
  const config = loadConfig();

  const mikroConfig = require("../mikro-orm.config");
  const orm = await MikroORM.init(mikroConfig);

  const server: FastifyInstance = Fastify({
    ignoreTrailingSlash: true,
    disableRequestLogging: true,
  });

  server.setErrorHandler(function (error, request, reply) {
    // @ts-ignore
    if (error.serverError) {
      reply.send({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    } else {
      reply.send(error);
    }
  });

  server.decorate("drive", await createDrive());
  server.decorate("config", config);
  server.decorate("orm", orm);
  // server.decorate('em', orm.em)

  // lồng upload dir vào 2 cấp folder theo char 0 1 của id
  server.decorate(
    "getStorageDir",
    function getStorageDir(folder: string, id: string) {
      const levelOne = id.slice(0, 1);
      // const levelTwo = id.slice(1, 2)
      return path.join(config.storageDir, folder, levelOne);
    }
  );

  server.register(FastifyMultiPart, {
    limits: { ...config.uploadLimits, files: 1 }, // lock limit upload to one file
  });
  server.register(FastifyCors, config.cors);

  server.register(FavIconRoute);

  server.register(async (instance, opts) => {
    instance.addHook("preHandler", async (request, reply) => {
      // @ts-ignore
      request.em = orm.em.fork(true, true);
    });

    instance.register(UploadRoute);
    instance.register(FileRoute);
    instance.register(DownloadAppRoute);
  }, { 'prefix': '/api' });

  server.register(GoogleDriveSync);

  // auth for only fastify static
  server.register(async (instance, opts) => {
    const authenticate = { realm: "Media-Server" };
    instance
      .register(FastifyBasicAuth, {
        authenticate,
        validate: (username, password, req, reply, done) => {
          const users = server.config.uiUsers || [];
          const user = _.find(
            users,
            (item) => item.username === username && item.password === password
          );
          if (user) {
            done();
          } else {
            done(new errors.ERR_UNAUTHENTICATED());
          }
        },
      })
      .after(() => {
        instance.addHook("onRequest", instance.basicAuth);
      });

    instance.register(FastifyStatic, {
      root: path.resolve(path.join(__dirname, "..", "public")),
      prefix: "/",
      prefixAvoidTrailingSlash: true,
    });
  });

  const start = async () => {
    await server.ready()
    // server.listen(config.port, config.host, (err, address) => {
    //   if (err) {
    //     console.log(err);
    //     process.exit(1);
    //   } else {
    //     console.log(
    //       `⚡️ [Server] ${pkg.name}@${pkg.version} is listening at ${address}`
    //     );
    //   }
    // });
  };

  process.on("uncaughtException", (error) => {
    console.error(error);
  });
  process.on("unhandledRejection", (error) => {
    console.error(error);
  });

  start();
})();

function loadConfig() {
  const configPath = path.resolve(`config.${env}.local.js`);
  try {
    return require(configPath);
  } catch (err) {
    console.error(`load config ${configPath} failed`, err);
  }
}
