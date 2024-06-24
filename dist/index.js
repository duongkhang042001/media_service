"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env = process.env.NODE_ENV === "development" ? "dev" : "prod";
const fs_1 = __importDefault(require("fs"));
const fastify_1 = __importDefault(require("fastify"));
const fastify_multipart_1 = __importDefault(require("fastify-multipart"));
const fastify_static_1 = __importDefault(require("fastify-static"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const fastify_basic_auth_1 = __importDefault(require("fastify-basic-auth"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const googleapis_1 = require("googleapis");
const core_1 = require("@mikro-orm/core");
const core_2 = require("./core");
const routes_1 = require("./routes");
const errors_1 = require("./core/errors");
errors_1.errors.ERR_UNAUTHENTICATED = () => errors_1.createError(`need account to access this`);
const pkg = JSON.parse(fs_1.default.readFileSync(__dirname + "/../package.json", "utf8"));
async function createDrive() {
    try {
        const credentials = JSON.parse(fs_1.default.readFileSync("credentials.json", "utf8"));
        const token = JSON.parse(fs_1.default.readFileSync("token.json", "utf8"));
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(token);
        return googleapis_1.google.drive({ version: "v3", auth: oAuth2Client });
    }
    catch {
        console.log("⚡️ [Server] Google drive token (token.json) not found, please run npm script auth");
        return undefined;
    }
}
(async () => {
    const config = loadConfig();
    const mikroConfig = require("../mikro-orm.config");
    const orm = await core_1.MikroORM.init(mikroConfig);
    const server = fastify_1.default({
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
        }
        else {
            reply.send(error);
        }
    });
    server.decorate("drive", await createDrive());
    server.decorate("config", config);
    server.decorate("orm", orm);
    // server.decorate('em', orm.em)
    // lồng upload dir vào 2 cấp folder theo char 0 1 của id
    server.decorate("getStorageDir", function getStorageDir(folder, id) {
        const levelOne = id.slice(0, 1);
        // const levelTwo = id.slice(1, 2)
        return path_1.default.join(config.storageDir, folder, levelOne);
    });
    server.register(fastify_multipart_1.default, {
        limits: { ...config.uploadLimits, files: 1 },
    });
    server.register(fastify_cors_1.default, config.cors);
    server.register(core_2.FavIconRoute);
    server.register(async (instance, opts) => {
        instance.addHook("preHandler", async (request, reply) => {
            // @ts-ignore
            request.em = orm.em.fork(true, true);
        });
        instance.register(routes_1.UploadRoute);
        instance.register(routes_1.FileRoute);
        instance.register(routes_1.DownloadAppRoute);
    });
    server.register(core_2.GoogleDriveSync);
    // auth for only fastify static
    server.register(async (instance, opts) => {
        const authenticate = { realm: "Media-Server" };
        instance
            .register(fastify_basic_auth_1.default, {
            authenticate,
            validate: (username, password, req, reply, done) => {
                const users = server.config.uiUsers || [];
                const user = lodash_1.default.find(users, (item) => item.username === username && item.password === password);
                if (user) {
                    done();
                }
                else {
                    done(new errors_1.errors.ERR_UNAUTHENTICATED());
                }
            },
        })
            .after(() => {
            instance.addHook("onRequest", instance.basicAuth);
        });
        instance.register(fastify_static_1.default, {
            root: path_1.default.resolve(path_1.default.join(__dirname, "..", "public")),
            prefix: "/",
            prefixAvoidTrailingSlash: true,
        });
    });
    const start = () => {
        server.listen(config.port, config.host, (err, address) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            else {
                console.log(`⚡️ [Server] ${pkg.name}@${pkg.version} is listening at ${address}`);
            }
        });
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
    const configPath = path_1.default.resolve(`config.${env}.local.js`);
    try {
        return require(configPath);
    }
    catch (err) {
        console.error(`load config ${configPath} failed`, err);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBRXBFLDRDQUFvQjtBQUNwQixzREFBbUQ7QUFDbkQsMEVBQWlEO0FBQ2pELG9FQUEyQztBQUMzQyxnRUFBdUM7QUFDdkMsNEVBQWtEO0FBQ2xELGdEQUF3QjtBQUN4QixvREFBdUI7QUFDdkIsMkNBQThDO0FBRTlDLDBDQUEyQztBQUUzQyxpQ0FBdUQ7QUFDdkQscUNBQW9FO0FBRXBFLDBDQUFvRDtBQUVwRCxlQUFNLENBQUMsbUJBQW1CLEdBQUcsR0FBRyxFQUFFLENBQUMsb0JBQVcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBRTlFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQXVCaEYsS0FBSyxVQUFVLFdBQVc7SUFDeEIsSUFBSTtRQUNGLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBRSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBRSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoRSxNQUFNLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDO1FBQzFFLE1BQU0sWUFBWSxHQUFHLElBQUksbUJBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUN6QyxTQUFTLEVB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