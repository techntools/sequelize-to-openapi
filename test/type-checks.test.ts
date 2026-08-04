/**
 * Please note that `valiate()` is being tested through the two methods.
 */
import { checkTypeOptional, checkTypeRequired } from '../src/utils/type-checks'
import { capitalize, pick, omit } from '../src/utils/util'


describe('input-validation', function () {
    // --------------------------------------------------------------------------
    // test checkTypeOptional()
    // --------------------------------------------------------------------------
    describe('checkTypeOptional', function () {
        it(`returns true for null values`, function () {
            expect(checkTypeOptional('name', null, 'string')).toBe(true)
        })

        it(`returns true when passed value matches type string`, function () {
            expect(checkTypeOptional('name', 'some-string', 'string')).toBe(true);
        });

        it(`returns true when passed value matches type booelan`, function () {
            expect(checkTypeOptional('name', true, 'boolean')).toBe(true);
        });

        it(`returns true when passed value matches type array`, function () {
            expect(checkTypeOptional('name', [1, 2, 3], 'array')).toBe(true);
        });

        it('throws an error for mismatching string type', function () {
            expect(() => {
                checkTypeOptional('name', 123, 'string');
            }).toThrow("Optional configuration setting 'name' not of type 'string'");
        });

        it('throws an error for mismatching boolean type', function () {
            expect(() => {
                checkTypeOptional('name', 123, 'boolean');
            }).toThrow("Optional configuration setting 'name' not of type 'boolean'");
        });

        it('throws an error for mismatching array type', function () {
            expect(() => {
                checkTypeOptional('name', 123, 'array');
            }).toThrow("Optional configuration setting 'name' not of type 'array'");
        });
    })

    // --------------------------------------------------------------------------
    // test checkTypeRequired()
    // --------------------------------------------------------------------------
    describe('checkTypeRequired', function () {
        it('throws an error if value is missing', function () {
            expect(() => {
                checkTypeRequired('name', null, 'string')
            }).toThrow("Required configuration setting 'name' is missing")
        })

        it(`returns true when passed value matches type string`, function () {
            expect(checkTypeRequired('name', 'some-string', 'string')).toBe(true);
        });

        it(`returns true when passed value matches type booelan`, function () {
            expect(checkTypeRequired('name', true, 'boolean')).toBe(true);
        });

        it(`returns true when passed value matches type array`, function () {
            expect(checkTypeRequired('name', [1, 2, 3], 'array')).toBe(true);
        });

        it('throws an error for mismatching string type', function () {
            expect(() => {
                checkTypeRequired('name', 123, 'string');
            }).toThrow("Required configuration setting 'name' not of type 'string'");
        });

        it('throws an error for mismatching boolean type', function () {
            expect(() => {
                checkTypeRequired('name', 123, 'boolean');
            }).toThrow("Required configuration setting 'name' not of type 'boolean'");
        });

        it('throws an error for mismatching array type', function () {
            expect(() => {
                checkTypeRequired('name', 123, 'array');
            }).toThrow("Required configuration setting 'name' not of type 'array'");
        });
    })
})


// --------------------------------------------------------------------------
// Generic helpers exported from src/utils/util
// --------------------------------------------------------------------------
describe('utils/util', function () {
    describe('capitalize()', function () {
        it('capitalizes the first letter of a string', function () {
            expect(capitalize('hello')).toEqual('Hello')
            expect(capitalize('world')).toEqual('World')
        })

        it('returns an empty string when given an empty string', function () {
            expect(capitalize('')).toEqual('')
        })

        it('throws when given a non-string value', function () {
            expect(() => capitalize(123 as any)).toThrow(TypeError)
            expect(() => capitalize(123 as any)).toThrow(
                "The argument for _capitalize() must be a string",
            )
        })
    })

    describe('pick()', function () {
        it('returns a subset containing the requested keys', function () {
            const source = { a: 1, b: 2, c: 3 }
            expect(pick(source, ['a', 'c'])).toEqual({ a: 1, c: 3 })
        })

        it('skips keys that are not present on the source', function () {
            const source = { a: 1, b: 2 }
            expect(pick(source, ['a', 'missing'])).toEqual({ a: 1 })
        })
    })

    describe('omit()', function () {
        it('returns an object with the listed keys removed', function () {
            const source = { a: 1, b: 2, c: 3 }
            expect(omit(source, ['b'])).toEqual({ a: 1, c: 3 })
        })

        it('removes multiple keys at once', function () {
            const source = { a: 1, b: 2, c: 3 }
            expect(omit(source, ['a', 'c'])).toEqual({ b: 2 })
        })

        it('returns an empty object when omitting every key', function () {
            const source = { a: 1, b: 2 }
            expect(omit(source, ['a', 'b'])).toEqual({})
        })
    })
})
