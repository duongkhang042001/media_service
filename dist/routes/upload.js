"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadRoute = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const stream_1 = __importDefault(require("stream"));
const util_1 = __importDefault(require("util"));
const fs_extra_1 = require("fs-extra");
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const errors_1 = require("../core/errors");
const file_1 = require("../entities/file");
errors_1.errors.ERR_NOT_A_MULTIPART_REQUEST = () => errors_1.createError("Request is not multipart", 400);
errors_1.errors.ERR_UPLOAD_FAILURE = (errMsg) => errors_1.createError("Upload failed %s", 500);
const pipeline = util_1.default.promisify(stream_1.default.pipeline);
const genUid = new short_unique_id_1.default({ length: 9 });
util_1.default.inherits(ByteCounter, stream_1.default.PassThrough);
function ByteCounter() {
    // @ts-ignore
    stream_1.default.PassThrough.call(this);
    // @ts-ignore
    this.size = 0;
}
ByteCounter.prototype._transform = function (chunk, encoding, callback) {
    this.size += chunk.length;
    this.push(chunk);
    callback();
};
const UploadRoute = async function (fastify, opts) {
    async function onEnd() { }
    function uploadHandler(request, reply) {
        var _a;
        const folder = (_a = request.params.folder) !== null && _a !== void 0 ? _a : "default";
        if (!request.isMultipart()) {
            reply.send(new errors_1.errors.ERR_NOT_A_MULTIPART_REQUEST());
            return;
        }
        // @ts-ignore
        const handler = async (field, fileStream, fileName, encoding, mimeType) => {
            let fileLimitReached = false;
            fileStream.on("limit", () => {
                fileLimitReached = true;
                fileStream.emit("error");
            });
            let file = { name: fileName };
            const id = genUid();
            const uploadDir = fastify.getStorageDir(folder, id);
            const uploadFilePath = path_1.default.join(uploadDir, id);
            try {
                await fs_extra_1.ensureDir(uploadDir);
                const counter = new ByteCounter();
                await pipeline(fileStream, counter, fs_1.default.createWriteStream(uploadFilePath));
                if (fileLimitReached) {
                    throw new Error("file size limit reached");
                }
                file.id = id;
                file.mimeType = mimeType;
                file.size = counter.size;
                const em = request.em;
                const fileRepo = em.getRepository(file_1.File);
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
            }
            catch (err) {
                fileStream.destroy();
                // delete failed upload file if exists
                fs_1.default.promises.unlink(uploadFilePath).catch();
                reply.send(new errors_1.errors.ERR_UPLOAD_FAILURE(err.message));
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
exports.UploadRoute = UploadRoute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlcy91cGxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4QixvREFBNEI7QUFDNUIsZ0RBQXdCO0FBQ3hCLHVDQUFxQztBQUNyQyxzRUFBNEM7QUFDNUMsMkNBQXFEO0FBQ3JELDJDQUF3QztBQUd4QyxlQUFNLENBQUMsMkJBQTJCLEdBQUcsR0FBRyxFQUFFLENBQ3hDLG9CQUFXLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDL0MsZUFBTSxDQUFDLGtCQUFrQixHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxvQkFBVyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRTdFLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqRCxNQUFNLE1BQU0sR0FBRyxJQUFJLHlCQUFhLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUVoRCxjQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxnQkFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBRS9DLFNBQVMsV0FBVztJQUNsQixhQUFhO0lBQ2IsZ0JBQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLGFBQWE7SUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNoQixDQUFDO0FBRUQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVE7SUFDcEUsSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakIsUUFBUSxFQUFFLENB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