import { Model, Association, type ModelAttributeColumnOptions } from 'sequelize'

import OpenApiStrategy from './strategies/openapi'
import TypeMapper from './type-mapper'
import AttributeValidator from './attribute-validator'
import { checkTypeOptional, checkTypeRequired } from './utils/type-checks'
import { pick, omit } from './utils/util'


export type ModelContainer = {
    type: string,
    properties?: {}
    required?: string[]
}

export type ModelOptions = {
    include?: string[],
    exclude?: string[],
    associations?: boolean,
    includeAssociations?: string[],
    excludeAssociations?: string[],
}

const _strategy = new WeakMap<SchemaManager, OpenApiStrategy>()

const _modelOptions = new WeakMap<SchemaManager, ModelOptions>()

const _model = new WeakMap<SchemaManager, typeof Model>()


export default class SchemaManager {
    generate(model: typeof Model, strategy: OpenApiStrategy, options?: ModelOptions) {
        if (model === undefined) throw new Error('Missing method argument `model`')
        if (strategy === undefined) throw new Error('Mising method argument `strategy`')

        this.verifyModelOptions(
            Object.assign(
                {},
                {
                    include: [],
                    exclude: [],
                    associations: true,
                    includeAssociations: [],
                    excludeAssociations: [],
                },
                options
            )
        )
        this.verifyModel(model)
        this.verifyStrategy(strategy)

        const attributes = this.getAttributes()
        const result = this.getModelContainer()
        const requiredAttributes = []

        for (const attributeName of Object.keys(attributes)) {
            result.properties[attributeName] = this.getAttributeContainer(
                attributeName,
                attributes[attributeName]
            )

            if (this.isRequiredProperty(attributes[attributeName])) {
                requiredAttributes.push(attributeName)
            }
        }

        if (requiredAttributes.length > 0)
            result.required = requiredAttributes

        if (_modelOptions.get(this).associations === false) {
            return result
        }

        for (const association of Object.keys(model.associations)) {
            Object.assign(
                result.properties,
                this.getModelPropertyForAssociation(association, model.associations[association])
            )
        }

        return result
    }

    private verifyStrategy(strategy: OpenApiStrategy) {
        if (!(strategy instanceof OpenApiStrategy))
            throw new TypeError("Strategy must implement the 'OpenApiStrategy'")

        _strategy.set(this, strategy)
    }

    private verifyModelOptions(options: ModelOptions) {
        checkTypeOptional('include', options.include, 'array')
        checkTypeOptional('exclude', options.exclude, 'array')

        if (options.include.length > 0 && options.exclude.length > 0) {
            throw new Error("Model options 'include' and 'exclude' are mutually exclusive")
        }

        checkTypeRequired('associations', options.associations, 'boolean')
        checkTypeRequired('includeAssociations', options.includeAssociations, 'array')
        checkTypeRequired('excludeAssociations', options.excludeAssociations, 'array')

        if (options.includeAssociations.length > 0 && options.excludeAssociations.length > 0) {
            throw new Error(
                "Model options 'includeAssociations' and 'excludeAssociations' are mutually exclusive",
            )
        }

        _modelOptions.set(this, options)
    }

    private verifyModel(model: typeof Model) {
        if ('getAttributes' in model) {
            _model.set(this, model)
            return
        }

        throw new TypeError(
            'Provided model does not match expected format. Are you sure this is a Sequelize v6+ model ?',
        )
    }

    private getAttributes() {
        const model = _model.get(this)
        const attributes = model.getAttributes.bind(model)()

        if (_modelOptions.get(this).include.length > 0)
            return pick(attributes, _modelOptions.get(this).include)

        if (_modelOptions.get(this).exclude.length > 0)
            return omit(attributes, _modelOptions.get(this).exclude)

        return attributes
    }

    private getModelContainer() {
        const result: ModelContainer = {
            // identical for all models and schemas thus no need to over-engineer
            type: 'object',
            properties: {}
        }

        return result
    }

