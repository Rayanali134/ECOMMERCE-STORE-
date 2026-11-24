const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Message = sequelize.define(
    "Message",
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

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },

        phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: "",
        },

        company: {
            type: DataTypes.STRING(200),
            allowNull: true,
            defaultValue: "",
        },

        subject: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        category: {
            type: DataTypes.ENUM(
                "general",
                "support",
                "partnership",
                "feedback",
                "other"
            ),
            allowNull: false,
            defaultValue: "general",
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        priority: {
            type: DataTypes.ENUM(
                "low",
                "normal",
                "high",
                "urgent"
            ),
            allowNull: false,
            defaultValue: "normal",
        },

        status: {
            type: DataTypes.ENUM(
                "unread",
                "read",
                "replied",
                "archived"
            ),
            allowNull: false,
            defaultValue: "unread",
        },

        source: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "website",
        },

        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },

        readAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        repliedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        archivedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        adminNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "messages",
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["email"] },
            { fields: ["status"] },
            { fields: ["category"] },
            { fields: ["created_at"] },
        ],
    }
);

module.exports = Message;