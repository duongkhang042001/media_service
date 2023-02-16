const {inherits, format} = require('util')

export const errors = new Proxy(Object.create(null), {
    set(obj, key, value) {
        if (!!obj[key]) throw new Error(`error code ${String(key)} already exists`)
        value.code = key // set name to caller
        return obj[key] = value()
    }
})

function getErrorCode() {
    let code
    try {
        throw new Error()
    } catch (e) {
        const lines = e.stack.split('at ')
        const codeLine = lines[3].split(' ')[0]
        code = codeLine.slice(codeLine.lastIndexOf('.') + 1)
        if (!code) throw new Error(`can't use createError directly, syntax errors.ERR_CODE = () => createError()`)
    }
    return code.toUpperCase()
}

export function createError(message: string, statusCode = 500, Base = Error) {
    const code = getErrorCode()

    function ServerError() {
        // @ts-ignore
        Error.captureStackTrace(this, ServerError)
        // @ts-ignore;
        this.name = `ServerError [${code}]`
        // @ts-ignore;
        this.code = code
        // @ts-ignore;
        this.message = format(message, ...arguments)
        // @ts-ignore;
        this.statusCode = statusCode || undefined
        // @ts-ignore;
        this.serverError = true
    }

    ServerError.prototype[Symbol.toStringTag] = 'ServerError'
    inherits(ServerError, Base)
    return ServerError
}
