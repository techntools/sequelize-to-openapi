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
      if (!properties.validate)
          return

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

          default:
              break
      }

      return result
  }
}
