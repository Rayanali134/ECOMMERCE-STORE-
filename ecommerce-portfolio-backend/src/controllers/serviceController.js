const { Op } = require("sequelize");
const Service = require("../models/Service");

const {
    asyncHandler,
    getPagination,
    paginationResponse,
    pickAllowedFields,
} = require("../utils/controllerHelpers");

const FIELDS = [
    "title",
    "slug",
    "shortDescription",
    "description",
    "category",
    "icon",
    "image",
    "features",
    "technologies",
    "price",
    "startingPrice",
    "currency",
    "deliveryDays",
    "featured",
    "active",
    "sortOrder",
    "seoTitle",
    "seoDescription",
];

const createService = asyncHandler(async (req, res) => {
    const data = pickAllowedFields(req.body, FIELDS);

    if (!data.title?.trim() || !data.description?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Title and description are required",
        });
    }

    const service = await Service.create(data);

    return res.status(201).json({
        success: true,
        message: "Service created successfully",
        data: service,
    });
});

const getPublicServices = asyncHandler(async (req, res) => {
    const services = await Service.findAll({
        where: { active: true },
        order: [
            ["sortOrder", "ASC"],
            ["createdAt", "DESC"],
        ],
    });

    return res.json({ success: true, data: services });
});

const getAllServices = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};

    if (req.query.active !== undefined) {
        where.active = req.query.active === "true";
    }

    if (req.query.category) {
        where.category = req.query.category;
    }

    if (req.query.search) {
        where[Op.or] = [
            { title: { [Op.like]: `%${req.query.search}%` } },
            { category: { [Op.like]: `%${req.query.search}%` } },
        ];
    }

    const { rows, count } = await Service.findAndCountAll({
        where,
        limit,
        offset,
        order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });

    return res.json(paginationResponse(rows, count, page, limit));
});

const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
        return res.status(404).json({
            success: false,
            message: "Service not found",
        });
    }

    return res.json({ success: true, data: service });
});

const getServiceBySlug = asyncHandler(async (req, res) => {
    const service = await Service.findOne({
        where: {
            slug: req.params.slug,
            active: true,
        },
    });

    if (!service) {
        return res.status(404).json({
            success: false,
            message: "Service not found",
        });
    }

    return res.json({ success: true, data: service });
});

const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
        return res.status(404).json({
            success: false,
            message: "Service not found",
        });
    }

    await service.update(pickAllowedFields(req.body, FIELDS));

    return res.json({
        success: true,
        message: "Service updated successfully",
        data: service,
    });
});

const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
        return res.status(404).json({
            success: false,
            message: "Service not found",
        });
    }

    await service.destroy();

    return res.json({
        success: true,
        message: "Service deleted successfully",
    });
});

module.exports = {
    createService,
    getPublicServices,
    getAllServices,
    getServiceById,
    getServiceBySlug,
    updateService,
    deleteService,
};