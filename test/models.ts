import { Sequelize, DataTypes, type ModelAttributeColumnOptions } from 'sequelize'

import { supportedDataType } from './utils/supported-datatype'

const sequelize = new Sequelize({ dialect: 'mysql' })

/**
 * Sequelize attribute definitions for the `user` model.
 *
 * This model should contain attribute definitions for all known DataTypes.
 * Please note that an attribute definitions will only be included in the
 * model if the tested Sequelize version supports the DataType.
 *
 * @see https://sequelize.org/master/manual/data-types.html
 */
const User = (function () {
    // --------------------------------------------------------------------------
    // Define ALL Sequelize DataTypes below, including their variations. Only
    // added to the model if supported by this sequelize version.
    // --------------------------------------------------------------------------

    let attributes: { [key: string]: ModelAttributeColumnOptions } = {}

    if (supportedDataType('ARRAY')) {
        attributes = {
            ARRAY_INTEGERS: {
                type: DataTypes.ARRAY(DataTypes.INTEGER),
                allowNull: false,
            },

            ARRAY_TEXTS: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
                allowNull: false,
            },

            ARRAY_ALLOWNULL_EXPLICIT: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
                allowNull: true,
            },

            ARRAY_ALLOWNULL_IMPLICIT: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
            },

            ARRAY_ENUM_STRINGS: {
                type: DataTypes.ARRAY(DataTypes.ENUM('hello', 'world')),
                allowNull: false,
            }
        }
    }

    if (supportedDataType('BLOB')) {
        attributes = {
            ...attributes,
            BLOB: {
                type: DataTypes.BLOB,
                allowNull: false,
            }
        }
    }

    if (supportedDataType('CITEXT')) {
        attributes = {
            ...attributes,
            CITEXT: {
                type: DataTypes.CITEXT,
                allowNull: false,
            }
        }
    }

    if (supportedDataType('INTEGER')) {
        attributes = {
            ...attributes,

            INTEGER: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    min: 0,
                    max: 10
                }
            },
            INTEGER_ARGED: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    min: { args: [0], msg: '' },
                    max: { args: [10], msg: '' }
                }
            }
        }
    }

    if (supportedDataType('STRING')) {
        attributes = {
            ...attributes,

            STRING: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Default value for STRING',
            },

            STRING_EMAIL: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isEmail: true
                }
            },

            STRING_EMAIL_ARGED: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isEmail: { msg: 'must be email' }
                }
            },

            STRING_LENGTH_RANGE: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [2, 10],
                }
            },

            STRING_LENGTH_RANGE_ARGED: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: { args: [2, 10], msg: '' },
                }
            },

            STRING_NOT_EMPTY: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                }
            },

            STRING_NOT_EMPTY_ARGED: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: { msg: 'must not be empty' },
                }
            },

            STRING_IS_URL: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isUrl: true,
                }
            },

            STRING_IS_URL_ARGED: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isUrl: { msg: 'must be url' },
                }
            },

            STRING_IS_ALPHA: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isAlpha: true,
                }
            },

            STRING_IS_NUMERIC: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isNumeric: true,
                }
            },

            STRING_IS_LOWERCASE: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isLowercase: true,
                }
            },

            STRING_IS_UPPERCASE: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isUppercase: true,
                }
            },

            STRING_IS_ALPHANUMERIC: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isAlphanumeric: true,
                }
            },

            STRING_HAS_SUBSTRING: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    contains: 'foo',
                }
            },

            STRING_HAS_NO_SUBSTRING: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notContains: 'bar',
                }
            },

            STRING_HAS_NO_SUBSTRING_ARGED_ARRAY: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notContains: { args: ['foo', 'bar'], msg: '' }
                }
            },

            STRING_HAS_NO_SUBSTRING_ARGED_NON_ARRAY: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notContains: { args: 'bar', msg: '' }
                }
            },

            STRING_NOT_IN: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notIn: [['mongoose']],
                }
            },

            STRING_NOT_IN_ARGED: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notIn: { args: [['mongoose'], ['lion']], msg: '' },
                }
            },

            STRING_IS: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    is: /^(\([0-9]{3}\))?[0-9]{3}-[0-9]{4}$/
                }
            },

            STRING_IS_STRING: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    is: '^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$'
                }
            },

            STRING_NOT: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    not: /^[a-z]+$/i
                }
            },

            STRING_NOT_STRING: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    not: '^[a-z]+$'
                }
            },

            STRING_ALLOWNULL_EXPLICIT: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            STRING_ALLOWNULL_IMPLICIT: {
                type: DataTypes.STRING,
            },

            STRING_1234: {
                type: DataTypes.STRING(1234),
                allowNull: false,
            },
        }
    }

    attributes = {
        ...attributes,

        STRING_IS_ARGED_STRING: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: '^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$',
                    msg: 'should match'
                }
            }
        },

        STRING_IS_ARGED_REGEXP: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: /^(\([0-9]{3}\))?[0-9]{3}-[0-9]{4}$/,
                    msg: 'should match'
                }
            }
        },

        STRING_IS_ARRAY: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: ["^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$", "i"],
            }
        },

        STRING_NOT_ARGED_STRING: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                not: {
                    args: '^[a-z]+$',
                    msg: 'should not match'
                }
            }
        },

        STRING_NOT_ARGED_REGEXP: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                not: {
                    args: /^[a-z]+$/i,
                    msg: 'should not match'
                }
            }
        },

        STRING_NOT_ARRAY: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                not: ['^[a-z]+$', 'i']
            }
        },
    }

    if (supportedDataType('TEXT')) {
        attributes = {
            ...attributes,
            TEXT: {
                type: DataTypes.TEXT,
                allowNull: false,
            }
        }
    }

    if (supportedDataType('UUIDV4')) {
        attributes = {
            ...attributes,
            UUIDV4: {
                type: DataTypes.UUID,
                allowNull: false,
            }
        }
    }

    if (supportedDataType('JSON')) {
        const JSON = {
            type: DataTypes.JSON,
            allowNull: false,
        }

        const JSON_OBJECT = {
            type: DataTypes.JSON,
            allowNull: false,
            jsonSchema: {
                schema: { type: 'object' }
            }
        }

        attributes = {
            ...attributes,
            JSON,
            JSON_OBJECT
        }
    }

    if (supportedDataType('JSONB')) {
        attributes = {
            ...attributes,
            JSONB_ALLOWNULL: {
                type: DataTypes.JSONB,
                allowNull: true,
            }
        }
    }

    if (supportedDataType('VIRTUAL')) {
        attributes = {
            ...attributes,

            VIRTUAL: {
                type: DataTypes.VIRTUAL(DataTypes.BOOLEAN),
                allowNull: false,
                get: () => true,
            },

            VIRTUAL_DEPENDENCY: {
                type: new DataTypes.VIRTUAL(DataTypes.INTEGER, ['id']),
                allowNull: false,
                get() {
                    return this.get('id')
                },
            }
        }
    }

    // --------------------------------------------------------------------------
    // Custom options (as specified through `jsonSchema`) starting below.
    // --------------------------------------------------------------------------
    {
        const CUSTOM_DESCRIPTION = {
            type: DataTypes.STRING,
            allowNull: false,
            jsonSchema: {
                description: 'Custom attribute description',
            },
        }

        const CUSTOM_EXAMPLES = {
            type: DataTypes.STRING,
            allowNull: false,
            jsonSchema: {
                examples: ['Custom example 1', 'Custom example 2'],
            },
        }

        const CUSTOM_READONLY = {
            type: DataTypes.STRING,
            allowNull: false,
            jsonSchema: {
                readOnly: true,
            },
        }

        const CUSTOM_WRITEONLY = {
            allowNull: false,
            type: DataTypes.STRING,
            jsonSchema: {
                writeOnly: true,
            },
        }

        attributes = {
            ...attributes,
            CUSTOM_DESCRIPTION,
            CUSTOM_EXAMPLES,
            CUSTOM_READONLY,
            CUSTOM_WRITEONLY
        }
    }

    if (supportedDataType('RANGE')) {
        attributes = {
            ...attributes,

            RANGE_INTEGER: {
                type: DataTypes.RANGE(DataTypes.INTEGER)
            },
            RANGE_DECIMAL: {
                type: DataTypes.RANGE(DataTypes.DECIMAL)
            },
            RANGE_BIGINT: {
                type: DataTypes.RANGE(DataTypes.BIGINT)
            },
            RANGE_DATE: {
                type: DataTypes.RANGE(DataTypes.DATE)
            },
            RANGE_DATEONLY: {
                type: DataTypes.RANGE(DataTypes.DATEONLY)
            },
        }
    }

    if (supportedDataType('HSTORE')) {
        attributes = {
            ...attributes,

            HSTORE: {
                type: DataTypes.HSTORE
            }
        }
    }

    const Model = sequelize.define(
        'user',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            ...attributes
        },
        // sequelize options
        {
            timestamps: true,
            underscored: false,
        },
    )

    return Model
})()

