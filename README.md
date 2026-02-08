## Sequelize To OpenAPI

Based on [sequelize-to-json-schemas](https://github.com/alt3/sequelize-to-json-schemas)

With following changes:

1. Rewrite in TypeScript
2. Added OpenAPI validations based on Sequelize validations
3. Only OpenAPI is supported.
4. Focused only on Sequelize 6

## Installation

```bash
npm install --save @techntools/sequelize-to-openapi
```

## Usage

```typescript
import { SchemaManager, OpenApiStrategy } from '@techntools/sequelize-to-openapi'

const schemaManager = new SchemaManager
const strategy = new OpenApiStrategy

oapi.schema('User', schemaManager.generate(UserModel, strategy))
```

## Configuration Options

Starting from 1.0.0, additional properties can be rejected

```typescript
const strategy = new OpenApiStrategy({ additionalProperties: false })
```

Pass (per) model options to the generate() method:

```typescript
const userSchema = schemaManager.generate(userModel, strategy, {
    exclude: ['someAttribute'],
    include: ['someAttribute'],
    associations: true,
    excludeAssociations: ['someAssociation'],
    includeAssociations: ['someAssociation'],
});
```

`title` and `description` are dropped

`jsonSchema` and `schema` works the same as sequelize-to-json-schemas

Starting from 1.0.0, associations are excluded by default

## Unsupported Types

* GEOMETRY
* ABSTRACT
* GEOGRAPHY

While sequelize-to-json-schemas throws error for these, this package simply ignores them so that you can use generated schema for rest of the types and support these types the way you see fit

## Validators

Following validators are supported:

| Sequelize | OpenAPI Keyword             |
| :-------- | :-------------------------- |
| min       | minimum                     |
| max       | maximum                     |
| len       | minLength/maxLength         |
| notEmpty  | minLength                   |
| notIn     | `{ not: { enum: [] } }`<br> |

| Sequelize | OpenAPI Format |
| :-------- | :------------- |
| isEmail   | email          |
| isUrl     | url            |
| isUUID    | uuid           |

| Sequelize      | OpenAPI Pattern                                                                             |
| :------------- | :------------------------------------------------------------------------------------------ |
| isAlpha        | `^[a-zA-Z]+$`                                                                               |
| isNumeric      | `^[0-9]+$`                                                                                  |
| isAlphanumeric | `^[a-zA-Z0-9]+$`                                                                            |
| isLowercase    | `^[a-z]+$`                                                                                  |
| isUppercase    | `^[A-Z]+$`                                                                                  |
| contains       | `^.*' + val + '.*$`                                                                         |
| notContains    | `^(?!.*' + val + ').*$`<br><br>With array:<br><br>`^(?!.*(' + val.args.join('\|') + ')).*$` |

| Sequelize                              | AJV                                                    |
| -------------------------------------- | ------------------------------------------------------ |
| `is` as string                         | `{ regexp: '' }`                                       |
| `is` as RegExp                         | `{ regexp: '' }`                                       |
| `is` as `{ args: '', msg }`            | `{ regexp: '' }`                                       |
| `is` as `{ args: RegExp, msg }`        | `{ regexp: '' }`                                       |
| `is` as `{ args: ['pat', 'f'], msg }`  | `{ regexp: { pattern: pat, flag: f }}`                 |
| `is` as array                          | `{ regexp: { pattern: val[0], flag: val[1] }}`         |
| `not` as string                        | `{ not: { regexp: '' }}`                               |
| `not` as RegExp                        | `{ not: { regexp: '' }}`                               |
| `not` as `{ args: '', msg }`           | `{ not: { regexp: '' }}`                               |
| `not` as `{ args: RegExp, msg }`       | `{ not: { regexp: '' }}`                               |
| `not` as `{ args: ['pat', 'f'], msg }` | `{ not: { regexp: { pattern: pat, flag: f }}}`         |
| `not` as array                         | `{ not: { regexp: { pattern: val[0], flag: val[1] }}}` |

## Case with regular expression

Flags such as i, g etc. are not supported in OpenAPI. Sequelize can use string or RegExp class for regex. So, to avoid these limitations, I have used `regexp` keyword from [ajv-keywords](https://github.com/ajv-validator/ajv-keywords) package for `is` and `not` validators.

This makes generated OpenAPI schema not fully compliant with the standard. But you can drop those validators if you face issues.

## Range Data Type

Postgres RANGE data type is supported for INTEGER, DECIMAL, BIGINT, DATE, and DATEONLY. Modify the schema as you see fit:

```json
{
    "uniqueItems": true,
    "minItems": 2,
    "maxItems": 2,
    "items": {
        "type": "integer"
    },
    "range": true
}

{
    "uniqueItems": true,
    "minItems": 2,
    "maxItems": 2,
    "items": {
        "type": "string",
        "format": "date"
    },
    "daterange": true
}
```

Custom ajv keywords `range` and `daterange` are optional and are used to check `start < end`.

```typescript
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
```

## HSTORE Data Type

Postgres HSTORE is supported with following schema:

```json
{
    "type": "object",
    "properties": {
        "HSTORE": {
            "type": "object",
            "nullable": true,
            "additionalProperties": {
                "type": "string",
                "nullable": true
            }
        }
    },
    "additionalProperties": false
}
```

## Demo

Check my [repo](https://github.com/techntools/sequelize-to-openapi-demo) for usage of the package. It uses sequelize-typescript.

Visit the OpenAPI documentation powered by [scalar](https://www.scalar.com/)

[express-openapi](https://github.com/wesleytodd/express-openapi) generates OpenAPI spec

## License

This project is released under [MIT LICENSE](https://github.com/techntools/sequelize-to-openapi/blob/master/LICENSE.txt)

## Contributing

1. Keep the changes small
2. Add the tests
3. Existing tests have to pass

## Credits

Full credits to the authors and contributors of [sequelize-to-json-schemas](https://github.com/alt3/sequelize-to-json-schemas) for the great work
