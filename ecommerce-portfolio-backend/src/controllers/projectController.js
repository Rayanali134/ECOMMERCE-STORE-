const { Op } = require("sequelize");
const Project = require("../models/Project");

const {
    asyncHandler,
    getPagination,
    paginationResponse,
    pickAllowedFields,
} = require("../utils/controllerHelpers");

const FIELDS = [
    "title",
    "slug",
    "subtitle",
    "description",
    "shortDescription",
    "category",
    "industry",
    "clientName",
    "clientWebsite",
    "image",
    "gallery",
    "technologies",
    "features",
    "challenges",
    "solution",
    "results",
    "role",
    "teamSize",
    "projectStatus",
    "startDate",
    "completionDate",
    "liveDemo",
    "github",
    "featured",
    "published",
    "sortOrder",
    "seoTitle",
    "seoDescription",
];

const createProject = asyncHandler(async (req, res) => {
    const data = pickAllowedFields(req.body, FIELDS);

    if (!data.title?.trim() || !data.slug?.trim() ||
        !data.description?.trim() || !data.category?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Title, slug, description and category are required",
        });
    }

    data.slug = data.slug.trim().toLowerCase();

    const project = await Project.create(data);

    return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project,
        project,
    });
});

const getPublicProjects = asyncHandler(async (req, res) => {
    const where = { published: true };

    if (req.query.category && req.query.category !== "All") {
        where.category = req.query.category;
    }

    if (req.query.featured === "true") {
        where.featured = true;
    }

    const projects = await Project.findAll({
        where,
        order: [
            ["sortOrder", "ASC"],
            ["createdAt", "DESC"],
        ],
    });

    return res.json({ success: true, data: projects, projects });
});

const getAllProjects = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};

    if (req.query.category && req.query.category !== "All") {
        where.category = req.query.category;
    }

    if (req.query.status) {
        where.projectStatus = req.query.status;
    }

    if (req.query.published !== undefined) {
        where.published = req.query.published === "true";
    }

    if (req.query.search) {
        where[Op.or] = [
            { title: { [Op.like]: `%${req.query.search}%` } },
            { category: { [Op.like]: `%${req.query.search}%` } },
            { clientName: { [Op.like]: `%${req.query.search}%` } },
        ];
    }

    const { rows, count } = await Project.findAndCountAll({
        where,
        limit,
        offset,
        order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });

    return res.json(paginationResponse(rows, count, page, limit));
});

const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    return res.json({ success: true, data: project, project });
});

const getProjectBySlug = asyncHandler(async (req, res) => {
    const project = await Project.findOne({
        where: {
            slug: req.params.slug,
            published: true,
        },
    });

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    return res.json({ success: true, data: project, project });
});

const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    const data = pickAllowedFields(req.body, FIELDS);

    if (data.slug) {
        data.slug = data.slug.trim().toLowerCase();
    }

    await project.update(data);

    return res.json({
        success: true,
        message: "Project updated successfully",
        data: project,
        project,
    });
});

const toggleProjectStatus = asyncHandler(async (req, res) => {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    project.published = !project.published;
    await project.save();

    return res.json({
        success: true,
        message: `Project ${project.published ? "published" : "unpublished"} successfully`,
        data: project,
        project,
    });
});

const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found",
        });
    }

    await project.destroy();

    return res.json({
        success: true,
        message: "Project deleted successfully",
    });
});

module.exports = {
    createProject,
    getPublicProjects,
    getAllProjects,
    getProjectById,
    getProjectBySlug,
    updateProject,
    toggleProjectStatus,
    deleteProject,
};
