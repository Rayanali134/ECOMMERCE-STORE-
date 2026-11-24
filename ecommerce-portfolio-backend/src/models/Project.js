const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Project = sequelize.define(
    "Project",
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
            allowNull: false,
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

        shortDescription: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        category: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        industry: {
            type: DataTypes.STRING(150),
            allowNull: true,
            defaultValue: "",
        },

        clientName: {
            type: DataTypes.STRING(200),
            allowNull: true,
            defaultValue: "",
        },

        clientWebsite: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        image: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        gallery: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },

        technologies: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },

        features: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },

        challenges: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        solution: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        results: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },

        role: {
            type: DataTypes.STRING(200),
            allowNull: true,
            defaultValue: "",
        },

        teamSize: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },

        projectStatus: {
            type: DataTypes.ENUM(
                "planning",
                "in_progress",
                "completed",
                "maintenance"
            ),
            allowNull: false,
            defaultValue: "completed",
        },

        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        completionDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        liveDemo: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        github: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: "",
        },

        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        published: {
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
        tableName: "projects",
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["category"] },
            { fields: ["project_status"] },
            { fields: ["featured"] },
            { fields: ["published"] },
            { fields: ["sort_order"] },
        ],
    }
);

module.exports = Project;