"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRoute = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const lodash_1 = __importDefault(require("lodash"));
const fs_extra_1 = require("fs-extra");
const file_1 = require("../entities/file");
const errors_1 = require("../core/errors");
const stream_1 = __importDefault(require("stream"));
const sharp_1 = __importDefault(require("sharp"));
const core_1 = require("@mikro-orm/core");
const pipeline = util_1.default.promisify(stream_1.default.pipeline);
errors_1.errors.ERR_FILE_NOT_EXISTS_IN_GOOGLE_DRIVE = (id, name) => errors_1.createError(`File id %s name %s not exists in google drive`, 404);
errors_1.errors.ERR_FILE_NOT_EXISTS_IN_SERVER = (id, name) => errors_1.createError(`File id %s name %s not exists in server`, 404);
const FileRoute = async function (fastify, opts) {
    async function downloadFileFromDrive(file) {
        if (!file.googleDriveFileId) {
            throw new errors_1.errors.ERR_FILE_NOT_EXISTS_IN_GOOGLE_DRIVE(file.id, file.name);
        }
        const localFileDir = fastify.getStorageDir(file.folder, file.id);
        await fs_extra_1.ensureDir(localFileDir);
        const localFilePath = path_1.default.join(localFileDir, file.id);
        const dest = fs_1.default.createWriteStream(localFilePath);
        const res = await fastify.drive.files.get({
            fileId: file.googleDriveFileId,
            alt: "media",
        }, { responseType: "stream" });
        try {
            // @ts-ignore
            const resStream = res.data;
            await pipeline(resStream, dest);
        }
        catch (err) {
            console.log("download error", err);
            fs_1.default.promises.unlink(localFilePath).catch();
            throw err;
        }
    }
    fastify.get("/file/:id", {}, async (request, reply) => {
        // @ts-ignore
        const fileRepo = request.em.getRepository(file_1.File);
        const file = await fileRepo.findOne({ id: request.params.id });
        if (!file)
            throw new errors_1.errors.ERR_FILE_NOT_EXISTS_IN_SERVER(request.params.id, "");
        const filePath = path_1.default.join(fastify.getStorageDir(file.folder, file.id), request.params.id);
        // serve from local if exists
        if (!(await fs_extra_1.pathExists(filePath))) {
            if (fastify.drive) {
                console.log(`file ${file.id} not exists in local, start fetch from drive`);
                await downloadFileFromDrive(file);
            }
            else {
                throw new errors_1.errors.ERR_FILE_NOT_EXISTS_IN_SERVER(file.id, file.name);
            }
        }
        else {
            // console.log(`file ${file.id} exists in local, start fetch from local`)
        }
        reply.type(file.mimeType);
        if (file.mimeType.startsWith("image")) {
        }
        else {
            reply.header("Content-Disposition", `attachment; filename=${encodeURIComponent(file.name)}`);
        }
        reply.send(fs_1.default.createReadStream(filePath));
    });
    function parseFormat(format, largestDimension) {
        const parts = format.split("-");
        if (parts.length === 0)
            return {};
        else {
            let ret = {};
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
            if (ret.width && ret.width > 4096)
                ret.width = 4096;
            if (ret.height && ret.height > 4096)
                ret.height = 4096;
            return ret;
        }
    }
    fastify.get("/file/:id/:format", {}, async (request, reply) => {
        // @ts-ignore
        const fileRepo = request.em.getRepository(file_1.File);
        // TODO handle 304 và them cache header
        const file = await fileRepo.findOne({ id: request.params.id });
        if (!file)
            throw new errors_1.errors.ERR_FILE_NOT_EXISTS_IN_SERVER(request.params.id, "");
        const filePath = path_1.default.join(fastify.getStorageDir(file.folder, file.id), request.params.id);
        const transformedFilePath = filePath + "-" + request.params.format;
        if (!file.mimeType.startsWith("image/")) {
            // TODO throw 404 with error message
            reply.code(404).send();
            return;
        }
        // serve from local if exists
        if (await fs_extra_1.pathExists(transformedFilePath)) {
            reply.type(file.mimeType);
            reply.send(fs_1.default.createReadStream(transformedFilePath));
            return;
        }
        if (!(await fs_extra_1.pathExists(filePath))) {
            if (fastify.drive) {
                console.log(`file ${file.id} not exists in local, start fetch from drive`);
                await downloadFileFromDrive(file);
            }
            else {
                throw new errors_1.errors.ERR_FILE_NOT_EXISTS_IN_SERVER(file.id, file.name);
            }
        }
        // TODO su dung worker threads de transform image
        const img = sharp_1.default(filePath);
        const { width, height } = await img.metadata();
        const format = parseFormat(request.params.format, width > height ? "width" : "height");
        // console.log('format', format)
        if (!format.width && !format.height) {
            // no transform then send original file
            reply.type(file.mimeType);
            reply.send(fs_1.default.createReadStream(filePath));
            return;
        }
        await img.resize(format).toFile(transformedFilePath);
        reply.type(file.mimeType);
        if (file.mimeType.startsWith("image")) {
        }
        else {
            reply.header("Content-Disposition", `attachment; filename=${encodeURIComponent(file.name)}`);
        }
        reply.send(fs_1.default.createReadStream(transformedFilePath));
    });
    fastify.get("/file/folders", async (request, reply) => {
        // @ts-ignore
        const fileRepo = request.em.getRepository(file_1.File);
        const queryBuilder = fileRepo.createQueryBuilder();
        const folders = await queryBuilder.select("folder", true).execute();
        return lodash_1.default.map(folders, "folder");
    });
    fastify.get(`/folder/:folder`, {
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
    }, async (request, reply) => {
        const offset = request.query.offset || 0;
        let limit = request.query.limit || 100;
        if (limit > 100)
            limit = 100;
        // @ts-ignore
        const fileRepo = request.em.getRepository(file_1.File);
        const [files, count] = await fileRepo.findAndCount({ folder: request.params.folder }, [], { createTime: core_1.QueryOrder.DESC }, limit, offset);
        return {
            offset,
            limit,
            total: count,
            items: files,
        };
    });
    fastify.delete(`/file/:id`, {
        schema: {
            params: {
                type: "object",
                properties: { id: { type: "string" } },
            },
        },
    }, async (request, reply) => {
        // @ts-ignore
        const repository = request.em.getRepository(file_1.File);
        const file = await repository.findOne({ id: request.params.id });
        if (file) {
            try {
                const filePath = path_1.default.join(fastify.getStorageDir(file.folder, file.id), request.params.id);
                fs_1.default.unlinkSync(filePath);
            }
            catch { }
        }
        const affected = await repository.nativeDelete({ id: request.params.id });
        return { deleted: affected };
    });
};
exports.FileRoute = FileRoute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw0Q0FBb0I7QUFDcEIsZ0RBQXdCO0FBQ3hCLGdEQUF3QjtBQUN4QixvREFBdUI7QUFDdkIsdUNBQWlEO0FBQ2pELDJDQUF3QztBQUN4QywyQ0FBcUQ7QUFDckQsb0RBQTRCO0FBQzVCLGtEQUEwQjtBQUUxQiwwQ0FBNkM7QUFFN0MsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpELGVBQU0sQ0FBQyxtQ0FBbUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUN4RCxvQkFBVyxDQUFDLCtDQUErQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3BFLGVBQU0sQ0FBQyw2QkFBNkIsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUNsRCxvQkFBVyxDQUFDLHlDQUF5QyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRXZELE1BQU0sU0FBUyxHQUFHLEtBQUssV0FBVyxPQUF3QixFQUFFLElBQUk7SUFDckUsS0FBSyxVQUFVLHFCQUFxQixDQUFDLElBQVU7UUFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUMzQixNQUFNLElBQUksZUFBTSxDQUFDLG1DQUFtQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzFFO1FBRUQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqRSxNQUFNLG9CQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDOUIsTUFBTSxhQUFhLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxD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