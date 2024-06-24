"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveSync = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const file_1 = require("../entities/file");
const GoogleDriveSync = async function (fastify) {
    if (!fastify.drive) {
        console.log(`⚡️ [Server] Drive is not available, GoogleDriveSync will not run`);
        return;
    }
    // const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
    async function uploadFileToDrive(file) {
        const localFilePath = path_1.default.join(fastify.getStorageDir(file.folder, file.id), file.id);
        const dest = fs_1.default.createReadStream(localFilePath);
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
        if (delayMs > maxDelay)
            delayMs = maxDelay;
        setTimeout(syncTask, delayMs);
    }
    async function syncTask() {
        try {
            const em = fastify.orm.em.fork(true, true);
            const file = await em
                .getRepository(file_1.File)
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
        }
        catch (err) {
            console.error(`[GoogleDriveSync] error`, err);
            delayMs = delayMs === 0 ? 1000 : delayMs * 2;
            reScheduleTask();
        }
    }
    // kick start
    reScheduleTask();
};
exports.GoogleDriveSync = GoogleDriveSync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29vZ2xlLWRyaXZlLXN5bmMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9nb29nbGUtZHJpdmUtc3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw0Q0FBb0I7QUFDcEIsZ0RBQXdCO0FBQ3hCLDJDQUF3QztBQUdqQyxNQUFNLGVBQWUsR0FBRyxLQUFLLFdBQVcsT0FBd0I7SUFDckUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FDVCxrRUFBa0UsQ0FDbkUsQ0FBQztRQUNGLE9BQU87S0FDUjtJQUVELHNFQUFzRTtJQUV0RSxLQUFLLFVBQVUsaUJBQWlCLENBQUMsSUFBVTtRQUN6QyxNQUFNLGFBQWEsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUM3QixPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUMzQyxJQUFJLENBQUMsRUFBRSxDQUNSLENBQUM7UUFDRixNQUFNLElBQUksR0FBRyxZQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDaEQsYUFBYTtRQUNiLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUNoRCxNQUFNLEVBQUUsSUFBSTtZQUNaLEtBQUssRUFBRTtnQkFDTCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLElBQUksRUFBRSxJQUFJO2FBQ1g7WUFDRCxhQUFhO1lBQ2IsUUFBUSxFQUFFO2dCQUNSLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUM7YUFDM0I7U0FDRixDQUFDLENBQUM7UUFDSCxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDdkIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBRWhCLFNBQVMsY0FBYztRQUNyQixJQUFJLE9BQU8sR0FBRyxRQUFRO1lBQUUsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUMzQyxVQUFVLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxLQUFLLFVBQVUsUUFBUTtRQUNyQixJQUFJO1lBQ0YsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzQyxNQUFNLElBQUksR0FBRyxNQUFNLEVBQUU7aUJBQ2xCLGFBQWEsQ0FBQyxXQUFJLENBQUM7aUJBQ25CLE9BQU8sQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVCwrQ0FBK0M7Z0JBQy9DLE9BQU8sR0FBRyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBQzdDLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixPQUFPO2FBQ1I7WUFDRCxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBRVosNENBQTRDO1lBQzVDLE1BQU0sRUFBRSxHQUFHLE1BQU0saUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekMsMENBQTBDO1lBRTFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFFeEMsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakIsY0FBYyxFQUFFLENBQUM7U0FDbEI7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDOUMsT0FBTyxHQUFHLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUM3QyxjQUFjLEVBQUUsQ0FBQztTQUNsQjtJQUNILENBQUM7SUFFRCxhQUFhO0lBQ2IsY0FBYyxFQUFFLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBekVXLFFBQUEsZUFBZSxtQkF5RTFCIn0=