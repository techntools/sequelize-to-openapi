import Ajv from 'ajv'

import models from './models'
import { SchemaManager, OpenApiStrategy } from '../src'


describe('postgres hstore type OpenAPI schema', function () {
    const schemaManager = new SchemaManager
    const strategy = new OpenApiStrategy

    const schema = schemaManager.generate(models.User, strategy, {
        include: [
            'HSTORE',
        ],
        associations: false
    })

    // validate document using ajv
    const ajv = new Ajv()

    it(`should include hstore`, function () {
        expect(schema.properties).toHaveProperty('HSTORE')
        expect(schema.properties!['HSTORE']['type']).toEqual('object')

        const validate = ajv.compile(schema.properties!['HSTORE'])

        {
            /*
             * HSTORE keys are string only and values are string/null
             */

            var valid = validate({ k: 'val' })
            expect(valid).toBe(true)

            var valid = validate({ k: null })
            expect(valid).toBe(true)
        }

        {
            const valid = validate({ k: 1 })
            expect(valid).toBe(false)
        }
    })
})
