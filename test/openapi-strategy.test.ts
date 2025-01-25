/**
 * Please note that we are ONLY testing strategy-specific behavior here. All
 * non-strategy-specific tests are handled by the StrategyInterface test case.
 */

import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import addKeywords from 'ajv-keywords'

const SwaggerParser = require('@apidevtools/swagger-parser')

import models from './models'
import SchemaManager from '../src/schema-manager'
import OpenApiStrategy from '../src/strategies/openapi'
import schemaWrapper from './openapi-validation-wrapper'


describe('OpenApi3Strategy', function () {
    describe('Test output using default options', function () {
        // ------------------------------------------------------------------------
        // generate schema
        // ------------------------------------------------------------------------
        const schemaManager = new SchemaManager
        const strategy = new OpenApiStrategy({ additionalProperties: true })
        const schema = schemaManager.generate(models.User, strategy, { associations: true })

        // validate document using ajv
        const ajv = new Ajv()
        addKeywords(ajv, "regexp")
        addFormats(ajv)

        // ------------------------------------------------------------------------
        // make sure sequelize DataTypes render as expected
        // ------------------------------------------------------------------------
        describe('Ensure Sequelize DataTypes are properly converted and thus:', function () {
            describe('BLOB', function () {
                it("has property 'format' of type 'byte'", function () {
                    expect(schema.properties!['BLOB']['format']).toEqual('byte')
                })
            })

            describe('UUIDV4', function () {
                it("has property 'format' of type 'byte'", function () {
                    expect(schema.properties!['UUIDV4']['format']).toEqual('uuid')
                })
            })
        })

        describe('STRING_ALLOWNULL_EXPLICIT', function () {
            it("has property 'type' of type 'string'", function () {
                expect(schema.properties!['STRING_ALLOWNULL_EXPLICIT'].type).toEqual('string')
            })

            it("has property 'nullable' of type 'boolean'", function () {
                expect(typeof schema.properties!['STRING_ALLOWNULL_EXPLICIT'].nullable).toEqual('boolean')
            })
        })

        // Sequelize allows null values by default so we need to make sure rendered schema
        // keys allow null by default (even when not explicitely setting `allowNull: true`)
        describe('STRING_ALLOWNULL_IMPLICIT', function () {
            it("has property 'type' of type 'string'", function () {
                expect(schema.properties!['STRING_ALLOWNULL_IMPLICIT'].type).toEqual('string')
            })

            it("has property 'nullable' of type 'boolean'", function () {
                expect(typeof schema.properties!['STRING_ALLOWNULL_IMPLICIT'].nullable).toEqual('boolean')
            })
        })

        describe('JSONB_ALLOWNULL', function () {
            it("has property 'anyOf' with values of type 'object', 'array', 'boolean', 'integer', 'number' and 'string'", function () {
                expect(schema.properties!['JSONB_ALLOWNULL'].anyOf).toEqual([
                    { type: 'object' },
                    { type: 'array' },
                    { type: 'boolean' },
                    { type: 'integer' },
                    { type: 'number' },
                    { type: 'string' },
                ])
            })

            it("has property 'nullable' of type 'boolean'", function () {
                expect(typeof schema.properties!['JSONB_ALLOWNULL'].nullable).toEqual('boolean')
            })
        })

        describe('ARRAY_ALLOWNULL_EXPLICIT', function () {
            it("has property 'type' of type 'string'", function () {
                expect(schema.properties!['ARRAY_ALLOWNULL_EXPLICIT'].type).toEqual('array')
            })

            it("has property 'nullable' of type 'boolean'", function () {
                expect(typeof schema.properties!['ARRAY_ALLOWNULL_EXPLICIT'].nullable).toEqual('boolean')
            })
        })

        describe('ARRAY_ALLOWNULL_IMPLICIT', function () {
            it("has property 'type' of type 'string'", function () {
                expect(schema.properties!['ARRAY_ALLOWNULL_IMPLICIT'].type).toEqual('array')
            })

            it("has property 'nullable' of type 'boolean'", function () {
                expect(typeof schema.properties!['ARRAY_ALLOWNULL_IMPLICIT'].nullable).toEqual('boolean')
            })
        })

        // ------------------------------------------------------------------------
        // make sure custom Sequelize attribute options render as expected
        // ------------------------------------------------------------------------
        describe('Ensure custom Sequelize attribute options render as expected and thus:', function () {
            describe('CUSTOM_DESCRIPTION', function () {
                it("has property 'description' with the expected string value", function () {
                    expect(schema.properties!['CUSTOM_DESCRIPTION'].description).toEqual(
                        'Custom attribute description',
                    )
                })
            })

            describe('CUSTOM_EXAMPLES', function () {
                it("has property 'example' of type 'array'", function () {
                    expect(Array.isArray(schema.properties!['CUSTOM_EXAMPLES'].example)).toBe(true)
                })

                it('with the two expected string values', function () {
                    expect(schema.properties!['CUSTOM_EXAMPLES'].example).toEqual([
                        'Custom example 1',
                        'Custom example 2',
                    ])
                })
            })
        })

        // ------------------------------------------------------------------------
        // make sure associations render as expected
        // ------------------------------------------------------------------------
        describe('Ensure associations are properly generated and thus:', function () {
            describe("user.HasOne(profile) generates singular property 'profile' with:", function () {
                it("property '$ref' pointing to '#/components/schemas/profile'", function () {
                    expect(schema.properties!['profile'].$ref).toEqual('#/components/schemas/profile')
                })
            })

            describe("user.HasOne(user, as:boss) generates singular property 'boss' with:", function () {
                it("property '$ref' pointing to '#/components/schemas/user'", function () {
                    expect(schema.properties!['boss'].$ref).toEqual('#/components/schemas/user')
                })

                it("required property 'bossId' of type integer", function () {
                    expect(schema.properties!['bossId'].type).toEqual('integer')
                    expect((schema.required as string[]).includes('bossId')).toBe(true)
                })
            })

            describe("user.BelongsTo(company) generates singular property 'company' with:", function () {
                it("property '$ref' pointing to '#/components/schemas/company'", function () {
                    expect(schema.properties!['company'].$ref).toEqual('#/components/schemas/company')
                })

                it("required property 'companyId' of type integer", function () {
                    expect(schema.properties!['companyId'].type).toEqual('integer')
                    expect((schema.required as string[]).includes('companyId')).toBe(true)
                })
            })

            describe("user.HasMany(document) generates plural property 'documents' with:", function () {
                it("property 'type' with value 'array'", function () {
                    expect(schema.properties!['documents'].type).toEqual('array')
                })

                it("array 'items' holding an object with '$ref' pointing to '#/components/schemas/document'", function () {
                    expect(schema.properties!['documents'].items).toEqual({
                        $ref: '#/components/schemas/document', // eslint-disable-line unicorn/prevent-abbreviations
                    })
                })
            })

            describe("user.BelongsToMany(friends) generates plural property 'friends' with:", function () {
                it("property 'type' with value 'array'", function () {
                    expect(schema.properties!['friends'].type).toEqual('array')
                })

                it("property 'items.allOf' of type 'array'", function () {
                    expect(Array.isArray(schema.properties!['friends'].items.allOf)).toBe(true)
                })

                it("array 'items.allOf' holding an object with '$ref' pointing to '#/components/schemas/user'", function () {
                    expect(schema.properties!['friends'].items.allOf[0]).toEqual({
                        $ref: '#/components/schemas/user',
                    })
                })

                it("second object with '$ref' pointing to '#/components/schemas/friendships'", function () {
                    expect(schema.properties!['friends'].items.allOf[1].properties.friendships.$ref).toEqual('#/components/schemas/friendship')
                })

                it("array 'items.allOf' holding an object with type object and properties.friendships an object with '$ref' pointing at '#/components/schemas/friendship'", function () {
                    expect(schema.properties!['friends'].items.allOf[1]).toEqual({
                        type: 'object',
                        properties: {
                            friendships: {
                                $ref: '#/components/schemas/friendship',
                            },
                        },
                    })
                })
            })
        })

        describe('Ensure that the resultant document:', function () {
            schemaWrapper.components.schemas.user = schema
            schemaWrapper.components.schemas.profile = schemaManager.generate(models.Profile, strategy)
            schemaWrapper.components.schemas.document = schemaManager.generate(models.Document, strategy)
            schemaWrapper.components.schemas.company = schemaManager.generate(models.Company, strategy)
            schemaWrapper.components.schemas.friendship = schemaManager.generate(
                models.Friendship,
                strategy,
            )

            it("has leaf /openapi with string containing version '3.n.n'", function () {
                expect(schemaWrapper.openapi).toMatch(/^3\.\d\.\d/); // 3.n.n
            })

            it('has non-empty container /components/schemas/user', function () {
                expect(Object.keys(schemaWrapper.components.schemas.user).length).toBeGreaterThan(0)
            })

            // Validate document using Swagger Parser
            //
            // Skipping for now as assertions are not being called
            xit('successfully validates as OpenAPI 3.0', async () => {
                expect.assertions(1)

                const wrapper = structuredClone(schemaWrapper)
                const user = wrapper.components.schemas.user

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

                const result = await SwaggerParser.validate(wrapper)
                expect(result).toHaveProperty('info')
            })
        })

        describe('Ensure Sequelize validations are properly added and thus:', function () {
            describe('INTEGER', function () {
                it("has numeric property 'minimum'", function () {
                    expect(schema.properties!['INTEGER'].minimum).toEqual(0)

                    {
                        const validate = ajv.compile(schema.properties!['INTEGER'])
                        const valid = validate(0)
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['INTEGER'])
                        const valid = validate(-1)
                        expect(valid).toBe(false)
                    }

                    expect(schema.properties!['INTEGER_ARGED'].minimum).toEqual(0)
                })

                it("has numeric property 'maximum'", function () {
                    expect(schema.properties!['INTEGER'].maximum).toEqual(10)

                    {
                        const validate = ajv.compile(schema.properties!['INTEGER'])
                        const valid = validate(10)
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['INTEGER'])
                        const valid = validate(11)
                        expect(valid).toBe(false)
                    }

                    expect(schema.properties!['INTEGER_ARGED'].maximum).toEqual(10)
                })
            })

            describe('STRING', function () {
                it("has email format", function () {
                    expect(schema.properties!['STRING_EMAIL'].format).toEqual('email')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_EMAIL'])
                        const valid = validate('a@g.com')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_EMAIL'])
                        const valid = validate('agcom')
                        expect(valid).toBe(false)
                    }

                    expect(schema.properties!['STRING_EMAIL_ARGED'].format).toEqual('email')
                })

                it("has length within range", function () {
                    expect(schema.properties!['STRING_LENGTH_RANGE'].minLength).toEqual(2)
                    expect(schema.properties!['STRING_LENGTH_RANGE'].maxLength).toEqual(10)

                    {
                        const validate = ajv.compile(schema.properties!['STRING_LENGTH_RANGE'])
                        const valid = validate('The keeper')
                        expect(valid).toBe(true)
                    }

                    {
                        let validate = ajv.compile(schema.properties!['STRING_LENGTH_RANGE'])
                        let valid = validate('')
                        expect(valid).toBe(false)

                        validate = ajv.compile(schema.properties!['STRING_LENGTH_RANGE'])
                        valid = validate('1')
                        expect(valid).toBe(false)

                        validate = ajv.compile(schema.properties!['STRING_LENGTH_RANGE'])
                        valid = validate('The Beekeeper')
                        expect(valid).toBe(false)
                    }

                    expect(schema.properties!['STRING_LENGTH_RANGE_ARGED'].minLength).toEqual(2)
                    expect(schema.properties!['STRING_LENGTH_RANGE_ARGED'].maxLength).toEqual(10)
                })

                it("has non-zero length", function () {
                    expect(schema.properties!['STRING_NOT_EMPTY'].minLength).toEqual(1)

                    {
                        const validate = ajv.compile(schema.properties!['STRING_NOT_EMPTY'])
                        const valid = validate('Kong')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_NOT_EMPTY'])
                        const valid = validate('')
                        expect(valid).toBe(false)
                    }

                    expect(schema.properties!['STRING_NOT_EMPTY_ARGED'].minLength).toEqual(1)
                })

                it("has URL format", function () {
                    expect(schema.properties!['STRING_IS_URL'].format).toEqual('url')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_URL'])
                        const valid = validate('http://example.com')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_URL'])

                        let valid = validate('http:/example.com')
                        expect(valid).toBe(false)

                        valid = validate('htt://example.com')
                        expect(valid).toBe(false)
                    }

                    expect(schema.properties!['STRING_IS_URL_ARGED'].format).toEqual('url')
                })

                it("has only letters", function () {
                    expect(schema.properties!['STRING_IS_ALPHA'].pattern).toEqual('^[a-zA-Z]+$')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_ALPHA'])
                        const valid = validate('godZilla')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_ALPHA'])

                        let valid = validate('ab9')
                        expect(valid).toBe(false)

                        valid = validate('Z8b')
                        expect(valid).toBe(false)
                    }
                })

                it("has only digits", function () {
                    expect(schema.properties!['STRING_IS_NUMERIC'].pattern).toEqual('^[0-9]+$')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_NUMERIC'])
                        const valid = validate('786')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_NUMERIC'])

                        let valid = validate('ab9')
                        expect(valid).toBe(false)

                        valid = validate('Z8b')
                        expect(valid).toBe(false)
                    }
                })

                it("has only small letters", function () {
                    expect(schema.properties!['STRING_IS_LOWERCASE'].pattern).toEqual('^[a-z]+$')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_LOWERCASE'])
                        const valid = validate('godzilla')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_LOWERCASE'])

                        let valid = validate('abZ')
                        expect(valid).toBe(false)

                        valid = validate('Zab')
                        expect(valid).toBe(false)
                    }
                })

                it("has only capital letters", function () {
                    expect(schema.properties!['STRING_IS_UPPERCASE'].pattern).toEqual('^[A-Z]+$')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_UPPERCASE'])
                        const valid = validate('GODZILLA')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_UPPERCASE'])

                        let valid = validate('abZ')
                        expect(valid).toBe(false)

                        valid = validate('Zab')
                        expect(valid).toBe(false)
                    }
                })

                it("has only letters and digits", function () {
                    expect(schema.properties!['STRING_IS_ALPHANUMERIC'].pattern).toEqual('^[a-zA-Z0-9]+$')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_ALPHANUMERIC'])
                        let valid = validate('a9Z')
                        expect(valid).toBe(true)

                        valid = validate('ab')
                        expect(valid).toBe(true)

                        valid = validate('99')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_ALPHANUMERIC'])

                        let valid = validate('a_')
                        expect(valid).toBe(false)

                        valid = validate('_9')
                        expect(valid).toBe(false)

                        valid = validate('_ab9')
                        expect(valid).toBe(false)
                    }
                })

                it("has substring", function () {
                    expect(schema.properties!['STRING_HAS_SUBSTRING'].pattern).toEqual('^.*foo.*$')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_HAS_SUBSTRING'])
                        let valid = validate('a foo b')
                        expect(valid).toBe(true)

                        valid = validate('foo b')
                        expect(valid).toBe(true)

                        valid = validate('a foo')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_HAS_SUBSTRING'])

                        let valid = validate('a fo b')
                        expect(valid).toBe(false)

                        valid = validate('a fo')
                        expect(valid).toBe(false)

                        valid = validate('fo b')
                        expect(valid).toBe(false)
                    }
                })

                it("has no substring", function () {
                    expect(schema.properties!['STRING_HAS_NO_SUBSTRING'].pattern).toEqual('^(?!.*bar).*$')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_HAS_NO_SUBSTRING'])
                        const valid = validate('foo')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_HAS_NO_SUBSTRING'])
                        const valid = validate('bar')
                        expect(valid).toBe(false)
                    }

                    expect(schema.properties!['STRING_HAS_NO_SUBSTRING_ARGED_ARRAY'].pattern).toEqual('^(?!.*(foo|bar)).*$')
                    expect(schema.properties!['STRING_HAS_NO_SUBSTRING_ARGED_NON_ARRAY'].pattern).toEqual('^(?!.*bar).*$')
                })

                it("has value not in", function () {
                    expect(schema.properties!['STRING_NOT_IN'].not).toEqual({ enum: ['mongoose'] })

                    {
                        const validate = ajv.compile(schema.properties!['STRING_NOT_IN'])
                        const valid = validate('lion')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_NOT_IN'])
                        const valid = validate('mongoose')
                        expect(valid).toBe(false)
                    }

                    expect(schema.properties!['STRING_NOT_IN_ARGED'].not).toEqual({ enum: ['mongoose', 'lion'] })
                })

                it("has value that is", function () {
                    expect(schema.properties!['STRING_IS'].regexp).toEqual('/^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$/')
                    expect(schema.properties!['STRING_IS_STRING'].regexp).toEqual('/^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$/')

                    expect(schema.properties!['STRING_IS_ARGED_STRING'].regexp).toEqual('/^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$/')
                    expect(schema.properties!['STRING_IS_ARGED_REGEXP'].regexp).toEqual('/^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$/')

                    expect(schema.properties!['STRING_IS_ARRAY'].regexp.pattern).toEqual('^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$')
                    expect(schema.properties!['STRING_IS_ARRAY'].regexp.flags).toEqual('i')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS'])
                        const valid = validate('(888)555-2222')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_ARGED_STRING'])
                        const valid = validate('(888)555-2222')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_ARGED_REGEXP'])
                        const valid = validate('(888)555-2222')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_IS_ARRAY'])
                        const valid = validate('(888)555-2222')
                        expect(valid).toBe(true)
                    }
                })

                it("has value that is not", function () {
                    expect(schema.properties!['STRING_NOT'].not.regexp).toBe('/^[a-z]+$/i')
                    expect(schema.properties!['STRING_NOT_STRING'].not.regexp).toBe('/^[a-z]+$/')

                    expect(schema.properties!['STRING_NOT_ARGED_STRING'].not.regexp).toEqual('/^[a-z]+$/')
                    expect(schema.properties!['STRING_NOT_ARGED_REGEXP'].not.regexp).toEqual('/^[a-z]+$/i')

                    expect(schema.properties!['STRING_NOT_ARRAY'].not.regexp.pattern).toBe('^[a-z]+$')
                    expect(schema.properties!['STRING_NOT_ARRAY'].not.regexp.flags).toBe('i')

                    {
                        const validate = ajv.compile(schema.properties!['STRING_NOT'])
                        const valid = validate('23')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_NOT_STRING'])
                        const valid = validate('23')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_NOT_ARGED_STRING'])
                        const valid = validate('23')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_NOT_ARGED_REGEXP'])
                        const valid = validate('23')
                        expect(valid).toBe(true)
                    }

                    {
                        const validate = ajv.compile(schema.properties!['STRING_NOT_ARRAY'])
                        const valid = validate('23')
                        expect(valid).toBe(true)
                    }
                })
            })
        })

        describe("Ensure OpenApiStrategy allows 'additionalProperties'", function () {
            expect(schema.additionalProperties).toEqual(true)
        })
    })
})
