import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";

const PRESET_CATEGORIES = [
  "Smart Watches",
  "Audio & Headphones",
  "Electronics",
  "Fashion & Apparel",
  "Footwear",
  "Accessories",
  "Home & Living",
  "Health & Beauty",
];

export default function CreateProject() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    categoryName: "Smart Watches",
    customCategory: "",
    price: "",
    salePrice: "",
    stock: "15",
    shortDescription: "",
    description: "",
    imageUrl: "",
    sizes: "",
    colors: "",
    tags: "",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
  });

  const [specifications, setSpecifications] = useState([
    { title: "Warranty", value: "1 Year Official Warranty" },
    { title: "Delivery", value: "2-4 Business Days Nationwide" },
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.url) {
        setForm((prev) => ({ ...prev, imageUrl: response.data.url }));
      }
    } catch (err) {
      console.error("Upload Error:", err);
      setError(
        err.response?.data?.message ||
          "Could not upload image. You can also paste an image URL directly."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const addSpecRow = () => {
    setSpecifications([...specifications, { title: "", value: "" }]);
  };

  const updateSpecRow = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecRow = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanTitle = form.title.trim();
    const cleanPrice = Number(String(form.price).replace(/[^0-9.]/g, ""));

    if (!cleanTitle || isNaN(cleanPrice) || cleanPrice <= 0) {
      setError("Please provide a valid product title and price.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const effectiveCategory =
        form.categoryName === "Other" && form.customCategory.trim()
          ? form.customCategory.trim()
          : form.categoryName || "Smart Watches";

      const cleanSalePrice = form.salePrice
        ? Number(String(form.salePrice).replace(/[^0-9.]/g, ""))
        : null;

      const cleanStock = Number(String(form.stock || 15).replace(/[^0-9]/g, "")) || 10;
      const cleanShortDesc = form.shortDescription.trim() || cleanTitle;
      const cleanDesc = form.description.trim() || cleanShortDesc;

      // Build variants array
      const variants = [];
      if (form.sizes.trim()) {
        variants.push({
          name: "Size",
          options: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        });
      }
      if (form.colors.trim()) {
        variants.push({
          name: "Color",
          options: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
        });
      }

      // Build specifications array
      const validSpecs = specifications.filter(
        (s) => s.title.trim() && s.value.trim()
      );

      // Build tags
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const effectiveImage = form.imageUrl.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80";

      const payload = {
        title: cleanTitle,
        categoryName: effectiveCategory,
        price: cleanPrice,
        salePrice: cleanSalePrice && cleanSalePrice > 0 ? cleanSalePrice : cleanPrice,
        stock: cleanStock,
        shortDescription: cleanShortDesc,
        description: cleanDesc,
        imageUrl: effectiveImage,
        images: [effectiveImage],
        variants,
        specifications: validSpecs,
        tags,
        isFeatured: Boolean(form.isFeatured),
        isBestSeller: Boolean(form.isBestSeller),
        isNewArrival: Boolean(form.isNewArrival),
      };

      await api.post("/products", payload);

      setSuccess("Product published successfully to your store!");
      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);
    } catch (err) {
      console.error("Create Product Error:", err);
      setError(
        err.response?.data?.message || "Failed to add product to catalog."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate discount percentage
  const discountPercent =
    form.price && form.salePrice && Number(form.salePrice) < Number(form.price)
      ? Math.round(
          ((Number(form.price) - Number(form.salePrice)) / Number(form.price)) * 100
        )
      : null;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link to="/admin/products" className="back-link">
            <ArrowLeft size={16} /> Back to Products
          </Link>
          <span className="dashboard-label">STORE CATALOG</span>
          <h1>Add New Product</h1>
          <p>Create a new product listing with pricing, inventory, variants, and specs.</p>
        </div>
      </div>

      {error && (
        <div className="admin-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="admin-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form-shell">
        <div className="form-two-column">
          {/* Main Column */}
          <div className="form-main-column">
            {/* Basic Info */}
            <div className="form-card-section">
              <h3>Product Information</h3>

              <div className="form-group">
                <label>
                  Product Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Ultra Pro Smart Watch with AMOLED Display"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Short Summary / Subtitle</label>
                <input
                  type="text"
                  name="shortDescription"
                  placeholder="e.g. High-performance Bluetooth smartwatch with 14-day battery life."
                  value={form.shortDescription}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Full Description & Features <span className="req">*</span>
                </label>
                <textarea
                  name="description"
                  rows={6}
                  placeholder="Describe your product in detail: key features, box contents, build materials, etc."
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="form-card-section">
              <h3>Pricing & Inventory</h3>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>
                    Regular Price (Rs.) <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g. 4500"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Sale / Discount Price (Rs.)</label>
                  <input
                    type="number"
                    name="salePrice"
                    placeholder="e.g. 3499 (optional)"
                    value={form.salePrice}
                    onChange={handleChange}
                    min="0"
                  />
                  {discountPercent && (
                    <span className="discount-calc-hint">
                      🎉 Customer saves {discountPercent}%!
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    placeholder="e.g. 20"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Variants (Sizes & Colors) */}
            <div className="form-card-section">
              <h3>Product Variants</h3>
              <p className="section-hint">
                Separate options with commas. Customers can pick these before adding to cart.
              </p>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Sizes / Dimensions</label>
                  <input
                    type="text"
                    name="sizes"
                    placeholder="e.g. Small, Medium, Large, XL"
                    value={form.sizes}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Colors / Styles</label>
                  <input
                    type="text"
                    name="colors"
                    placeholder="e.g. Matte Black, Silver, Rose Gold, Navy Blue"
                    value={form.colors}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="form-card-section">
              <div className="spec-section-header">
                <h3>Technical Specifications</h3>
                <button
                  type="button"
                  onClick={addSpecRow}
                  className="add-spec-btn"
                >
                  <Plus size={14} /> Add Spec
                </button>
              </div>

              <div className="specs-list">
                {specifications.map((spec, idx) => (
                  <div key={idx} className="spec-row-input">
                    <input
                      type="text"
                      placeholder="Title (e.g. Battery Life)"
                      value={spec.title}
                      onChange={(e) =>
                        updateSpecRow(idx, "title", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. Up to 14 Days)"
                      value={spec.value}
                      onChange={(e) =>
                        updateSpecRow(idx, "value", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecRow(idx)}
                      className="remove-spec-btn"
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="form-sidebar-column">
            {/* Category */}
            <div className="form-card-section">
              <h3>Category & Organization</h3>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleChange}
                >
                  {PRESET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Other">Other (Custom Category)</option>
                </select>
              </div>

              {form.categoryName === "Other" && (
                <div className="form-group">
                  <label>Custom Category Name</label>
                  <input
                    type="text"
                    name="customCategory"
                    placeholder="Enter category name"
                    value={form.customCategory}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Search Tags</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="e.g. wireless, waterproof, fast delivery"
                  value={form.tags}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Product Image */}
            <div className="form-card-section">
              <h3>Product Image</h3>

              <div className="image-preview-container">
                {form.imageUrl ? (
                  <img
                    src={
                      form.imageUrl.startsWith("http")
                        ? form.imageUrl
                        : `http://localhost:5000${form.imageUrl}`
                    }
                    alt="Preview"
                    className="image-preview"
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <Upload size={32} />
                    <span>No image selected yet</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Image URL (Direct link or Unsplash):</label>
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group file-upload-group">
                <label className="file-upload-label">
                  <Upload size={16} />
                  <span>
                    {uploadingImage ? "Uploading file..." : "Or Upload Local File"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    disabled={uploadingImage}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            {/* Badges & Status */}
            <div className="form-card-section">
              <h3>Store Badges</h3>

              <div className="checkboxes-list">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                  />
                  <span>Show on Featured Homepage</span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={form.isBestSeller}
                    onChange={handleChange}
                  />
                  <span>Mark as Best Seller Badge</span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={form.isNewArrival}
                    onChange={handleChange}
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="form-submit-box">
              <button
                type="submit"
                className="admin-primary-btn full-width"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    Publishing Product...
                  </>
                ) : (
                  "Publish Product to Store"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
