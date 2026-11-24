const Product = require("../models/Product");

// @desc    Get all products (with search, category filter, sorting & pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      featured,
      bestSeller,
      newArrival,
      inStock,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Filter by active status for public, unless admin specifically asks
    if (req.query.all !== "true") {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All" && category !== "all") {
      query.$or = [
        { categoryName: { $regex: category, $options: "i" } },
        { tags: { $regex: category, $options: "i" } },
      ];
    }

    if (featured === "true") query.isFeatured = true;
    if (bestSeller === "true") query.isBestSeller = true;
    if (newArrival === "true") query.isNewArrival = true;
    if (inStock === "true") query.inStock = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === "price-low") sortOption = { price: 1 };
    else if (sort === "price-high") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { rating: -1 };
    else if (sort === "popular") sortOption = { isBestSeller: -1, isFeatured: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("category", "name slug"),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:idOrSlug
// @access  Public
const getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    let product;

    // Check if it's a valid Mongo ObjectId
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug).populate(
        "category",
        "name slug"
      );
    }

    // If not found by ID, look up by slug
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug }).populate(
        "category",
        "name slug"
      );
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
      product,
    });
  } catch (error) {
    console.error("Get Single Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
    });
  }
};

// @desc    Create a new product (Admin Dashboard)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      salePrice,
      stock,
      category,
      categoryName,
      images,
      variants,
      specifications,
      tags,
      isFeatured,
      isBestSeller,
      isNewArrival,
    } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product title, description and price are required",
      });
    }

    const product = await Product.create({
      title: title.trim(),
      description,
      shortDescription: shortDescription ? shortDescription.trim() : "",
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      stock: stock !== undefined ? Number(stock) : 10,
      category: category || null,
      categoryName: categoryName || "General",
      images: Array.isArray(images) ? images : [],
      variants: Array.isArray(variants) ? variants : [],
      specifications: Array.isArray(specifications) ? specifications : [],
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully to your store!",
      data: product,
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// @desc    Update an existing product (Admin Dashboard)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updated,
      product: updated,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/status
// @access  Private/Admin
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product is now ${product.isActive ? "active" : "hidden"}`,
      data: product,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle product status",
    });
  }
};

// @desc    Delete a product (Admin Dashboard)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully from store",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};
