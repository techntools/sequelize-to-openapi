import models from './models'
import { SchemaManager, OpenApiStrategy } from '../src'


describe('SchemaManager', function() {
    describe('Test configuration options for the generate() method', function () {
        describe('Ensure attribute exclusions:', function () {
            const schemaManager = new SchemaManager
            const strategy = new OpenApiStrategy
            const schema = schemaManager.generate(models.User, strategy, {
                exclude: ['STRING', 'STRING_1234']
            })

            it('exclude attribute STRING', function () {
                expect(schema.properties!['STRING']).toBeUndefined()
            })

            it('exclude attribute STRING_1234', function () {
                expect(schema.properties!['STRING_1234']).toBeUndefined()
            })
        })

        // ------------------------------------------------------------------------
        // make sure excluded attributes do appear in the resultant schema
        // ------------------------------------------------------------------------
        describe('Ensure attribute inclusions:', function () {
            const schemaManager = new SchemaManager
            const strategy = new OpenApiStrategy

            const schema = schemaManager.generate(models.User, strategy, {
                include: ['STRING', 'STRING_1234'],
                associations: false
            })

            it(`include attribute STRING`, function () {
                expect(schema.properties).toHaveProperty('STRING');
            });

            it(`include attribute STRING_1234`, function () {
                expect(schema.properties).toHaveProperty('STRING_1234');
            });

            it(`do not include other attributes`, function () {
                expect(Object.keys(schema.properties!).length).toBe(2);
            });
        });
    })

    // ------------------------------------------------------------------------
    // make sure option 'associations' functions as expected
    // ------------------------------------------------------------------------
    describe(`Ensure option 'associations' with user-specificed value 'true':`, function () {
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy
        const schema = schemaManager.generate(models.User, strategy, { associations: true })

        it(`generates association property 'profile'`, function () {
            expect(schema.properties).toHaveProperty('profile')
        })

        it(`generates association property 'documents'`, function () {
            expect(schema.properties).toHaveProperty('documents')
        })
    })

    describe(`Ensure option 'associations' with default value 'false':`, function () {
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy
        const schema = schemaManager.generate(models.User, strategy)

        it(`does not generate association property 'profile'`, function () {
            expect(schema.properties!['profile']).toBeUndefined()
        })

        it(`does not generate association property 'documents'`, function () {
            expect(schema.properties!['documents']).toBeUndefined()
        })
    });


    // ------------------------------------------------------------------------
    // make sure option 'includeAssociations' functions as expected
    // ------------------------------------------------------------------------
    describe('Ensure association inclusions:', function () {
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy
        const schema = schemaManager.generate(models.User, strategy, {
            includeAssociations: ['profile'],
            associations: true
        });

        it(`include association 'profile'`, function () {
            expect(schema.properties).toHaveProperty('profile')
        });

        it(`do not include association 'documents'`, function () {
            expect(schema.properties!['documents']).toBeUndefined()
        })
    })

    // ------------------------------------------------------------------------
    // make sure option 'excludeAssociations' functions as expected
    // ------------------------------------------------------------------------
    describe('Ensure association exclusions:', function () {
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy
        const schema = schemaManager.generate(models.User, strategy, {
            excludeAssociations: ['profile'],
            associations: true
        });

        it(`do not include association 'profile'`, function () {
            expect(schema.properties!['profile']).toBeUndefined();
        });

        it(`include association 'documents'`, function () {
            expect(schema.properties).toHaveProperty('documents');
        });
    });

    // ------------------------------------------------------------------------
    // make sure option 'readOnlyId' functions as expected
    // ------------------------------------------------------------------------
    describe('Ensure readOnlyId:', function () {
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy
        const schema = schemaManager.generate(models.User, strategy, {
            include: ['id'],
            readOnlyId: true
        });

        it(`is used for (primaryKey, autoIncrement) column`, function () {
            expect(schema.properties!['id']).toHaveProperty('readOnly');
            expect(schema.properties!['id']['readOnly']).toEqual(true);
        });
    })

    // ------------------------------------------------------------------------
    // make sure option 'commentAsDescription' functions as expected
    // ------------------------------------------------------------------------
    describe('Ensure commentAsDescription:', function () {
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy
        const schema = schemaManager.generate(models.User, strategy, {
            include: ['id'],
            commentAsDescription: true
        });

        it(`is used for (primaryKey, autoIncrement) column`, function () {
            expect(schema.properties!['id']).toHaveProperty('description');
            expect(schema.properties!['id']['description']).toEqual('Primary key of the table');
        });
    })

    // ------------------------------------------------------------------------
    // Validation and guard-rail behavior of SchemaManager.generate()
    // ------------------------------------------------------------------------
    describe('SchemaManager validation and guard rails', function () {
        const { DataTypes } = require('sequelize')
        const sequelize = (models as any).sequelize
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy

        it("throws when model is missing", function () {
            expect(() => schemaManager.generate(undefined as any, strategy)).toThrow(
                'Missing method argument `model`',
            )
        })

        it("throws when strategy is missing", function () {
            expect(() => schemaManager.generate(models.User, undefined as any)).toThrow(
                'Missing method argument `strategy`',
            )
        })

        it("throws when strategy is not an OpenApiStrategy", function () {
            expect(() => schemaManager.generate(models.User, {} as any)).toThrow(
                "Strategy must implement the 'OpenApiStrategy'",
            )
        })

        it("throws when model is not a Sequelize v6 model", function () {
            expect(() => schemaManager.generate({} as any, strategy)).toThrow(
                'Provided model does not match expected format. Are you sure this is a Sequelize v6+ model ?',
            )
        })

        it("throws when both 'include' and 'exclude' are provided", function () {
            expect(() =>
                schemaManager.generate(models.User, strategy, {
                    include: ['id'],
                    exclude: ['id'],
                }),
            ).toThrow("Model options 'include' and 'exclude' are mutually exclusive")
        })

        it("throws when both 'includeAssociations' and 'excludeAssociations' are provided", function () {
            expect(() =>
                schemaManager.generate(models.User, strategy, {
                    includeAssociations: ['profile'],
                    excludeAssociations: ['profile'],
                    associations: true,
                }),
            ).toThrow(
                "Model options 'includeAssociations' and 'excludeAssociations' are mutually exclusive",
            )
        })

        it("throws when 'examples' is not an array", function () {
            const BadModel = sequelize.define(
                'bad_examples',
                {
                    value: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        jsonSchema: { examples: 'not-an-array' },
                    },
                },
                { timestamps: false, underscored: false },
            )

            expect(() => schemaManager.generate(BadModel, strategy)).toThrow(
                "The 'examples' property MUST be an array",
            )
        })

        it("throws when both 'readOnly' and 'writeOnly' are provided", function () {
            const BadModel = sequelize.define(
                'bad_readwrite',
                {
                    value: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        jsonSchema: { readOnly: true, writeOnly: true },
                    },
                },
                { timestamps: false, underscored: false },
            )

            expect(() => schemaManager.generate(BadModel, strategy)).toThrow(
                "Custom properties 'readOnly' and 'writeOnly' for sequelize attribute 'value' are mutually exclusive",
            )
        })

        it("throws when 'writeOnly' is not a boolean", function () {
            const BadModel = sequelize.define(
                'bad_writeonly',
                {
                    value: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        jsonSchema: { writeOnly: 'yes' },
                    },
                },
                { timestamps: false, underscored: false },
            )

            expect(() => schemaManager.generate(BadModel, strategy)).toThrow(
                "Required configuration setting 'writeOnly' not of type 'boolean'",
            )
        })

        it("throws when 'readOnly' is not a boolean", function () {
            const BadModel = sequelize.define(
                'bad_readonly',
                {
                    value: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        jsonSchema: { readOnly: 'yes' },
                    },
                },
                { timestamps: false, underscored: false },
            )

            expect(() => schemaManager.generate(BadModel, strategy)).toThrow(
                "Required configuration setting 'readOnly' not of type 'boolean'",
            )
        })

        it("throws when 'jsonSchema.schema' is not an object with a string type", function () {
            const BadModel = sequelize.define(
                'bad_schema',
                {
                    value: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        jsonSchema: { schema: 'just-a-string' },
                    },
                },
                { timestamps: false, underscored: false },
            )

            expect(() => schemaManager.generate(BadModel, strategy)).toThrow(
                "Custom property 'schema' for sequelize attribute 'value' should be an object with a 'type' key",
            )
        })

        it("throws when 'jsonSchema' itself is not an object", function () {
            const BadModel = sequelize.define(
                'bad_jsonschema',
                {
                    value: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        jsonSchema: 'not-an-object' as any,
                    },
                },
                { timestamps: false, underscored: false },
            )

            expect(() => schemaManager.generate(BadModel, strategy)).toThrow(
                "Custom property 'jsonSchema' for sequelize attribute must be an object or null",
            )
        })

        it("returns null for associations whose associationType is unknown", function () {
            const Owner = sequelize.define(
                'owner_unknown_assoc',
                { value: { type: DataTypes.STRING, allowNull: false } },
                { timestamps: false, underscored: false },
            )
            const Pet = sequelize.define(
                'pet_unknown_assoc',
                { name: { type: DataTypes.STRING, allowNull: false } },
                { timestamps: false, underscored: false },
            )

            ;(Owner as any).associations['mystery'] = {
                associationType: 'SomethingMadeUp',
                target: Pet,
            }

            const schema = schemaManager.generate(Owner, strategy, { associations: true })

            expect(schema.properties!['mystery']).toBeUndefined()
        })
    })
})
