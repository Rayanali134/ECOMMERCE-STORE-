const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Testimonial = sequelize.define(
    "Testimonial",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        role: {
            type: DataTypes.STRING(150),
            allowNull: true,
            defaultValue: "",
        },

        company: {
            type: DataTypes.STRING(150),
            allowNull: true,
            defaultValue: "",
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },

        image: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        rating: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            defaultValue: 5,
            validate: {
                min: 1,
                max: 5,
            },
        },

        projectName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
        },

        projectUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        clientWebsite: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "testimonials",
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["approved"] },
            { fields: ["featured"] },
            { fields: ["rating"] },
            { fields: ["sort_order"] },
        ],
    }
);

module.exports = Testimonial;