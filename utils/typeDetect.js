export function isFunction(param) {
    return typeof param === 'function';
}

export function isString(param) {
    return typeof param === 'string';
}

export function isObject(param) {
    return Object.prototype.toString.call(param) === "[object Object]";
}

export function isError(param) {
    return Object.prototype.toString.call(param).indexOf('Error') > -1;
}