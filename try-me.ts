import SwaggerParser from "@apidevtools/swagger-parser"

import models from './test/models'
import schemaWrapper from './test/openapi-validation-wrapper'
import { SchemaManager, OpenApiStrategy } from './src'

const schemaManager = new SchemaManager
const openapiStrategy = new OpenApiStrategy

const userSchema = schemaManager.generate(models.User, openapiStrategy)

schemaWrapper.components.schemas.user = userSchema
schemaWrapper.components.schemas.profile = schemaManager.generate(models.Profile, openapiStrategy)
schemaWrapper.components.schemas.document = schemaManager.generate(models.Document, openapiStrategy)
schemaWrapper.components.schemas.company = schemaManager.generate(models.Company, openapiStrategy)
schemaWrapper.components.schemas.friendship = schemaManager.generate(models.Friendship, openapiStrategy)
schemaWrapper.components.schemas.group = schemaManager.generate(models.Group, openapiStrategy)
schemaWrapper.components.schemas.usergroup = schemaManager.generate(models.UserGroup, openapiStrategy)

console.log('OpenAPI Schema', JSON.stringify(schemaWrapper, null, 4))

;(async function() {
    try {
        console.log('Validating generated full schema against swagger-parser...');

        const wrapper = structuredClone(schemaWrapper)
        const user = wrapper.components.schemas.user

        /*
         * These have non-standard validation properties specific to AJV
         */
        delete user.properties.STRING_IS
        delete user.properties.STRING_IS_STRING
        delete user.properties.STRING_IS_ARGED_STRING
        delete user.properties.STRING_IS_ARGED_REGEXP
        delete user.properties.STRING_IS_ARRAY

        delete user.properties.STRING_NOT
        delete user.properties.STRING_NOT_STRING
        delete user.properties.STRING_NOT_ARGED_STRING
        delete user.properties.STRING_NOT_ARGED_REGEXP
        delete user.properties.STRING_NOT_ARRAY

        delete user.properties.RANGE_INTEGER
        delete user.properties.RANGE_DECIMAL
        delete user.properties.RANGE_BIGINT
        delete user.properties.RANGE_DATE
        delete user.properties.RANGE_DATEONLY

        const api = await SwaggerParser.validate(Object.assign({}, wrapper))
        console.log('Wrapper passed OpenAPI validation: API name: %s, Version: %s', api.info.title, api.info.version)
    } catch(err) {
        console.log(err)
    }
})()
