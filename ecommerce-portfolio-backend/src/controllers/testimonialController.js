const { Op } = require("sequelize");
const Testimonial = require("../models/Testimonial");

const {
    asyncHandler,
    getPagination,
    paginationResponse,
    pickAllowedFields,
} = require("../utils/controllerHelpers");

const FIELDS = [
    "name",
    "role",
    "company",
    "email",
    "image",
    "message",
    "rating",
    "projectName",
    "projectUrl",
    "clientWebsite",
    "verified",
    "approved",
    "featured",
    "sortOrder",
    "publishedAt",
];

const createTestimonial = asyncHandler(async (req, res) => {
    const data = pickAllowedFields(req.body, [
        "name",
        "role",
        "company",
        "email",
        "image",
        "message",
        "rating",
        "projectName",
        "projectUrl",
        "clientWebsite",
    ]);

    if (!data.name?.trim() || !data.message?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Name and message are required",
        });
    }

    // Public submissions cannot approve or feature themselves.
    data.approved = false;
    data.verified = false;
    data.featured = false;

    const testimonial = await Testimonial.create(data);

    return res.status(201).json({
        success: true,
        message: "Testimonial submitted for review",
        data: testimonial,
    });
});

const getPublicTestimonials = asyncHandler(async (req, res) => {
    const where = { approved: true };

    if (req.query.featured === "true") {
        where.featured = true;
    }

    const testimonials = await Testimonial.findAll({
        where,
        order: [
            ["sortOrder", "ASC"],
            ["createdAt", "DESC"],
        ],
    });

    return res.json({
        success: true,
        data: testimonials,
    });
});

const getAllTestimonials = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};

    if (req.query.approved !== undefined) {
        where.approved = req.query.approved === "true";
    }

    if (req.query.featured !== undefined) {
        where.featured = req.query.featured === "true";
    }

    if (req.query.rating !== undefined) {
        const rating = Number(req.query.rating);

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        where.rating = rating;
    }

    if (req.query.search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${req.query.search}%` } },
            { company: { [Op.like]: `%${req.query.search}%` } },
            { projectName: { [Op.like]: `%${req.query.search}%` } },
        ];
    }

    const { rows, count } = await Testimonial.findAndCountAll({
        where,
        limit,
        offset,
        order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });

    return res.json(paginationResponse(rows, count, page, limit));
});

const getTestimonialById = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
        return res.status(404).json({
            success: false,
            message: "Testimonial not found",
        });
    }

    return res.json({ success: true, data: testimonial });
});

const updateTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
        return res.status(404).json({
            success: false,
            message: "Testimonial not found",
        });
    }

    const data = pickAllowedFields(req.body, FIELDS);

    if (data.rating !== undefined) {
        const rating = Number(data.rating);

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }
    }

    if (data.approved === true && !testimonial.approved) {
        data.publishedAt = new Date();
    }

    if (data.approved === false) {
        data.publishedAt = null;
    }

    await testimonial.update(data);

    return res.json({
        success: true,
        message: "Testimonial updated successfully",
        data: testimonial,
    });
});

const toggleTestimonialStatus = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
        return res.status(404).json({
            success: false,
            message: "Testimonial not found",
        });
    }

    testimonial.approved = !testimonial.approved;
    testimonial.publishedAt = testimonial.approved ? new Date() : null;
    await testimonial.save();

    return res.json({
        success: true,
        message: `Testimonial ${testimonial.approved ? "approved" : "unapproved"} successfully`,
        data: testimonial,
    });
});

const deleteTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
        return res.status(404).json({
            success: false,
            message: "Testimonial not found",
        });
    }

    await testimonial.destroy();

    return res.json({
        success: true,
        message: "Testimonial deleted successfully",
    });
});

module.exports = {
    createTestimonial,
    getPublicTestimonials,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    toggleTestimonialStatus,
    deleteTestimonial,
};
