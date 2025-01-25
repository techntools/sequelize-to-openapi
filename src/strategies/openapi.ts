import { Association, ModelValidateOptions } from 'sequelize'


export default class OpenApiStrategy {
    public additionalProperties: boolean

    constructor(options: { additionalProperties?: boolean } = {}) {
        this.additionalProperties = options.additionalProperties || false
    }

    getPropertyExamples(examples: any[]) {
        return {
            example: examples
        }
    }

    getPropertyForBase64Encoding() {
        return {
            format: 'byte',
        }
    }

    convertTypePropertyToAllowNull(type: [] | string) {
        if (Array.isArray(type)) {
            return {
                anyOf: type,
                nullable: true
            }
        }

        return {
            type,
            nullable: true
        }
    }

    getPropertyForHasOneAssociation(associationName: string, association: Association) {
        return {
            [associationName]: {
                $ref: `#/components/schemas/${association.target.name}`
            }
        }
    }

    getPropertyForBelongsToAssociation(associationName: string, association: Association) {
        return {
            [associationName]: {
                $ref: `#/components/schemas/${association.target.name}`
            }
        }
    }

    getPropertyForHasManyAssociation(associationName: string, association: Association) {
        return {
            [associationName]: {
                type: 'array',
                items: {
                    $ref: `#/components/schemas/${association.target.name}`,
                },
            },
        }
    }

    getPropertyForBelongsToManyAssociation(associationName: string, association: Association) {
        return {
            [associationName]: {
                type: 'array',
                items: {
                    allOf: [
                        {
                            $ref: `#/components/schemas/${association.target.name}`,
                        },
                        {
                            type: 'object',
                            properties: {
                                [association['through']['model']['options']['name']['plural']]: {
                                    $ref: `#/components/schemas/${association['through']['model']['name']}`,
                                },
                            },
                        },
                    ],
                },
            },
        }
    }

    /**
     * Returns the properties to validate value.
     *
     * @example
     * {
     *   sequence: {
     *     type: "integer",
     *     minimum: 1,
     *     maximum: 100,
     *   }
     * }
     */
    getPropertiesForValidate(validate: ModelValidateOptions) {
        if (!validate)
            return

        const result = {}

        Object.keys(validate).map(key => {
            const val: any = validate[key]

            switch(key) {
                case 'min': {
                    if (val || val === 0) {
                        if (val.args)
                            result['minimum'] = val.args[0]
                        else
                            result['minimum'] = val
                    }
                }

                break

                case 'max': {
                    if (val || val === 0) {
                        if (val.args)
                            result['maximum'] = val.args[0]
                        else
                            result['maximum'] = val
                    }
                }

                break

                case 'isEmail': {
                    if (val)
                        result['format'] = 'email'
                }

                break

                case 'isUUID': {
                    if (val)
                        result['format'] = 'uuid'
                }

                break

                case 'notEmpty': {
                    if (val)
                        result['minLength'] = 1
                }

                break

                case 'len': {
                    if (Array.isArray(val)) {
                        result['minLength'] = val[0]
                        result['maxLength'] = val[1]
                    } else if (val.args) {
                        result['minLength'] = val.args[0]
                        result['maxLength'] = val.args[1]
                    }
                }

                break

                case 'isUrl': {
                    if (val)
                        result['format'] = 'url'
                }

                break

                case 'isAlpha': {
                    if (val)
                        result['pattern'] = '^[a-zA-Z]+$'
                }

                break

                case 'isNumeric': {
                    if (val)
                        result['pattern'] = '^[0-9]+$'

                    break
                }

                case 'isAlphanumeric': {
                    if (val)
                        result['pattern'] = '^[a-zA-Z0-9]+$'
                }

                break

                case 'isLowercase': {
                    if (val)
                        result['pattern'] = '^[a-z]+$'

                    break
                }

                case 'isUppercase': {
                    if (val)
                        result['pattern'] = '^[A-Z]+$'

                    break
                }

                case 'contains': {
                    if (val)
                        result['pattern'] = '^.*' + val + '.*$'

                    break
                }

                case 'notContains': {
                    if (val.args) {
                        if (Array.isArray(val.args))
                            result['pattern'] = '^(?!.*(' + val.args.join('|') + ')).*$'
                        else
                            result['pattern'] = '^(?!.*' + val.args + ').*$'
                    } else {
                        result['pattern'] = '^(?!.*' + val + ').*$'
                    }

                    break
                }

                case 'notIn': {
                    if (val.args) {
                        const args = val.args.reduce((acc: (string | number)[], arg: (string | number)[]) => {
                            return acc.concat(arg)
                        }, [])

                        result['not'] = { enum: args }
                    } else {
                        result['not'] = { enum: val[0] }
                    }

                    break
                }

                case 'is': {
                    if (val instanceof RegExp)
                        result['regexp'] = val.toString()

                    if (Array.isArray(val)) {
                        result['regexp'] = {
                            pattern: val[0],
                            flags: val[1],
                        }
                    }

                    if (val.args) {
                        if (val.args instanceof RegExp)
                            result['regexp'] = val.args.toString()

                        if (Array.isArray(val.args)) {
                            result['regexp'] = {
                                pattern: val.args[0],
                                flags: val.args[1]
                            }
                        }

                        if (typeof val.args === 'string')
                            result['regexp'] = (new RegExp(val.args)).toString()
                    }

                    if (typeof val === 'string')
                        result['regexp'] = (new RegExp(val)).toString()

                    break
                }

                case 'not': {
                    if (val && val instanceof RegExp)
                        result['not'] = { regexp: val.toString() }

                    if (Array.isArray(val)) {
                        result['not'] = {
                            'regexp': {
                                pattern: val[0],
                                flags: val[1],
                            }
                        }
                    }

                    if (val.args) {
                        if (val.args instanceof RegExp)
                            result['not'] = { regexp: val.args.toString() }

                        if (Array.isArray(val.args)) {
                            result['not'] = {
                                'regexp': {
                                    pattern: val.args[0],
                                    flags: val.args[1]
                                }
                            }
                        }

                        if (typeof val.args === 'string')
                            result['not'] = { regexp: (new RegExp(val.args)).toString() }
                    }

                    if (typeof val === 'string')
                        result['not'] = { regexp: (new RegExp(val)).toString() }

                    break
                }

                default:
                    break
            }
        })

        return result
    }
}
