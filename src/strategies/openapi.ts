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

    private generateRefObject(associationName: string, targetName: string) {
        return {
            [associationName]: {
                $ref: `#/components/schemas/${targetName}`
            }
        }
    }

    getPropertyForHasOneAssociation(associationName: string, association: Association) {
        return this.generateRefObject(associationName, association.target.name)
    }

    getPropertyForBelongsToAssociation(associationName: string, association: Association) {
        return this.generateRefObject(associationName, association.target.name)
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

    getPropertyForBelongsToManyAssociation(associationName: string, association: any) {
        const throughModelPlural = association?.through?.model?.options?.name?.plural
        const throughModelName = association?.through?.model?.name
        const targetName = association?.target?.name

        const allOf: any[] = []

        if (targetName) {
            allOf.push({ $ref: `#/components/schemas/${targetName}` })
        }

        if (throughModelPlural && throughModelName) {
            allOf.push({
                type: 'object',
                properties: {
                    [throughModelPlural]: {
                        $ref: `#/components/schemas/${throughModelName}`,
                    },
                },
            })
        }

        const items = allOf.length === 1
            ? allOf[0]
            : { allOf }

        return {
            [associationName]: {
                type: 'array',
                items,
            },
        }
    }

    /**
     * Extract args or return value.
     * @param val Validation value or object with args.
     */
    private extractValue(val: any) {
        if (!val) return val
        if (val.args) return val.args
        return val
    }

    /**
     * Returns the properties to validate value.
     */
    getPropertiesForValidate(validate: ModelValidateOptions) {
        if (!validate) return

        const result: any = {}

        for (const key of Object.keys(validate)) {
            const val: any = validate[key]

            switch (key) {
                case 'min': {
                    const v = this.extractValue(val)
                    if (v || v === 0) {
                        result['minimum'] = Array.isArray(v) ? v[0] : v
                    }
                    break
                }

                case 'max': {
                    const v = this.extractValue(val)
                    if (v || v === 0) {
                        result['maximum'] = Array.isArray(v) ? v[0] : v
                    }
                    break
                }

                case 'isEmail': {
                    if (val) result['format'] = 'email'
                    break
                }

                case 'isUUID': {
                    if (val) result['format'] = 'uuid'
                    break
                }

                case 'notEmpty': {
                    if (val) result['minLength'] = 1
                    break
                }

                case 'len': {
                    if (Array.isArray(val)) {
                        result['minLength'] = val[0]
                        result['maxLength'] = val[1]
                    } else if (val.args) {
                        result['minLength'] = val.args[0]
                        result['maxLength'] = val.args[1]
                    }
                    break
                }

                case 'isUrl': {
                    if (val) result['format'] = 'url'
                    break
                }

                case 'isDate': {
                    if (val) result['format'] = 'date-time'
                    break
                }

                case 'isAlpha': {
                    if (val) result['pattern'] = '^[a-zA-Z]+$'
                    break
                }

                case 'isNumeric': {
                    if (val) result['pattern'] = '^[0-9]+$'
                    break
                }

                case 'isAlphanumeric': {
                    if (val) result['pattern'] = '^[a-zA-Z0-9]+$'
                    break
                }

                case 'isLowercase': {
                    if (val) result['pattern'] = '^[a-z]+$'
                    break
                }

                case 'isUppercase': {
                    if (val) result['pattern'] = '^[A-Z]+$'
                    break
                }

                case 'contains': {
                    if (val) result['pattern'] = '^.*' + val + '.*$'
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
                    if (val instanceof RegExp) {
                        result['regexp'] = val.toString()
                    } else if (Array.isArray(val)) {
                        result['regexp'] = {
                            pattern: val[0],
                            flags: val[1],
                        }
                    } else if (val.args) {
                        if (val.args instanceof RegExp) {
                            result['regexp'] = val.args.toString()
                        } else if (Array.isArray(val.args)) {
                            result['regexp'] = {
                                pattern: val.args[0],
                                flags: val.args[1],
                            }
                        } else if (typeof val.args === 'string') {
                            result['regexp'] = (new RegExp(val.args)).toString()
                        }
                    } else if (typeof val === 'string') {
                        result['regexp'] = (new RegExp(val)).toString()
                    }
                    break
                }

                case 'isIn': {
                    if (val.args) {
                        const args = val.args.reduce((acc: (string | number)[], arg: (string | number)[]) => {
                            return acc.concat(arg)
                        }, [])
                        result['enum'] = args
                    } else {
                        result['enum'] = val[0]
                    }
                    break
                }

                case 'not': {
                    if (val && val instanceof RegExp) {
                        result['not'] = { regexp: val.toString() }
                    } else if (Array.isArray(val)) {
                        result['not'] = {
                            regexp: {
                                pattern: val[0],
                                flags: val[1],
                            },
                        }
                    } else if (val.args) {
                        if (val.args instanceof RegExp) {
                            result['not'] = { regexp: val.args.toString() }
                        } else if (Array.isArray(val.args)) {
                            result['not'] = {
                                regexp: {
                                    pattern: val.args[0],
                                    flags: val.args[1],
                                },
                            }
                        } else if (typeof val.args === 'string') {
                            result['not'] = { regexp: (new RegExp(val.args)).toString() }
                        }
                    } else if (typeof val === 'string') {
                        result['not'] = { regexp: (new RegExp(val)).toString() }
                    }
                    break
                }

                default: {
                    break
                }
            }
        }

        return result
    }
}
