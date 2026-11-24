const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Package = sequelize.define(
    "Package",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        slug: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        },

        subtitle: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        price: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        numericPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },

        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "USD",
        },

        billingType: {
            type: DataTypes.ENUM(
                "one_time",
                "monthly",
                "yearly",
                "custom"
            ),
            allowNull: false,
            defaultValue: "one_time",
        },

        discountPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
        },

        features: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },

        limitations: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },

        deliveryDays: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },

        revisions: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },

        supportDays: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },

        badge: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "",
        },

        highlighted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        seoTitle: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        seoDescription: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
    },
    {
        tableName: "packages",
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["active"] },
            { fields: ["highlighted"] },
            { fields: ["sort_order"] },
        ],
    }
);

module.exports = Package;