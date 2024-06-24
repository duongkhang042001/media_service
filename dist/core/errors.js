"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errors = void 0;
const { inherits, format } = require('util');
exports.errors = new Proxy(Object.create(null), {
    set(obj, key, value) {
        if (!!obj[key])
            throw new Error(`error code ${String(key)} already exists`);
        value.code = key; // set name to caller
        return obj[key] = value();
    }
});
function getErrorCode() {
    let code;
    try {
        throw new Error();
    }
    catch (e) {
        const lines = e.stack.split('at ');
        const codeLine = lines[3].split(' ')[0];
        code = codeLine.slice(codeLine.lastIndexOf('.') + 1);
        if (!code)
            throw new Error(`can't use createError directly, syntax errors.ERR_CODE = () => createError()`);
    }
    return code.toUpperCase();
}
function createError(message, statusCode = 500, Base = Error) {
    const code = getErrorCode();
    function ServerError() {
        // @ts-ignore
        Error.captureStackTrace(this, ServerError);
        // @ts-ignore;
        this.name = `ServerError [${code}]`;
        // @ts-ignore;
        this.code = code;
        // @ts-ignore;
        this.message = format(message, ...arguments);
        // @ts-ignore;
        this.statusCode = statusCode || undefined;
        // @ts-ignore;
        this.serverError = true;
    }
    ServerError.prototype[Symbol.toStringTag] = 'ServerError';
    inherits(ServerError, Base);
    return ServerError;
}
exports.createError = createError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvZXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQU0sRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBRTdCLFFBQUEsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDakQsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSztRQUNmLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBQzNFLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFBLENBQUMscUJBQXFCO1FBQ3RDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFBO0lBQzdCLENBQUM7Q0FDSixDQUFDLENBQUE7QUFFRixTQUFTLFlBQVk7SUFDakIsSUFBSSxJQUFJLENBQUE7SUFDUixJQUFJO1FBQ0EsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFBO0tBQ3BCO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNsQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZDLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDcEQsSUFBSSxDQUFDLElBQUk7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDhFQUE4RSxDQUFDLENBQUE7S0FDN0c7SUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUM3QixDQUFDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLE9BQWUsRUFBRSxVQUFVLEdBQUcsR0FBRyxFQUFFLElBQUksR0FBRyxLQUFLO0lBQ3ZFLE1BQU0sSUFBSSxHQUFHLFlBQVksRUFBRSxDQUFBO0lBRTNCLFNBQVMsV0FBVztRQUNoQixhQUFhO1FBQ2IsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQTtRQUMxQyxjQUFjO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsSUFBSSxHQUFHLENBQUE7UUFDbkMsY0FBYztRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLGNBQWM7UUFDZCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQTtRQUM1QyxjQUFjO1FBQ2QsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLElBQUksU0FBUyxDQUFBO1FBQ3pDLGNBQWM7UUFDZCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtJQUMzQixDQUFDO0lBRUQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsYUFBYSxDQUFBO0lBQ3pELFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDM0IsT0FBTyxXQUFXLENBQUE7QUFDdEIsQ0FBQztBQXJCRCxrQ0FxQkMifQ==