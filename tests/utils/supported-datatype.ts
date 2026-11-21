import { DataTypes } from 'sequelize'

/**
 * Checks if the given DataType is supported by the current Sequelize version.
 */
export function supportedDataType(dataType: string): boolean {
  if (DataTypes[dataType]) {
    return true
  }

  return false
}
