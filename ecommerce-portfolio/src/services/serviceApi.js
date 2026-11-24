import api from "./api";

// Get services with search and status filters
export const getServices = (params = {}) => {
    return api.get("/services/manage", {
        params,
    });
};

// Get one service
export const getServiceById = (id) => {
    return api.get(`/services/${id}`);
};

// Create a new service
export const createService = (data) => {
    return api.post("/services", data);
};

// Update an existing service
export const updateService = (id, data) => {
    return api.put(`/services/${id}`, data);
};

// Delete a service
export const deleteService = (id) => {
    return api.delete(`/services/${id}`);
};

// Toggle active/inactive status
export const toggleServiceStatus = (id) => {
    return api.patch(`/services/${id}/status`);
};