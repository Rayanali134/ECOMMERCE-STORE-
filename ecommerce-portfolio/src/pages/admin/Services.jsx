import { useEffect, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    RefreshCw,
    BriefcaseBusiness,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";

import {
    getServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
} from "../../services/serviceApi";

import "../admin/css/Services.css";


// Convert features into a consistent array
function normalizeFeatures(features) {
    if (Array.isArray(features)) {
        return features
            .map((feature) => {
                if (typeof feature === "string") {
                    return feature.trim();
                }

                return String(feature ?? "").trim();
            })
            .filter(Boolean);
    }

    if (typeof features === "string") {
        const value = features.trim();

        if (!value) return [];

        // Handle JSON string arrays
        try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return parsed
                    .map((feature) => String(feature).trim())
                    .filter(Boolean);
            }
        } catch {
            // Handle ordinary text below
        }

        return value
            .split(/\r?\n/)
            .map((feature) => feature.trim())
            .filter(Boolean);
    }

    return [];
}

const emptyForm = {
    name: "",
    slug: "",
    description: "",
    icon: "Code",
    featuresText: "",
    active: true,
    sortOrder: 0,
};

function makeSlug(value) {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function Services() {
    const [services, setServices] = useState([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    const [form, setForm] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [actionId, setActionId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchServices = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getServices({
                search,
                status,
            });

            setServices(response.data.services || []);
        } catch (err) {
            console.error("Fetch Services Error:", err);

            setError(
                err.response?.data?.message ||
                "Services could not be loaded."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchServices();
        }, 250);

        return () => clearTimeout(timer);
    }, [search, status]);

    const updateField = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
            ...(name === "name" && !editingId
                ? { slug: makeSlug(value) }
                : {}),
        }));
    };

    const openCreateForm = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setFormOpen(true);

        setError("");
        setSuccess("");
    };

    const openEditForm = (service) => {
        setEditingId(service.id);

        setForm({
            name: service.name || "",
            slug: service.slug || "",
            description: service.description || "",
            icon: service.icon || "Code",
            featuresText: normalizeFeatures(service.features).join("\n"),
            active: Boolean(service.active),
            sortOrder: service.sortOrder ?? 0,
        });

        setFormOpen(true);

        setError("");
        setSuccess("");
    };

    const closeForm = () => {
        if (saving) return;

        setFormOpen(false);
        setEditingId(null);
        setForm({ ...emptyForm });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!form.name.trim() || !form.description.trim()) {
            setError("Service name and description are required.");
            return;
        }

        const features = form.featuresText
            .split("\n")
            .map((feature) => feature.trim())
            .filter(Boolean);

        const payload = {
            name: form.name.trim(),
            slug: form.slug.trim() || makeSlug(form.name),
            description: form.description.trim(),
            icon: form.icon.trim() || "Code",
            features,
            active: form.active,
            sortOrder: Number(form.sortOrder) || 0,
        };

        try {
            setSaving(true);

            if (editingId) {
                await updateService(editingId, payload);
                setSuccess("Service updated successfully.");
            } else {
                await createService(payload);
                setSuccess("Service created successfully.");
            }

            setFormOpen(false);
            setEditingId(null);
            setForm({ ...emptyForm });

            await fetchServices();
        } catch (err) {
            console.error("Save Service Error:", err);

            setError(
                err.response?.data?.message ||
                "Could not save service."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (service) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${service.name}"?`
        );

        if (!confirmed) return;

        try {
            setActionId(service.id);
            setError("");
            setSuccess("");

            await deleteService(service.id);

            setSuccess("Service deleted successfully.");

            await fetchServices();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not delete service."
            );
        } finally {
            setActionId(null);
        }
    };

    const handleToggleStatus = async (service) => {
        try {
            setActionId(service.id);
            setError("");
            setSuccess("");

            await toggleServiceStatus(service.id);

            setSuccess(
                service.active
                    ? "Service deactivated successfully."
                    : "Service activated successfully."
            );

            await fetchServices();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not update service status."
            );
        } finally {
            setActionId(null);
        }
    };

    return (
        <main className="service-management">

            {/* Page Header */}

            <header className="service-page-header">

                <div className="service-page-heading">

                    <span className="service-page-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>Services Management</h1>

                    <p>
                        Create, edit and manage your portfolio services.
                    </p>

                </div>

                <button
                    type="button"
                    className="service-primary-btn"
                    onClick={openCreateForm}
                >
                    <Plus size={18} />
                    Add Service
                </button>

            </header>


            {/* Alerts */}

            {error && (
                <div className="service-alert service-alert-error">
                    <XCircle size={18} />
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div className="service-alert service-alert-success">
                    <CheckCircle2 size={18} />
                    <span>{success}</span>

                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Dismiss success"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}


            {/* Filters */}

            <section className="service-toolbar">

                <label className="service-search">

                    <Search size={18} />

                    <input
                        type="search"
                        placeholder="Search services..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                </label>

                <select
                    className="service-status-filter"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    aria-label="Filter services by status"
                >
                    <option value="all">All Services</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <button
                    type="button"
                    className="service-icon-btn"
                    onClick={fetchServices}
                    disabled={loading}
                    title="Refresh services"
                    aria-label="Refresh services"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "service-spin" : ""}
                    />
                </button>

            </section>


            {/* Services Table */}

            <section className="service-table-card">

                <div className="service-table-heading">

                    <div>
                        <h2>All Services</h2>

                        <p>
                            {services.length} services displayed
                        </p>
                    </div>

                    <BriefcaseBusiness size={22} />

                </div>

                {loading ? (
                    <div className="service-state">
                        <Loader2 className="service-spin" size={25} />
                        <p>Loading services...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div className="service-state">

                        <BriefcaseBusiness size={35} />

                        <h3>No services found</h3>

                        <p>
                            Add a new service or change your search filters.
                        </p>

                        <button
                            type="button"
                            className="service-primary-btn"
                            onClick={openCreateForm}
                        >
                            <Plus size={17} />
                            Create Service
                        </button>

                    </div>
                ) : (
                    <div className="service-table-scroll">

                        <table className="service-table">

                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Slug</th>
                                    <th>Features</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.id}>

                                        <td>
                                            <div className="service-name-cell">

                                                <div className="service-row-icon">
                                                    <BriefcaseBusiness size={19} />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {service.name}
                                                    </strong>

                                                    <p>
                                                        {service.description}
                                                    </p>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <code className="service-slug">
                                                {service.slug}
                                            </code>
                                        </td>

                                        <td>
                                            <span className="service-feature-count">
                                                {normalizeFeatures(service.features).length} features
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className={
                                                    service.active
                                                        ? "service-status-pill is-active"
                                                        : "service-status-pill is-inactive"
                                                }
                                                onClick={() =>
                                                    handleToggleStatus(service)
                                                }
                                                disabled={actionId === service.id}
                                                title="Click to toggle status"
                                            >
                                                {service.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </button>
                                        </td>

                                        <td>
                                            <div className="service-actions">

                                                <button
                                                    type="button"
                                                    className="service-action-btn edit"
                                                    onClick={() =>
                                                        openEditForm(service)
                                                    }
                                                    title="Edit service"
                                                    aria-label={`Edit ${service.name}`}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="service-action-btn delete"
                                                    onClick={() =>
                                                        handleDelete(service)
                                                    }
                                                    disabled={actionId === service.id}
                                                    title="Delete service"
                                                    aria-label={`Delete ${service.name}`}
                                                >
                                                    {actionId === service.id
                                                        ? <Loader2 size={16} className="service-spin" />
                                                        : <Trash2 size={16} />
                                                    }
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>
                )}

            </section>


            {/* Create / Edit Modal */}

            {formOpen && (
                <div
                    className="service-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeForm();
                        }
                    }}
                >
                    <section
                        className="service-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="service-modal-title"
                    >

                        <header className="service-modal-header">

                            <div>
                                <span className="service-page-eyebrow">
                                    SERVICE DETAILS
                                </span>

                                <h2 id="service-modal-title">
                                    {editingId
                                        ? "Edit Service"
                                        : "Create Service"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="service-icon-btn"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close form"
                            >
                                <X size={19} />
                            </button>

                        </header>


                        <form
                            className="service-form"
                            onSubmit={handleSubmit}
                        >

                            <label className="service-field">

                                <span>Service Name *</span>

                                <input
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={updateField}
                                    placeholder="e.g. Web Development"
                                    maxLength={255}
                                    required
                                />

                            </label>


                            <label className="service-field">

                                <span>URL Slug *</span>

                                <input
                                    name="slug"
                                    type="text"
                                    value={form.slug}
                                    onChange={updateField}
                                    placeholder="web-development"
                                    maxLength={255}
                                    required
                                />

                            </label>


                            <label className="service-field">

                                <span>Description *</span>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={updateField}
                                    placeholder="Describe what this service offers..."
                                    rows={4}
                                    required
                                />

                            </label>


                            <div className="service-form-grid">

                                <label className="service-field">

                                    <span>Icon Name</span>

                                    <input
                                        name="icon"
                                        type="text"
                                        value={form.icon}
                                        onChange={updateField}
                                        placeholder="Code"
                                        maxLength={100}
                                    />

                                </label>

                                <label className="service-field">

                                    <span>Display Order</span>

                                    <input
                                        name="sortOrder"
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={updateField}
                                        step="1"
                                    />

                                </label>

                            </div>


                            <label className="service-field">

                                <span>Features</span>

                                <textarea
                                    name="featuresText"
                                    value={form.featuresText}
                                    onChange={updateField}
                                    placeholder={
                                        "Responsive Design\nSEO Friendly\nFast Performance"
                                    }
                                    rows={4}
                                />

                                <small>
                                    Enter one feature per line.
                                </small>

                            </label>


                            <label className="service-checkbox">

                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={form.active}
                                    onChange={updateField}
                                />

                                <span>
                                    <strong>Active Service</strong>

                                    <small>
                                        Active services can appear on your public website.
                                    </small>
                                </span>

                            </label>


                            {error && (
                                <div className="service-alert service-alert-error">
                                    <XCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}


                            <footer className="service-form-actions">

                                <button
                                    type="button"
                                    className="service-secondary-btn"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="service-primary-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? <Loader2 size={17} className="service-spin" />
                                        : <CheckCircle2 size={17} />
                                    }

                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Save Changes"
                                            : "Create Service"
                                    }
                                </button>

                            </footer>

                        </form>

                    </section>
                </div>
            )}

        </main>
    );
}

export default Services;