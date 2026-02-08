import { ModelAttributeColumnOptions } from 'sequelize'

import OpenApiStrategy from './strategies/openapi'


const OBJECT = { type: 'object' }
const ARRAY = { type: 'array' }
const BOOLEAN = { type: 'boolean' }
const INTEGER = { type: 'integer' }
const NUMBER = { type: 'number' }
const STRING = { type: 'string' }
const ANY = { anyOf: [OBJECT, ARRAY, BOOLEAN, INTEGER, NUMBER, STRING] }


type PropertyType = (typeof OBJECT | typeof ARRAY | typeof BOOLEAN | typeof INTEGER | typeof NUMBER | typeof STRING | typeof ANY) & {
    maxLength?: number,
    format?: string,
    enum?: (string | number)[]
}

type Property = (PropertyType | { type: PropertyType[], items?: PropertyType[] }) & { default?: unknown }


export default class TypeMapper {
    map(attributeName: string, properties: ModelAttributeColumnOptions, strategy: OpenApiStrategy) {
        let result: Property
        let attributeType = properties && properties.type && properties.type['key']

        switch (attributeType) {
            case 'VIRTUAL': {
                attributeType = properties.type && properties.type['returnType'] && properties.type['returnType']['key']
                break
            }

            default:
                break
        }

        switch (attributeType) {
            case 'ARRAY': {
                result = {
                    ...ARRAY,
                    // Sequelize requires attribute.type to be defined for ARRAYs
                    items: this.map(
                        attributeName,
                        { type: properties.type['type'], allowNull: false },
                        strategy,
                    ),
                }
                break
            }

            case 'BIGINT': {
                result = { ...INTEGER, format: 'int64' }
                break
            }

            case 'BLOB': {
                result = { ...STRING }
                Object.assign(result, strategy.getPropertyForBase64Encoding())
                break
            }

            case 'BOOLEAN': {
                result = { ...BOOLEAN }
                break
            }

            case 'CIDR': {
                result = { ...STRING }
                break
            }

            case 'CITEXT': {
                result = { ...STRING }
                break
            }

            case 'DATE': {
                result = { ...STRING, format: 'date-time' }
                break
            }

            case 'DATEONLY': {
                result = { ...STRING, format: 'date' }
                break
            }

            case 'TIME': {
                result = { ...STRING, format: 'time' }
                break
            }

            case 'DECIMAL': {
                result = { ...NUMBER }
                break
            }

            case 'DOUBLE PRECISION': {
                result = { ...NUMBER, format: 'double' }
                break
            }

            // ----------------------------------------------------------------------
            // ENUM('value 1', 'value 2')
            // ----------------------------------------------------------------------
            case 'ENUM': {
                result = { ...STRING, enum: [...(properties.values || properties.type['values'])] }
                break
            }

            case 'INTEGER': {
                result = { ...INTEGER }
                break
            }

            case 'INET': {
                result = {
                    type: [
                        { ...STRING, format: 'ipv4' },
                        { ...STRING, format: 'ipv6' },
                    ],
                }
                break
            }

            case 'FLOAT': {
                result = { ...NUMBER, format: 'float' }
                break
            }

            case 'JSON': {
                result = { ...ANY }
                break
            }

            case 'JSONB': {
                result = { ...ANY }
                break
            }

            case 'MACADDR': {
                result = { ...STRING }
                break
            }

            case 'REAL': {
                result = { ...NUMBER }
                break
            }

            // ----------------------------------------------------------------------
            // STRING
            // STRING(1234)
            // ----------------------------------------------------------------------
            case 'STRING': {
                result = { ...STRING }

                if (properties.type['options'].length !== undefined) {
                    result.maxLength = properties.type['options'].length
                }

                break
            }

            case 'TEXT': {
                result = { ...STRING }
                break
            }

            case 'UUID': {
                result = { ...STRING, format: 'uuid' }
                break
            }
            case 'UUIDV1': {
                result = { ...STRING, format: 'uuid' }
                break
            }
            case 'UUIDV4': {
                result = { ...STRING, format: 'uuid' }
                break
            }

            case 'CHAR': {
                result = { ...STRING }
                break
            }

            case 'MEDIUMINT': {
                result = { ...INTEGER }
                break
            }
            case 'NUMBER': {
                result = { ...NUMBER }
                break
            }
            case 'SMALLINT': {
                result = { ...INTEGER }
                break
            }
            case 'TINYINT': {
                result = { ...NUMBER }
                break
            }

            case 'VIRTUAL': {
                result = this.map(
                    attributeName,
                    { ...properties, type: properties.type && properties.type['returnType'] },
                    strategy
                )

                break
            }

            case 'RANGE': {
                result = { ...ARRAY }
                break
            }

            case 'HSTORE': {
                result = { ...OBJECT }
                break
            }

            default:
                // ----------------------------------------------------------------------
                // use ANY for anything not matching
                // ----------------------------------------------------------------------
                result = { ...ANY }
        }

        if (properties.allowNull !== false)
            Object.assign(result, this.getNullableType(result['anyOf'] || result['type'], strategy))

        /*
         * Sequelize allows default value null as is actually recognied by
         * databases. Thats why the comparison is with undefined
         */
        if (properties.defaultValue !== undefined)
            result.default = properties.defaultValue

        return result
    }

    getNullableType(type: string, strategy: OpenApiStrategy) {
        const result = strategy.convertTypePropertyToAllowNull(type)

        if (typeof result !== 'object')
            throw new TypeError("convertTypePropertyToAllowNull() return value not of type 'object'")

        if (
            !Object.prototype.hasOwnProperty.call(result, 'type') &&
            !Object.prototype.hasOwnProperty.call(result, 'anyOf')
        ) {
            throw new TypeError(
                "convertTypePropertyToAllowNull() return value does not have property 'type' or 'anyOf'",
            )
        }

        return result
    }
}
