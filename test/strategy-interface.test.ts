import { supportedDataType } from './utils/supported-datatype'
import models from './models'
import SchemaManager from '../src/schema-manager'
import OpenApiStrategy from '../src/strategies/openapi'


describe('StrategyInterface', function() {
    const schemaManager = new SchemaManager
    const schema = schemaManager.generate(models.User, new OpenApiStrategy)

    describe('Ensure Sequelize attribute options render as expected and thus:', function () {
        if (supportedDataType('INTEGER')) {
            it("INTEGER with defaultValue has property 'default' with integer value 0", function () {
                expect(schema.properties!['INTEGER']['default']).toEqual(0)
            })
        }

        if (supportedDataType('STRING')) {
            it("STRING with defaultValue has property 'default' with expected string value", function () {
                expect(schema.properties!['STRING']['default']).toEqual('Default value for STRING');
            });
        }
    })

    // ------------------------------------------------------------------------
    // make sure custom Sequelize attribute options render as expected
    // ------------------------------------------------------------------------
    describe('Ensure custom Sequelize attribute options render as expected and thus:', function () {
        it("CUSTOM_DESCRIPTION has property 'description' with the expected string value", function () {
            expect(schema.properties!['CUSTOM_DESCRIPTION']['description']).toEqual(
                'Custom attribute description',
            );
        });

        describe('CUSTOM_EXAMPLES', function () {
            it("has property 'examples' of type 'array'", function () {
                expect(Array.isArray(schema.properties!['CUSTOM_EXAMPLES']['example'])).toBe(true);
            });

            it('with the two expected string values', function () {
                expect(schema.properties!['CUSTOM_EXAMPLES']['example']).toEqual([
                    'Custom example 1',
                    'Custom example 2',
                ]);
            });
        });

        it("CUSTOM_READONLY has property 'readOnly' with value 'true'", function () {
            expect(schema.properties!['CUSTOM_READONLY']['readOnly']).toEqual(true);
        });

        it("CUSTOM_WRITEONLY has property 'writeOnly' with value 'true'", function () {
            expect(schema.properties!['CUSTOM_WRITEONLY']['writeOnly']).toEqual(true);
        });
    });
})
