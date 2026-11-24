const { UniqueConstraintError, ValidationError } = require("sequelize");

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const sendError = (res, error) => {
    if (error instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.errors.map((item) => item.message),
        });
    }

    if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
            success: false,
            message: "This value already exists",
        });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};

const getPagination = (query) => {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);

    const requestedLimit = Number.parseInt(query.limit, 10) || 10;

    const limit = Math.min(100, Math.max(1, requestedLimit));

    return {
        page,
        limit,
        offset: (page - 1) * limit,
    };
};

const paginationResponse = (data, count, page, limit) => ({
    success: true,
    data,
    pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
    },
});

const pickAllowedFields = (body, allowedFields) => {
    const result = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            result[field] = body[field];
        }
    }

    return result;
};

module.exports = {
    asyncHandler,
    sendError,
    getPagination,
    paginationResponse,
    pickAllowedFields,
};