// Sequelize model definition for testing User hasOne.
const Profile = sequelize.define(
    'profile',
    {
        name: {
            type: DataTypes.STRING,
        },
    },
    {
        timestamps: false,
        underscored: false,
    },
)

// Sequelize model definition for testing User belongsTo.
const Company = sequelize.define(
    'company',
    {
        name: {
            type: DataTypes.STRING,
        },
    },
    {
        timestamps: false,
        underscored: false,
    },
)

// Sequelize model definition for testing User hasMany.
const Document = sequelize.define(
    'document',
    {
        name: {
            type: DataTypes.STRING,
        },
    },
    {
        timestamps: false,
        underscored: false,
    },
)

const Group = sequelize.define(
    'group',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }
)

const UserGroup = sequelize.define(
    'usergroup',
    {}
)

// Sequelize model definition for testing User belongsToMany.
const Friendship = sequelize.define(
    'friendship',
    {
        isBestFriend: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        timestamps: false,
        underscored: false,
    },
)

// Associations. By default, the Sequelize association is considered optional.
User.hasOne(Profile, { foreignKey: { allowNull: false } })
User.belongsTo(Company, { foreignKey: { allowNull: false } })
User.hasMany(Document, { foreignKey: { allowNull: false } })

User.hasOne(User, { as: 'boss', foreignKey: { allowNull: false } })

// 'as' must be defined for many-to-many self-associations
User.belongsToMany(User, {
    as: 'friends',
    through: Friendship,
    otherKey: {
        name: 'friendId',
        allowNull: false
    },
    foreignKey: { allowNull: false, name: 'userId' }
})

User.belongsToMany(Group, {
    through: UserGroup,
    otherKey: {
        name: 'groupId',
        allowNull: false
    },
    foreignKey: { allowNull: false, name: 'userId' }
})

/**
 * Everything is accessible via a single object. Does not require an active
 * database connection.
 */
export default {
    sequelize,
    Sequelize,

    User,
    Profile,
    Company,
    Document,
    Friendship,
    Group,
    UserGroup,
}
