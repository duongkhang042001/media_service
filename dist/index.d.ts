import { drive_v3 } from "googleapis";
import { MikroORM } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/sqlite";
interface Config {
    host: string;
    port: number;
    storageDir: string;
    uiUsers: {
        username: string;
        password: string;
    }[];
}
declare module "fastify" {
    interface FastifyInstance {
        drive: drive_v3.Drive;
        config: Config;
        orm: MikroORM;
        getStorageDir: (folder: string, id: string) => string;
    }
    interface FastifyRequest {
        em: EntityManager;
    }
}
export {};
