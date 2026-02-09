import { type ModelAttributeColumnOptions } from 'sequelize'

import OpenApiStrategy from './strategies/openapi'


/**
 * Class responsible for adding strategy-compatible Sequelize attribute
 * validators
 *
 * @copyright Copyright (c) 2024 Santosh Bandichode.
 * @license Licensed under the MIT License
 */
export default class AttributeValidator {
    /**
     * Returns the strategy-specific validators for the given Sequelize DataType
     *
     * @see {@link https://sequelize.org/docs/v6/core-concepts/validations-and-constraints}
     */
    map(properties: ModelAttributeColumnOptions, strategy: OpenApiStrategy) {
        let result = {}
        let attributeType = properties && properties.type && properties.type['key']

        // ----------------------------------------------------------------------
        // Sequelize validations
        // ----------------------------------------------------------------------
        switch (attributeType) {
            case 'INTEGER':
            case 'STRING':
                result = strategy.getPropertiesForValidate(properties.validate)
                break

            case 'HSTORE': {
                result = {
                    additionalProperties: {
                        type: 'string',
                        nullable: true
                    }
                }

                break
            }

            case 'RANGE': {
                result = {
                    items: {
                        anyOf: [
                            {
                                type: 'object',
                                properties: {
                                    value: {},
                                    inclusive: { type: 'boolean' }
                                },
                                required: ['value', 'inclusive'],
                                additionalProperties: false
                            }
                        ]
                    },
                    uniqueItems: true,
                    minItems: 2,
                    maxItems: 2,
                }

                const anyOf = result['items']['anyOf']
                const objectValue = anyOf[0]['properties']['value']

                if (properties.type['options'].subtype == 'INTEGER') {
                    objectValue['type'] = 'integer'

                    anyOf.push({ type: 'integer', nullable: true })

                    result['range'] = true
                }

                if (properties.type['options'].subtype == 'DECIMAL') {
                    objectValue['type'] = 'number'
                    objectValue['format'] = 'double'

                    anyOf.push({ type: 'number', nullable: true, format: 'double' })

                    result['range'] = true
                }

                /*
                 * https://github.com/OpenAPITools/openapi-generator/issues/19956#issuecomment-2434787797
                 *
                 *  "integer" without a specified "format" should always lead to a BigInteger
                 */
                if (properties.type['options'].subtype == 'BIGINT') {
                    objectValue['type'] = 'string'
                    objectValue['pattern'] = '^[0-9]+$'

                    anyOf.push({
                        type: 'string',
                        nullable: true,
                        pattern: '^[0-9]+$'
                    })

                    result['range'] = true
                }

                if (properties.type['options'].subtype == 'DATETIME') {
                    objectValue['type'] = 'string'
                    objectValue['format'] = 'date-time'

                    anyOf.push({ type: 'string', nullable: true, format: 'date-time' })

                    result['daterange'] = true
                }

                if (properties.type['options'].subtype == 'DATE') {
                    objectValue['type'] = 'string'
                    objectValue['format'] = 'date'

                    anyOf.push({ type: 'string', nullable: true, format: 'date' })

                    result['daterange'] = true
                }
            }

            default:
                break
        }

        return result
    }
}
