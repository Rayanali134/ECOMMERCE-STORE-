const { Op } = require("sequelize");
const Package = require("../models/Package");

const {
    asyncHandler,
    getPagination,
    paginationResponse,
    pickAllowedFields,
} = require("../utils/controllerHelpers");

const FIELDS = [
    "name",
    "slug",
    "subtitle",
    "description",
    "price",
    "numericPrice",
    "currency",
    "billingType",
    "discountPercentage",
    "features",
    "limitations",
    "deliveryDays",
    "revisions",
    "supportDays",
    "badge",
    "highlighted",
    "active",
    "sortOrder",
    "seoTitle",
    "seoDescription",
];

const createPackage = asyncHandler(async (req, res) => {
    const data = pickAllowedFields(req.body, FIELDS);

    if (!data.name?.trim() || !data.description?.trim() || !data.price) {
        return res.status(400).json({
            success: false,
            message: "Name, description and price are required",
        });
    }

    if (
        data.numericPrice != null &&
        (!Number.isFinite(Number(data.numericPrice)) ||
            Number(data.numericPrice) < 0)
    ) {
        return res.status(400).json({
            success: false,
            message: "Price must be a valid non-negative number",
        });
    }

    if (
        data.discountPercentage != null &&
        (Number(data.discountPercentage) < 0 ||
            Number(data.discountPercentage) > 100)
    ) {
        return res.status(400).json({
            success: false,
            message: "Discount must be between 0 and 100",
        });
    }

    const pkg = await Package.create(data);

    return res.status(201).json({
        success: true,
        message: "Package created successfully",
        data: pkg,
    });
});

const getPublicPackages = asyncHandler(async (req, res) => {
    const packages = await Package.findAll({
        where: { active: true },
        order: [
            ["sortOrder", "ASC"],
            ["createdAt", "DESC"],
        ],
    });

    return res.json({ success: true, data: packages });
});

const getAllPackages = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};

    if (req.query.active !== undefined) {
        if (!["true", "false"].includes(req.query.active)) {
            return res.status(400).json({
                success: false,
                message: "Invalid active filter",
            });
        }

        where.active = req.query.active === "true";
    }

    if (req.query.search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${req.query.search}%` } },
            { slug: { [Op.like]: `%${req.query.search}%` } },
        ];
    }

    const { rows, count } = await Package.findAndCountAll({
        where,
        limit,
        offset,
        order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });

    return res.json(paginationResponse(rows, count, page, limit));
});

const getPackageById = asyncHandler(async (req, res) => {
    const pkg = await Package.findByPk(req.params.id);

    if (!pkg) {
        return res.status(404).json({
            success: false,
            message: "Package not found",
        });
    }

    return res.json({ success: true, data: pkg });
});

const updatePackage = asyncHandler(async (req, res) => {
    const pkg = await Package.findByPk(req.params.id);

    if (!pkg) {
        return res.status(404).json({
            success: false,
            message: "Package not found",
        });
    }

    const data = pickAllowedFields(req.body, FIELDS);

    if (
        data.discountPercentage != null &&
        (Number(data.discountPercentage) < 0 ||
            Number(data.discountPercentage) > 100)
    ) {
        return res.status(400).json({
            success: false,
            message: "Discount must be between 0 and 100",
        });
    }

    await pkg.update(data);

    return res.json({
        success: true,
        message: "Package updated successfully",
        data: pkg,
    });
});

const togglePackageStatus = asyncHandler(async (req, res) => {
    const pkg = await Package.findByPk(req.params.id);

    if (!pkg) {
        return res.status(404).json({
            success: false,
            message: "Package not found",
        });
    }

    pkg.active = !pkg.active;
    await pkg.save();

    return res.json({
        success: true,
        message: `Package ${pkg.active ? "activated" : "deactivated"} successfully`,
        data: pkg,
    });
});

const deletePackage = asyncHandler(async (req, res) => {
    const pkg = await Package.findByPk(req.params.id);

    if (!pkg) {
        return res.status(404).json({
            success: false,
            message: "Package not found",
        });
    }

    await pkg.destroy();

    return res.json({
        success: true,
        message: "Package deleted successfully",
    });
});

module.exports = {
    createPackage,
    getPublicPackages,
    getAllPackages,
    getPackageById,
    updatePackage,
    togglePackageStatus,
    deletePackage,
};
