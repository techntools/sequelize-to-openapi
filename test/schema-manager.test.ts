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
            debugger
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
    describe(`Ensure option 'associations' with default value 'true':`, function () {
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy
        const schema = schemaManager.generate(models.User, strategy)

        it(`generates association property 'profile'`, function () {
            expect(schema.properties).toHaveProperty('profile')
        })

        it(`generates association property 'documents'`, function () {
            expect(schema.properties).toHaveProperty('documents')
        })
    })

    describe(`Ensure option 'associations' with user-specificed value 'false':`, function () {
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy
        const schema = schemaManager.generate(models.User, strategy, {
            associations: false,
        })

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
        });

        it(`do not include association 'profile'`, function () {
            expect(schema.properties!['profile']).toBeUndefined();
        });

        it(`include association 'documents'`, function () {
            expect(schema.properties).toHaveProperty('documents');
        });
    });
})
