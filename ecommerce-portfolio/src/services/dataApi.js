// FIX #15: Consistent API file pattern — projects, packages, testimonials,
// inquiries and messages now each have their own dedicated API module,
// matching the existing serviceApi.js pattern.

import api from "./api";

// ── Projects ─────────────────────────────────────────────────────────────

export const getProjects = (params = {}) =>
  api.get("/projects", { params });

export const getProjectById = (id) =>
  api.get(`/projects/${id}`);

export const createProject = (data) =>
  api.post("/projects", data);

export const updateProject = (id, data) =>
  api.put(`/projects/${id}`, data);

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`);

export const toggleProjectStatus = (id) =>
  api.patch(`/projects/${id}/status`);

// ── Packages ─────────────────────────────────────────────────────────────

export const getPackages = (params = {}) =>
  api.get("/packages", { params });

export const getPackageById = (id) =>
  api.get(`/packages/${id}`);

export const createPackage = (data) =>
  api.post("/packages", data);

export const updatePackage = (id, data) =>
  api.put(`/packages/${id}`, data);

export const deletePackage = (id) =>
  api.delete(`/packages/${id}`);

export const togglePackageStatus = (id) =>
  api.patch(`/packages/${id}/status`);

// ── Testimonials ─────────────────────────────────────────────────────────

export const getTestimonials = (params = {}) =>
  api.get("/testimonials", { params });

export const getTestimonialById = (id) =>
  api.get(`/testimonials/${id}`);

export const createTestimonial = (data) =>
  api.post("/testimonials", data);

export const updateTestimonial = (id, data) =>
  api.put(`/testimonials/${id}`, data);

export const deleteTestimonial = (id) =>
  api.delete(`/testimonials/${id}`);

export const toggleTestimonialStatus = (id) =>
  api.patch(`/testimonials/${id}/status`);

// ── Inquiries ─────────────────────────────────────────────────────────────

export const getInquiries = (params = {}) =>
  api.get("/inquiries", { params });

export const getInquiryById = (id) =>
  api.get(`/inquiries/${id}`);

export const updateInquiry = (id, data) =>
  api.put(`/inquiries/${id}`, data);

export const deleteInquiry = (id) =>
  api.delete(`/inquiries/${id}`);

export const markInquiryRead = (id) =>
  api.patch(`/inquiries/${id}/read`);

// ── Messages ──────────────────────────────────────────────────────────────

export const getMessages = (params = {}) =>
  api.get("/messages", { params });

export const getMessageById = (id) =>
  api.get(`/messages/${id}`);

export const deleteMessage = (id) =>
  api.delete(`/messages/${id}`);

export const markMessageRead = (id) =>
  api.patch(`/messages/${id}/read`);

// ── Store Products ────────────────────────────────────────────────────────
export const fetchStoreProducts = (params = {}) =>
  api.get("/products", { params });

export const fetchStoreProduct = (idOrSlug) =>
  api.get(`/products/${idOrSlug}`);

export const addStoreProduct = (data) =>
  api.post("/products", data);

export const updateStoreProduct = (id, data) =>
  api.put(`/products/${id}`, data);

export const removeStoreProduct = (id) =>
  api.delete(`/products/${id}`);

export const toggleStoreProductStatus = (id) =>
  api.patch(`/products/${id}/status`);

// ── Store Categories ──────────────────────────────────────────────────────
export const fetchStoreCategories = () =>
  api.get("/categories");

export const addStoreCategory = (data) =>
  api.post("/categories", data);

// ── Store Orders ──────────────────────────────────────────────────────────
export const placeStoreOrder = (orderData) =>
  api.post("/orders", orderData);

export const fetchAllOrders = (params = {}) =>
  api.get("/orders", { params });

export const fetchOrderDetails = (idOrNumber) =>
  api.get(`/orders/${idOrNumber}`);

export const updateOrderStatus = (id, data) =>
  api.patch(`/orders/${id}/status`, data);

// ── Store Settings & Policies ─────────────────────────────────────────────
export const fetchStoreSettings = () =>
  api.get("/settings");

export const updateStoreSettings = (data) =>
  api.put("/settings", data);
