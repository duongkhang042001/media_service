module.exports = {
    apps: [
        {
            name: "media-service",
            script: "./dist/index.js",
            instances: "max",
            exec_mode: "cluster",
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
