import fs from 'fs'
import path from 'path'
import {FastifyInstance} from 'fastify'

export const FavIconRoute = async function (fastify: FastifyInstance, opts) {
    let faviconBuf: Buffer
    try {
        faviconBuf = fs.readFileSync(path.join(process.cwd(), 'favicon.ico'))
    } catch {
    }

    fastify.get('/favicon.ico', async (req, res) => {
        if (faviconBuf) {
            res.header('Content-Type', 'image/x-icon')
            res.send(faviconBuf)
        } else {
            res.code(404)
            res.send()
        }
    })
}
