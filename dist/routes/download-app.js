"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadAppRoute = void 0;
const app_link_1 = require("../entities/app-link");
const core_1 = require("@mikro-orm/core");
var OS;
(function (OS) {
    OS[OS["IOS"] = 0] = "IOS";
    OS[OS["ANDROID"] = 1] = "ANDROID";
})(OS || (OS = {}));
const DownloadAppRoute = async function (fastify, opts) {
    function isIOS(userAgent) {
        return userAgent.match(/iPhone|iPad|iPod|Mac/i) != null;
    }
    function isAndroid(userAgent) {
        return userAgent.match(/Android/i) != null;
    }
    fastify.get(`/download-app/:name`, {
        schema: {
            params: {
                type: 'object',
                properties: {
                    name: { type: 'string', 'minLength': 3 }
                },
                required: ['name']
            }
        }
    }, async (request, reply) => {
        const userAgent = request.headers['user-agent'];
        // detect ios or android from User-Agent header
        let os;
        if (isIOS(userAgent))
            os = OS.IOS;
        else if (isAndroid(userAgent))
            os = OS.ANDROID;
        // @ts-ignore
        const appLinkRepo = request.em.getRepository(app_link_1.AppLink);
        const appLink = await appLinkRepo.findOne({ name: request.params.name });
        if (!appLink)
            throw new Error(`app ${request.params.name} not found`);
        // console.log('download-app', os, userAgent)
        switch (os) {
            case OS.ANDROID: {
                if (!appLink.androidLink) {
                    reply.code(404).send();
                    return;
                }
                reply.redirect(302, appLink.androidLink);
                break;
            }
            case OS.IOS: {
                if (!appLink.iosLink) {
                    reply.code(404).send();
                    return;
                }
                reply.redirect(302, appLink.iosLink);
                break;
            }
            default: {
                if (!appLink.androidLink) {
                    reply.code(404).send();
                    return;
                }
                reply.redirect(302, appLink.androidLink);
            }
        }
    });
    fastify.get(`/app-link`, {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    offset: { type: 'number', default: 0 },
                    limit: { type: 'number', default: 100 },
                }
            },
        }
    }, async (request, reply) => {
        const offset = request.query.offset || 0;
        let limit = request.query.limit || 100;
        if (limit > 100)
            limit = 100;
        // @ts-ignore
        const appLinkRepo = request.em.getRepository(app_link_1.AppLink);
        const [files, count] = await appLinkRepo.findAndCount({}, [], { createTime: core_1.QueryOrder.DESC }, limit, offset);
        return {
            offset, limit,
            total: count,
            items: files,
        };
    });
    fastify.patch(`/app-link/:id`, {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'number' } }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    iosLink: { type: 'string' },
                    androidLink: { type: 'string' },
                },
                additionalProperties: false
            },
        }
    }, async (request, reply) => {
        // @ts-ignore
        const repository = request.em.getRepository(app_link_1.AppLink);
        const record = await repository.findOneOrFail({ id: request.params.id });
        request.em.assign(record, request.body);
        await repository.persistAndFlush(record);
        return record;
    });
    fastify.post(`/app-link`, {
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    iosLink: { type: 'string' },
                    androidLink: { type: 'string' },
                },
                additionalProperties: false
            },
        }
    }, async (request, reply) => {
        // @ts-ignore
        const repository = request.em.getRepository(app_link_1.AppLink);
        const record = await repository.create(request.body);
        await repository.persistAndFlush(record);
        return record;
    });
    fastify.delete(`/app-link/:id`, {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'number' } }
            }
        }
    }, async (request, reply) => {
        // @ts-ignore
        const repository = request.em.getRepository(app_link_1.AppLink);
        const affected = await repository.nativeDelete({ id: request.params.id });
        return { deleted: affected };
    });
};
exports.DownloadAppRoute = DownloadAppRoute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWQtYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlcy9kb3dubG9hZC1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsbURBQTRDO0FBQzVDLDBDQUEwQztBQUUxQyxJQUFLLEVBQWlCO0FBQXRCLFdBQUssRUFBRTtJQUFFLHlCQUFHLENBQUE7SUFBRSxpQ0FBTyxDQUFBO0FBQUEsQ0FBQyxFQUFqQixFQUFFLEtBQUYsRUFBRSxRQUFlO0FBRWYsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLFdBQVcsT0FBd0IsRUFBRSxJQUFJO0lBSzFFLFNBQVMsS0FBSyxDQUFDLFNBQVM7UUFDcEIsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLElBQUksSUFBSSxDQUFBO0lBQzNELENBQUM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxTQUFTO1FBQ3hCLE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUE7SUFDOUMsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBRVIscUJBQXFCLEVBQUU7UUFDdEIsTUFBTSxFQUFFO1lBQ0osTUFBTSxFQUFFO2dCQUNKLElBQUksRUFBUSxRQUFRO2dCQUNwQixVQUFVLEVBQUU7b0JBQ1IsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFDO2lCQUN6QztnQkFDRCxRQUFRLEVBQUksQ0FBQyxNQUFNLENBQUM7YUFDdkI7U0FDSjtLQUNKLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUN4QixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQy9DLCtDQUErQztRQUMvQyxJQUFJLEVBQUUsQ0FBQTtRQUNOLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxD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