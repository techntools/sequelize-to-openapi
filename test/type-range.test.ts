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

            let start: string | null = null
            let end: string | null = null

            if (typeof data[0] === 'object')
                start = data[0]!['value']

            if (typeof data[0] === 'string')
                start = data[0]

            if (typeof data[1] === 'object')
                end = data[1]!['value']

            if (typeof data[1] === 'string')
                end = data[1]

            if (start === null || end === null)
                return true

            const startDate = new Date(start)
            const endDate = new Date(end)

            return startDate < endDate
        },
        errors: true
    })

    ajv.addKeyword({
        keyword: 'range',
        type: 'array',
        validate(_: JSONType, data: JSONType | JSONType[]) {
            if (data[0] === null || data[1] === null)
                return true

            let start: string | number | null = null
            let end: string | number | null = null

            if (typeof data[0] === 'object')
                start = data[0]!['value']

            if (typeof data[0] === 'string' || typeof data[0] === 'number')
                start = data[0]

            if (typeof data[1] === 'object')
                end = data[1]!['value']

            if (typeof data[1] === 'string' || typeof data[1] === 'number')
                end = data[1]

            if (start !== null && end !== null)
                return start < end

            return data[0] < data[1]
        },
        errors: true
    })

    it(`should include integer range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_INTEGER')
        expect(schema.properties!['RANGE_INTEGER']['items']['anyOf'][1]['type']).toEqual('integer')

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

        {
            const valid = validate([1.1, 2.2])
            expect(valid).toBe(false)
        }
    })

    it(`should include integer range as objects`, function () {
        expect(schema.properties).toHaveProperty('RANGE_INTEGER')
        expect(schema.properties!['RANGE_INTEGER']['items']['anyOf'][1]['type']).toEqual('integer')

        const validate = ajv.compile(schema.properties!['RANGE_INTEGER'])

        {
            const valid = validate([
                { value: 0, inclusive: true },
                { value: 1, inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                0,
                { value: 1, inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: 0, inclusive: false },
                1,
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                null,
                { value: 1, inclusive: false },
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: 1, inclusive: false },
                null,
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: 0 },  // Missing flag
                { value: 1, inclusive: false }
            ])
            expect(valid).toBe(false)
        }
    })

    it(`should include decimal range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_DECIMAL')
        expect(schema.properties!['RANGE_DECIMAL']['items']['anyOf'][1]['type']).toEqual('number')

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

    it(`should include decimal range as objects`, function () {
        expect(schema.properties).toHaveProperty('RANGE_DECIMAL')
        expect(schema.properties!['RANGE_DECIMAL']['items']['anyOf'][1]['type']).toEqual('number')

        const validate = ajv.compile(schema.properties!['RANGE_DECIMAL'])

        {
            const valid = validate([
                { value: 0.0, inclusive: true },
                { value: 1.0, inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                1.11,
                { value: 1.2, inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: 0.11, inclusive: false },
                0.23,
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                null,
                { value: 0.2, inclusive: false },
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: 23.01, inclusive: false },
                null,
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: 22.11 },  // Missing flag
                { value: 45, inclusive: false }
            ])
            expect(valid).toBe(false)
        }
    })

    it(`should include big integer range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_BIGINT')
        expect(schema.properties!['RANGE_BIGINT']['items']['anyOf'][1]['type']).toEqual('string')

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

    it(`should include big integer range as objects`, function () {
        expect(schema.properties).toHaveProperty('RANGE_BIGINT')
        expect(schema.properties!['RANGE_BIGINT']['items']['anyOf'][1]['type']).toEqual('string')

        const validate = ajv.compile(schema.properties!['RANGE_BIGINT'])

        {
            const valid = validate([
                { value: '0', inclusive: true },
                { value: '1', inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                '0',
                { value: '1', inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: '0', inclusive: false },
                '1',
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                null,
                { value: '1', inclusive: false },
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: '1', inclusive: false },
                null,
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: '0' },  // Missing flag
                { value: '1', inclusive: false }
            ])
            expect(valid).toBe(false)
        }
    })

    it(`should include date time range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_DATE')
        expect(schema.properties!['RANGE_DATE']['items']['anyOf'][1]['type']).toEqual('string')
        expect(schema.properties!['RANGE_DATE']['items']['anyOf'][1]['format']).toEqual('date-time')

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

    it(`should include date time range as objects`, function () {
        expect(schema.properties).toHaveProperty('RANGE_DATE')
        expect(schema.properties!['RANGE_DATE']['items']['anyOf'][1]['type']).toEqual('string')
        expect(schema.properties!['RANGE_DATE']['items']['anyOf'][1]['format']).toEqual('date-time')

        const validate = ajv.compile(schema.properties!['RANGE_DATE'])

        {
            const valid = validate([
                { value: '2025-05-01T00:01:00.000Z', inclusive: true },
                { value: '2026-05-01T00:00:00.000Z', inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                '2025-05-01T00:01:00.000Z',
                { value: '2026-05-01T00:00:00.000Z', inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: '2025-05-01T00:01:00.000Z', inclusive: false },
                '2026-05-01T00:00:00.000Z',
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                null,
                { value: '2026-05-01T00:00:00.000Z', inclusive: false },
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: '2026-05-01T00:00:00.000Z', inclusive: false },
                null,
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: '2026-05-01T00:00:00.000Z', inclusive: true },
                { value: '2025-05-01T00:01:00.000Z', inclusive: false }
            ])
            expect(valid).toBe(false)
        }

        {
            const valid = validate([
                { value: '2025-05-01T00:01:00.000Z' },  // Missing flag
                { value: '2026-05-01T00:00:00.000Z', inclusive: false }
            ])
            expect(valid).toBe(false)
        }
    })

    it(`should include date range`, function () {
        expect(schema.properties).toHaveProperty('RANGE_DATEONLY')
        expect(schema.properties!['RANGE_DATEONLY']['items']['anyOf'][1]['type']).toEqual('string')
        expect(schema.properties!['RANGE_DATEONLY']['items']['anyOf'][1]['format']).toEqual('date')

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

    it(`should include date range as objects`, function () {
        expect(schema.properties).toHaveProperty('RANGE_DATEONLY')
        expect(schema.properties!['RANGE_DATEONLY']['items']['anyOf'][1]['type']).toEqual('string')
        expect(schema.properties!['RANGE_DATEONLY']['items']['anyOf'][1]['format']).toEqual('date')

        const validate = ajv.compile(schema.properties!['RANGE_DATEONLY'])

        {
            const valid = validate([
                { value: '2025-05-01', inclusive: true },
                { value: '2026-05-01', inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                '2025-05-01',
                { value: '2026-05-01', inclusive: false }
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: '2025-05-01', inclusive: false },
                '2026-05-01',
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                null,
                { value: '2026-05-01', inclusive: false },
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: '2026-05-01', inclusive: false },
                null,
            ])
            expect(valid).toBe(true)
        }

        {
            const valid = validate([
                { value: '2026-05-01', inclusive: true },
                { value: '2025-05-01', inclusive: false }
            ])
            expect(valid).toBe(false)
        }

        {
            const valid = validate([
                { value: '2025-05-01' },  // Missing flag
                { value: '2026-05-01', inclusive: false }
            ])
            expect(valid).toBe(false)
        }
    })
})
