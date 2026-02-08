import type { JSONType } from 'ajv'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import models from './models'
import { SchemaManager, OpenApiStrategy } from '../src'


describe('postgres range type OpenAPI schema', function () {
    const schemaManager = new SchemaManager
    const strategy = new OpenApiStrategy

    const schema = schemaManager.generate(models.User, strategy, {
        include: [
            'RANGE_INTEGER',
            'RANGE_DECIMAL',
            'RANGE_BIGINT',
            'RANGE_DATE',
            'RANGE_DATEONLY',
        ],
        associations: false
    })

    // validate document using ajv
    const ajv = new Ajv()
    addFormats(ajv)

    ajv.addKeyword({
        keyword: 'daterange',
        type: 'array',
        validate(_: JSONType, data: JSONType) {
            if (data[0] === null || data[1] === null)
                return true

            const start = new Date(data[0])
            const end = new Date(data[1])

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
                return true  // Handle format errors elsewhere

            return start < end
        },
        errors: true
    })

    ajv.addKeyword({
        keyword: 'range',
        type: 'array',
        validate(_: JSONType, data: JSONType) {
            if (data[0] === null || data[1] === null)
                return true

            return data[0] < data[1]
        },
        errors: true
    })

    it(`should include integer range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_INTEGER')
        expect(schema.properties!['RANGE_INTEGER']['items']['type']).toEqual('integer')

        const validate = ajv.compile(schema.properties!['RANGE_INTEGER'])

        {
            const valid = validate([0, 1])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([null, 1])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([])
            expect(valid).toBe(false)
        }

        {
            const valid = validate([1])
            expect(valid).toBe(false)
        }

        {
            const valid = validate([1, 0])
            expect(valid).toBe(false)
        }
    })

    it(`should include decimal range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_DECIMAL')
        expect(schema.properties!['RANGE_DECIMAL']['items']['type']).toEqual('number')

        const validate = ajv.compile(schema.properties!['RANGE_DECIMAL'])

        {
            const valid = validate([1, 2.3])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([1, null])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([1])
            expect(valid).toBe(false)
        }

        {
            const valid = validate([1.1, 0])
            expect(valid).toBe(false)
        }
    })

    it(`should include big integer range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_BIGINT')
        expect(schema.properties!['RANGE_BIGINT']['items']['type']).toEqual('string')

        const validate = ajv.compile(schema.properties!['RANGE_BIGINT'])

        {
            const valid = validate(['18446744073709551616', '28446744073709551616'])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([null, '28446744073709551616'])
            expect(valid).toBe(true)
        }

        {
            const valid = validate(['a', 'b'])
            expect(valid).toBe(false)
        }

        {
            const valid = validate([1])
            expect(valid).toBe(false)
        }

        {
            const valid = validate([1.1, 0])
            expect(valid).toBe(false)
        }
    })

    it(`should include date time range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_DATE')
        expect(schema.properties!['RANGE_DATE']['items']['type']).toEqual('string')
        expect(schema.properties!['RANGE_DATE']['items']['format']).toEqual('date-time')

        const validate = ajv.compile(schema.properties!['RANGE_DATE'])

        {
            const valid = validate(['2025-05-01T00:01:00.000Z', '2026-05-01T00:00:00.000Z'])
            expect(valid).toBe(true)
        }

        {
            const valid = validate(['2025-05-01T00:01:00.000Z', null])
            expect(valid).toBe(true)
        }

        {
            const valid = validate(['2026-05-01T00:00:00.000Z', '2025-05-01T00:00:00.000Z'])
            expect(valid).toBe(false)
        }
    })

    it(`should include date range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_DATEONLY')
        expect(schema.properties!['RANGE_DATEONLY']['items']['type']).toEqual('string')
        expect(schema.properties!['RANGE_DATEONLY']['items']['format']).toEqual('date')

        const validate = ajv.compile(schema.properties!['RANGE_DATEONLY'])

        {
            const valid = validate(['2025-05-01', '2026-05-01'])
            expect(valid).toBe(true)
        }

        {
            const valid = validate(['2026-05-01T00:00:00.000Z', '2025-05-01T00:00:00.000Z'])
            expect(valid).toBe(false)
        }

        {
            const valid = validate(['2026-05-01', '2025-05-01'])
            expect(valid).toBe(false)
        }
    })
})
