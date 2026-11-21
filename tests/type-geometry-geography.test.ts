import Ajv from 'ajv'

import models from './models'
import { SchemaManager, OpenApiStrategy } from '../src'


describe('postgres hstore type OpenAPI schema', function () {
    const schemaManager = new SchemaManager
    const strategy = new OpenApiStrategy

    const schema = schemaManager.generate(models.User, strategy, {
        include: [
            'GEOMETRY',

            'GEOMETRY_POINT',
            'GEOMETRY_LINESTRING',
            'GEOMETRY_POLYGON',

            'GEOGRAPHY_POINT',
        ],
        associations: false
    })

    // validate document using ajv
    const ajv = new Ajv()

    it(`should include point geometry`, function () {
        expect(schema.properties).toHaveProperty('GEOMETRY_POINT')

        const validate = ajv.compile(schema.properties!['GEOMETRY_POINT'])

        {
            var valid = validate({
                type: 'POINT',
                coordinates: [1.1, 20.0],
                crs: { type: 'name', properties: { name: 'EPSG:4326' } }
            })
            expect(valid).toBe(true)
        }

        {
            // With elevation/altitude

            var valid = validate({ type: 'POINT', coordinates: [1.1, 20.0, 2.0] })
            expect(valid).toBe(true)
        }

        {
            // Extra past elevation

            var valid = validate({ type: 'POINT', coordinates: [1.1, 20.0, 2.0, 1.0] })
            expect(valid).toBe(false)
        }

        {
            // Its POINT. Mind the casing.

            var valid = validate({ type: 'Point', coordinates: [1.1, 20.0] })
            expect(valid).toBe(false)
        }

        {
            // Need non-empty type

            var valid = validate({
                type: 'POINT', coordinates: [1.1, 20.0],
                crs: { type: '', properties: { name: 'EPSG:4326' } }
            })
            expect(valid).toBe(false)
        }

        {
            // Need non-empty name

            var valid = validate({
                type: 'POINT', coordinates: [1.1, 20.0],
                crs: { type: 'name', properties: { name: '' } }
            })
            expect(valid).toBe(false)
        }
    })

    it(`should include linestring geometry`, function () {
        expect(schema.properties).toHaveProperty('GEOMETRY_LINESTRING')

        const validate = ajv.compile(schema.properties!['GEOMETRY_LINESTRING'])

        {
            var valid = validate({ type: 'LINESTRING', coordinates: [[200.0, 0.0], [201.0, 1.0]] })
            expect(valid).toBe(true)
        }

        {
            // With elevation/altitude

            var valid = validate({ type: 'LINESTRING', coordinates: [[200.0, 0.0, 1.0], [201.0, 1.0], [101.0, 2.0]] })
            expect(valid).toBe(true)
        }

        {
            // A line needs at least 2 points

            var valid = validate({ type: 'LINESTRING', coordinates: [[200.0, 0.0]] })
            expect(valid).toBe(false)
        }

        {
            // Its LINESTRING. Mind the casing.

            var valid = validate({ type: 'LineString', coordinates: [[200.0, 0.0], [201.0, 1.0]] })
            expect(valid).toBe(false)
        }

        {
            // Need non-empty type

            var valid = validate({
                type: 'LINESTRING', coordinates: [[200.0, 0.0], [201.0, 1.0]],
                crs: { type: '', properties: { name: 'EPSG:4326' } }
            })
            expect(valid).toBe(false)
        }

        {
            // Need non-empty name

            var valid = validate({
                type: 'LINESTRING', coordinates: [[200.0, 0.0], [201.0, 1.0]],
                crs: { type: 'name', properties: { name: '' } }
            })
            expect(valid).toBe(false)
        }
    })

    it(`should include polygon geometry`, function () {
        expect(schema.properties).toHaveProperty('GEOMETRY_POLYGON')

        const validate = ajv.compile(schema.properties!['GEOMETRY_POLYGON'])

        {
            var valid = validate({ type: 'POLYGON', coordinates: [
                [
                    [200.0, 0.0],
                    [201.0, 0.0],
                    [201.0, 1.0],
                    [200.0, 1.0],
                    [200.0, 0.0]
                ]
            ]})
            expect(valid).toBe(true)
        }

        {
            var valid = validate({ type: 'POLYGON', coordinates: [
                [
                    [200.0, 0.0, 20.0],  // With elevation/altitude
                    [201.0, 0.0],
                    [201.0, 1.0],
                    [200.0, 1.0],
                    [200.0, 0.0]
                ]
            ]})
            expect(valid).toBe(true)
        }

        {
            // Needs at least 4 points

            var valid = validate({ type: 'POLYGON', coordinates: [
                [
                    [200.0, 0.0],
                    [230.0, 3.0],
                    [210.0, 8.0],
                ]
            ]})
            expect(valid).toBe(false)
        }

        {
            // Its POLYGON. Mind the casing.

            var valid = validate({ type: 'Polygon', coordinates: [
                [
                    [200.0, 0.0],
                    [201.0, 0.0],
                    [201.0, 1.0],
                    [200.0, 1.0],
                    [200.0, 0.0]
                ]
            ]})
            expect(valid).toBe(false)
        }

        {
            // Need non-empty type

            var valid = validate({
                type: 'POLYGON',
                coordinates: [
                    [
                        [200.0, 0.0],
                        [201.0, 0.0],
                        [201.0, 1.0],
                        [200.0, 1.0],
                        [200.0, 0.0]
                    ]
                ],
                crs: { type: '', properties: { name: 'EPSG:4326' } }
            })
            expect(valid).toBe(false)
        }

        {
            // Need non-empty name

            var valid = validate({
                type: 'POLYGON',
                coordinates: [
                    [
                        [200.0, 0.0],
                        [201.0, 0.0],
                        [201.0, 1.0],
                        [200.0, 1.0],
                        [200.0, 0.0]
                    ]
                ],
                crs: { type: 'name', properties: { name: '' } }
            })
            expect(valid).toBe(false)
        }
    })

    it(`should include point geography`, function () {
        expect(schema.properties).toHaveProperty('GEOGRAPHY_POINT')

        const validate = ajv.compile(schema.properties!['GEOGRAPHY_POINT'])

        {
            var valid = validate({ type: 'POINT', coordinates: [1.1, 20.0] })
            expect(valid).toBe(true)
        }

        {
            // With elevation/altitude

            var valid = validate({ type: 'POINT', coordinates: [1.1, 20.0, 2.0] })
            expect(valid).toBe(true)
        }

        {
            // Extra past elevation

            var valid = validate({ type: 'POINT', coordinates: [1.1, 20.0, 2.0, 1.0] })
            expect(valid).toBe(false)
        }

        {
            // Its POINT. Mind the casing.

            var valid = validate({ type: 'Point', coordinates: [1.1, 20.0] })
            expect(valid).toBe(false)
        }

        {
            // Need non-empty type

            var valid = validate({
                type: 'POINT', coordinates: [1.1, 20.0],
                crs: { type: '', properties: { name: 'EPSG:4326' } }
            })
            expect(valid).toBe(false)
        }

        {
            // Need non-empty name

            var valid = validate({
                type: 'POINT', coordinates: [1.1, 20.0],
                crs: { type: 'name', properties: { name: '' } }
            })
            expect(valid).toBe(false)
        }
    })

    it(`should include geometry`, function () {
        expect(schema.properties).toHaveProperty('GEOMETRY')

        const validate = ajv.compile(schema.properties!['GEOMETRY'])

        {
            var valid = validate({ type: 'POINT', coordinates: [1.1, 20.0] })
            expect(valid).toBe(true)
        }

        {
            // Extra past elevation

            var valid = validate({ type: 'POINT', coordinates: [1.1, 20.0, 2.0, 1.0] })
            expect(valid).toBe(false)
        }

        {
            var valid = validate({ type: 'LINESTRING', coordinates: [[200.0, 0.0], [201.0, 1.0]] })
            expect(valid).toBe(true)
        }

        {
            // A line needs at least 2 points

            var valid = validate({ type: 'LINESTRING', coordinates: [[200.0, 0.0]] })
            expect(valid).toBe(false)
        }

        {
            var valid = validate({ type: 'POLYGON', coordinates: [
                [
                    [200.0, 0.0],
                    [201.0, 0.0],
                    [201.0, 1.0],
                    [200.0, 1.0],
                    [200.0, 0.0]
                ]
            ]})
            expect(valid).toBe(true)
        }

        {
            // Needs at least 4 points

            var valid = validate({ type: 'POLYGON', coordinates: [
                [
                    [200.0, 0.0],
                    [230.0, 3.0],
                    [210.0, 8.0],
                ]
            ]})
            expect(valid).toBe(false)
        }
    })
})
