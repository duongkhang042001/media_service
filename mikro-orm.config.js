const env = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';

const path = require('path');

const { FileCacheAdapter, EntityCaseNamingStrategy } = require('@mikro-orm/core');

function loadConfig() {
    const configPath = path.resolve(`config.${env}.local.js`);
    try {
        return require(configPath);
    } catch (err) {
        console.error(`load config ${configPath} failed`, err);
    }
}

const dbConfig = loadConfig().database;

module.exports = {
    ...dbConfig,
    debug: env === 'dev',
    entities: ['dist/entities'],
    entitiesTs: ['src/entities'],
    logger: console.log.bind(console),
    forceUtcTimezone: true,
    strict: false,
    highlight: false,
    namingStrategy: EntityCaseNamingStrategy,
    discovery: {
        warnWhenNoEntities: false, // by default, discovery throws when no entity is processed
        requireEntitiesArray: false, // force usage of `entities` instead of `entitiesDirs`
    },
    migrations: {
        tableName: 'MikroOrmMigration', // name of database table with log of executed transactions
        path: './migrations', // path to the folder with migrations
        pattern: /^[\w-]+\d+\.js$/, // regex pattern for the migration files
        transactional: true, // wrap each migration in a transaction
        disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
        allOrNothing: true, // wrap all migrations in master transaction
        dropTables: true, // allow to disable table dropping
        safe: false, // allow to disable table and column dropping
        emit: 'js', // migration generation mode
    },
    cache: {
        enabled: true,
        pretty: false, // allows to pretty print the JSON cache
        adapter: FileCacheAdapter, // you can provide your own implementation here, e.g. with redis
        options: { cacheDir: process.cwd() + '/.mikro-orm-metadata' }, // options will be passed to the constructor of `adapter` class
    },
};
