/**
 * Native alternatives for lodash.
 *
 * @see {@link https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore}
 * @see {@link https://xebia.com/blog/you-might-not-need-lodash-in-your-es2015-project/}
 */

export function capitalize(str: string) {
    if (typeof str !== 'string') {
        throw new TypeError("The argument for _capitalize() must be a string")
    }

    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function pick(obj: {}, keys: string[]) {
    return keys.reduce((result, key) => {
        if (obj && obj.hasOwnProperty(key)) {
            result[key] = obj[key]
        }

        return result
    }, {})
}

// ---------------------------------------------------
// omit alternative taken from
// https://dustinpfister.github.io/2019/08/19/lodash_omit/
// ---------------------------------------------------
const inProps = function (key: string, props: string[]) {
    return props.some((omitKey) => {
        return omitKey === key
    })
}

export function omit(obj: {}, properties: string[]) {
    const result = {}
    for (const key of Object.keys(obj)) {
        if (!inProps(key, properties)) {
            result[key] = obj[key]
        }
    }

    return result
}
