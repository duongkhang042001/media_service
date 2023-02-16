import {FastifyInstance} from 'fastify'
import _ from 'lodash'
import {AppLink} from '../entities/app-link'
import {QueryOrder} from '@mikro-orm/core'

enum OS {IOS, ANDROID}

export const DownloadAppRoute = async function (fastify: FastifyInstance, opts) {
    interface IDownloadApp {
        name: string
    }

    function isIOS(userAgent) {
        return userAgent.match(/iPhone|iPad|iPod|Mac/i) != null
    }

    function isAndroid(userAgent) {
        return userAgent.match(/Android/i) != null
    }

    fastify.get<{
        Params: IDownloadApp
    }>(`/download-app/:name`, {
        schema: {
            params: {
                type:       'object',
                properties: {
                    name: {type: 'string', 'minLength': 3}
                },
                required:   ['name']
            }
        }
    }, async (request, reply) => {
        const userAgent = request.headers['user-agent']
        // detect ios or android from User-Agent header
        let os
        if (isIOS(userAgent)) os = OS.IOS
        else if (isAndroid(userAgent)) os = OS.ANDROID

        // @ts-ignore
        const appLinkRepo = request.em.getRepository(AppLink)
        const appLink = await appLinkRepo.findOne({name: request.params.name})
        if (!appLink) throw new Error(`app ${request.params.name} not found`)

        // console.log('download-app', os, userAgent)

        switch (os) {
            case OS.ANDROID: {
                if (!appLink.androidLink) {
                    reply.code(404).send()
                    return
                }
                reply.redirect(302, appLink.androidLink)
                break
            }
            case OS.IOS: {
                if (!appLink.iosLink) {
                    reply.code(404).send()
                    return
                }
                reply.redirect(302, appLink.iosLink)
                break
            }
            default: {
                if (!appLink.androidLink) {
                    reply.code(404).send()
                    return
                }
                reply.redirect(302, appLink.androidLink)
            }
        }
    })

    fastify.get<{
        Querystring: { offset?: number, limit?: number }
    }>(`/app-link`, {
        schema: {
            querystring: {
                type:       'object',
                properties: {
                    offset: {type: 'number', default: 0},
                    limit:  {type: 'number', default: 100},
                }
            },
        }
    }, async (request, reply) => {
        const offset = request.query.offset || 0
        let limit = request.query.limit || 100
        if (limit > 100) limit = 100

        // @ts-ignore
        const appLinkRepo = request.em.getRepository(AppLink)
        const [files, count] = await appLinkRepo.findAndCount(
            {}, [],
            {createTime: QueryOrder.DESC}, limit, offset
        )
        return {
            offset, limit,
            total: count,
            items: files,
        }
    })

    fastify.patch<{
        Params: { id: number }
        Body: Pick<AppLink, 'name' | 'iosLink' | 'androidLink'>
    }>(`/app-link/:id`, {
        schema: {
            params: {
                type:       'object',
                properties: {id: {type: 'number'}}
            },
            body:   {
                type:                 'object',
                properties:           {
                    name:        {type: 'string'},
                    iosLink:     {type: 'string'},
                    androidLink: {type: 'string'},
                },
                additionalProperties: false
            },
        }
    }, async (request, reply) => {
        // @ts-ignore
        const repository = request.em.getRepository(AppLink)
        const record = await repository.findOneOrFail({id: request.params.id})
        request.em.assign(record, request.body)
        await repository.persistAndFlush(record)
        return record
    })

    fastify.post<{
        Body: Pick<AppLink, 'name' | 'iosLink' | 'androidLink'>
    }>(`/app-link`, {
        schema: {
            body: {
                type:                 'object',
                properties:           {
                    name:        {type: 'string'},
                    iosLink:     {type: 'string'},
                    androidLink: {type: 'string'},
                },
                additionalProperties: false
            },
        }
    }, async (request, reply) => {
        // @ts-ignore
        const repository = request.em.getRepository(AppLink)
        const record = await repository.create(request.body)
        await repository.persistAndFlush(record)
        return record
    })

    fastify.delete<{
        Params: { id: number }
    }>(`/app-link/:id`, {
        schema: {
            params: {
                type:       'object',
                properties: {id: {type: 'number'}}
            }
        }
    }, async (request, reply) => {
        // @ts-ignore
        const repository = request.em.getRepository(AppLink)
        const affected = await repository.nativeDelete({id: request.params.id})
        return {deleted: affected}
    })
}
