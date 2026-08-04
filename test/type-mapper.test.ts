import { Sequelize, DataTypes } from 'sequelize'

import SchemaManager from '../src/schema-manager'
import OpenApiStrategy from '../src/strategies/openapi'


// --------------------------------------------------------------------------
// Using synthetic attribute definitions because the User model has no
// naturally-occurring unknown types and the strategy override must not leak
// between tests.
// --------------------------------------------------------------------------
describe('TypeMapper fallback and guard rails', function () {
    const sequelize = new Sequelize({ dialect: 'mysql' })
    const schemaManager = new SchemaManager

    it('falls back to anyOf for unknown attribute types', function () {
        const strategy = new OpenApiStrategy
        const model = sequelize.define(
            'unknown_type',
            {
                value: {
                    type: { key: 'SOMETHING_WEIRD' } as any,
                    allowNull: true,
                },
            },
            { timestamps: false, underscored: false },
        )

        expect(schemaManager.generate(model, strategy).properties!['value']).toMatchObject({
            anyOf: [
                { type: 'object' },
                { type: 'array' },
                { type: 'boolean' },
                { type: 'integer' },
                { type: 'number' },
                { type: 'string' },
            ],
            nullable: true,
        })
    })

    it('throws when convertTypePropertyToAllowNull returns a non-object', function () {
        const strategy = new OpenApiStrategy
        ;(strategy as any).convertTypePropertyToAllowNull = () => 'not-an-object'

        const model = sequelize.define(
            'guard_1',
            { value: { type: DataTypes.STRING, allowNull: true } },
            { timestamps: false, underscored: false },
        )

        expect(() => schemaManager.generate(model, strategy)).toThrow(TypeError)
        expect(() => schemaManager.generate(model, strategy)).toThrow(
            "convertTypePropertyToAllowNull() return value not of type 'object'",
        )
    })

    it('throws when convertTypePropertyToAllowNull returns an object without type or anyOf', function () {
        const strategy = new OpenApiStrategy
        ;(strategy as any).convertTypePropertyToAllowNull = () => ({ format: 'broken' })

        const model = sequelize.define(
            'guard_2',
            { value: { type: DataTypes.STRING, allowNull: true } },
            { timestamps: false, underscored: false },
        )

        expect(() => schemaManager.generate(model, strategy)).toThrow(TypeError)
        expect(() => schemaManager.generate(model, strategy)).toThrow(
            "convertTypePropertyToAllowNull() return value does not have property 'type' or 'anyOf'",
        )
    })
})
