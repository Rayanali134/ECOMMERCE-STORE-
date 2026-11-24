const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Service = sequelize.define(
    "Service",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        slug: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        },

        shortDescription: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        category: {
            type: DataTypes.STRING(150),
            allowNull: true,
            defaultValue: "development",
        },

        icon: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "bi-code-slash",
        },

        image: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        features: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },

        technologies: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },

        price: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
        },

        startingPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },

        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "USD",
        },

        deliveryDays: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },

        featured: {
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
        tableName: "services",
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["category"] },
            { fields: ["active"] },
            { fields: ["featured"] },
            { fields: ["sort_order"] },
        ],
    }
);

module.exports = Service;