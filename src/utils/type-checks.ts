function checkType(name: string, value: any, type: string, errorPrefix: string) {
    if (type === 'array' && !Array.isArray(value))
        throw new TypeError(`${errorPrefix} configuration setting '${name}' not of type '${type}'`);

    if (type != 'array' && typeof value !== type)
        throw new TypeError(`${errorPrefix} configuration setting '${name}' not of type '${type}'`);

    return true
}

export function checkTypeRequired(name: string, value: any, type: string) {
    if (value === null)
        throw new TypeError(`Required configuration setting '${name}' is missing`)

    return checkType(name, value, type, 'Required')
}

export function checkTypeOptional(name: string, value: any, type: string) {
    if (value === null)
        return true

    return checkType(name, value, type, 'Optional')
}
