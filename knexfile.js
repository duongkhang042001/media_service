function requireNoThrow(path) {
    try {
        return require(path);
    } catch {
        return undefined;
    }
}

module.exports = {
    development: requireNoThrow('./config.dev.local').database || {},
    production:  requireNoThrow('./config.prod.local').database || {},
};
