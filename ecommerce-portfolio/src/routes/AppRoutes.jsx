import { Routes, Route, Navigate } from "react-router-dom";

// Layouts & authentication
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// Public store pages
import Home from "../pages/public/Home";
import Products from "../pages/public/Projects";
import ProductDetails from "../pages/public/ProjectDetails";
import Checkout from "../pages/public/Checkout";
import ReturnPolicy from "../pages/public/ReturnPolicy";
import TrackOrder from "../pages/public/TrackOrder";
import Contact from "../pages/public/Contact";
import NotFound from "../pages/public/NotFound";

// Admin authentication
import Login from "../pages/admin/Login";
import Register from "../pages/admin/Register";

// Admin dashboard pages
import Dashboard from "../pages/admin/Dashboard";
import AdminProjects from "../pages/admin/Projects";
import CreateProject from "../pages/admin/CreateProject";
import EditProject from "../pages/admin/EditProject";
import Orders from "../pages/admin/Orders";
import Inquiries from "../pages/admin/Inquiries";
import Messages from "../pages/admin/Messages";
import Settings from "../pages/admin/Settings";
import Testimonials from "../pages/admin/Testimonials";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Store Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/contact" element={<Contact />} />

        {/* Compatibility Aliases */}
        <Route path="/projects" element={<Navigate to="/products" replace />} />
        <Route path="/projects/:id" element={<ProductDetails />} />
        <Route path="/shop" element={<Navigate to="/products" replace />} />
        <Route path="/cart" element={<Navigate to="/checkout" replace />} />
      </Route>

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/register" element={<Register />} />

      {/* Protected Admin Panel */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Product & Store Inventory Management */}
          <Route path="products" element={<AdminProjects />} />
          <Route path="products/create" element={<CreateProject />} />
          <Route path="products/edit/:id" element={<EditProject />} />

          {/* Compatibility for legacy links */}
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/edit/:id" element={<EditProject />} />

          {/* Customer Orders, Reviews, Inquiries, Messages & Return Policies */}
          <Route path="orders" element={<Orders />} />
          <Route path="reviews" element={<Testimonials />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