    private getAttributeContainer(attributeName: string, attributeProperties: ModelAttributeColumnOptions) {
        const typeMapper = new TypeMapper
        const attributeValidator = new AttributeValidator
        const result = {}

        Object.assign(result, typeMapper.map(attributeName, attributeProperties, _strategy.get(this)))
        Object.assign(result, attributeValidator.map(attributeProperties, _strategy.get(this)))
        Object.assign(result, this.getAttributePropertyTypeOverride(attributeName, attributeProperties))
        Object.assign(result, this.getAttributePropertyDescription(attributeName, attributeProperties))
        Object.assign(result, this.getPropertyReadOrWriteOnly(attributeName, attributeProperties))
        Object.assign(result, this.getAttributeExamples(attributeProperties))

        return result
    }

    isRequiredProperty(attributeProperties: ModelAttributeColumnOptions) {
        if (attributeProperties.allowNull === false)
            return true

        if (attributeProperties.defaultValue !== undefined)
            return true

        return false
    }

    getAttributeExamples(attributeProperties: ModelAttributeColumnOptions) {
        const examples = this.getCustomPropertyValue('examples', attributeProperties)

        if (examples === null)
            return null

        if (!Array.isArray(examples)) {
            throw new TypeError("The 'examples' property MUST be an array")
        }

        return _strategy.get(this).getPropertyExamples(examples)
    }

    getPropertyReadOrWriteOnly(attributeName: string, attributeProperties: ModelAttributeColumnOptions) {
        const readOnly = this.getCustomPropertyValue('readOnly', attributeProperties)
        const writeOnly = this.getCustomPropertyValue('writeOnly', attributeProperties)

        if (!(readOnly || writeOnly))
            return null

        if (readOnly && writeOnly) {
            throw new TypeError(
                `Custom properties 'readOnly' and 'writeOnly' for sequelize attribute '${attributeName}' are mutually exclusive`,
            )
        }

        if (readOnly) {
            checkTypeRequired('readOnly', readOnly, 'boolean')

            return {
                readOnly: true
            }
        }

        if (writeOnly) {
            checkTypeRequired('writeOnly', writeOnly, 'boolean')

            return {
                writeOnly: true
            }
        }
    }

    getAttributePropertyDescription(attributeName: string, attributeProperties: ModelAttributeColumnOptions) {
        const description = this.getCustomPropertyValue(
            'description',
            attributeProperties,
        )

        if (!description)
            return null

        checkTypeRequired(attributeName, description, 'string')

        return { description }
    }

    getCustomPropertyValue(propertyName: string, attributeProperties: ModelAttributeColumnOptions) {
        const jsonSchema = attributeProperties['jsonSchema']

        if (!jsonSchema)
            return null

        if (!jsonSchema[propertyName])
            return null

        return jsonSchema[propertyName]
    }

    getAttributePropertyTypeOverride(attributeName: string, attributeProperties: ModelAttributeColumnOptions) {
        const schema: ModelContainer = this.getCustomPropertyValue('schema', attributeProperties)

        if (!schema)
            return null

        if (typeof schema === 'object' && typeof schema.type === 'string')
            return schema

        throw new TypeError(
            `Custom property 'schema' for sequelize attribute '${attributeName}' should be an object with a 'type' key`,
        )
    }

    getModelPropertyForAssociation(associationName: string, association: Association) {
        const options = _modelOptions.get(this)

        if (options.excludeAssociations.length > 0 &&
            options.excludeAssociations.includes(associationName)) {
            return null
        }

        if (options.includeAssociations.length > 0 &&
            !options.includeAssociations.includes(associationName)) {
            return null
        }

        switch (association.associationType) {
            case 'HasOne':
                return _strategy.get(this).getPropertyForHasOneAssociation(associationName, association)

            case 'BelongsTo':
                return _strategy.get(this).getPropertyForBelongsToAssociation(associationName, association)

            case 'HasMany':
                return _strategy.get(this).getPropertyForHasManyAssociation(associationName, association)

            case 'BelongsToMany':
                return _strategy.get(this).getPropertyForBelongsToManyAssociation(associationName, association)

            default:
                return null
        }
    }
}
