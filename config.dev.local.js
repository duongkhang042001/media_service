module.exports = {
    host: '0.0.0.0',
    port: 8005,
    storageDir: 'data',
    clientId: '1061982757216-6fbtudqf5vgllbnanii4vvk900jdm20o.apps.googleusercontent.com',
    clientSecret: 'c5YoGYKaA6tzr_VU4PEx5Bu2',
    uiUsers: [
        { username: 'admin', password: '123' }, //Change username, password login
    ],
    database: {
        dbName: 'db.sqlite3',
        type: 'sqlite',
        pool: {
            afterCreate: (conn, cb) => {
                conn.run('PRAGMA journal_mode = DELETE; PRAGMA foreign_keys = ON', cb); //DELETE or VAL
            },
        },
    },
    // CORS option see https://github.com/fastify/fastify-cors#options
    cors: {
        origin: true,
        credentials: true,
        exposedHeaders: ['Content-Disposition'],
    },
    // BUSBOY options see https://github.com/mscdex/busboy#busboy-methods
    uploadLimits: {
        fields: 0, // Max number of non-file fields (Default: Infinity).
        fileSize: 300 * 1024 * 1024, // For multipart forms, the max file size (in bytes) (Default: Infinity).
        headerPairs: 100, // Max number of header key=>value pairs
    },
};
