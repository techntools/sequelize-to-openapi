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
                    uniqueItems: true,
                    minItems: 2,
                    maxItems: 2,
                }

                if (properties.type['options'].subtype == 'INTEGER') {
                    result['items'] = { type: 'integer' }
                    result['range'] = true
                }

                if (properties.type['options'].subtype == 'DECIMAL') {
                    result['items'] = { type: 'number', format: 'double' }
                    result['range'] = true
                }

                /*
                 * https://github.com/OpenAPITools/openapi-generator/issues/19956#issuecomment-2434787797
                 *
                 *  "integer" without a specified "format" should always lead to a BigInteger
                 */
                if (properties.type['options'].subtype == 'BIGINT') {
                    result['items'] = {
                        type: 'string',
                        pattern: '^[0-9]+$'
                    }
                    result['range'] = true
                }

                if (properties.type['options'].subtype == 'DATETIME') {
                    result['items'] = { type: 'string', format: 'date-time' }
                    result['daterange'] = true
                }

                if (properties.type['options'].subtype == 'DATE') {
                    result['items'] = { type: 'string', format: 'date' }
                    result['daterange'] = true
                }
            }

            default:
                break
        }

        return result
    }
}
