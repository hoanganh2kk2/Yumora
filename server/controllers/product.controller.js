import ProductModel from "../models/product.model.js";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";

export const createProductController = async (request, response) => {
  try {
    const {
      name,
      image,
      category,
      subCategory,
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
    } = request.body;

    // Kiểm tra các trường bắt buộc
    if (
      !name ||
      !image[0] ||
      !category[0] ||
      !subCategory[0] ||
      !unit ||
      !price ||
      !description
    ) {
      return response.status(400).json({
        message: "Nhập các trường bắt buộc",
        error: true,
        success: false,
      });
    }

    // Kiểm tra các giá trị số
    if (stock !== undefined && (isNaN(stock) || Number(stock) < 0)) {
      return response.status(400).json({
        message: "Số lượng sản phẩm phải là số dương",
        error: true,
        success: false,
      });
    }

    if (isNaN(price) || Number(price) <= 0) {
      return response.status(400).json({
        message: "Giá sản phẩm phải là số dương",
        error: true,
        success: false,
      });
    }

    if (
      discount !== undefined &&
      (isNaN(discount) || Number(discount) < 0 || Number(discount) > 100)
    ) {
      return response.status(400).json({
        message: "Giảm giá phải là số từ 0 đến 100",
        error: true,
        success: false,
      });
    }

    const product = new ProductModel({
      name,
      image,
      category,
      subCategory,
      unit,
      stock: Math.max(0, Number(stock)), // Đảm bảo giá trị không âm
      price: Math.max(0.01, Number(price)), // Đảm bảo giá trị dương
      discount:
        discount !== undefined
          ? Math.min(100, Math.max(0, Number(discount)))
          : 0, // Đảm bảo giá trị từ 0-100
      description,
      more_details,
    });
    const saveProduct = await product.save();

    return response.json({
      message: "Đã tạo sản phẩm thành công",
      data: saveProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductController = async (request, response) => {
  try {
    let { page, limit, search } = request.body;

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 10;
    }

    const query = search
      ? {
          $text: {
            $search: search,
          },
        }
      : {};

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category subCategory"),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Dữ liệu sản phẩm",
      error: false,
      success: true,
      totalCount: totalCount,
      totalNoPage: Math.ceil(totalCount / limit),
      data: data,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductByCategory = async (request, response) => {
  try {
    const { id } = request.body;

    if (!id) {
      return response.status(400).json({
        message: "Cung cấp id loại sản phẩm",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.find({
      category: { $in: id },
    }).limit(15);

    return response.json({
      message: "Danh sách loại sản phẩm",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductByCategoryAndSubCategory = async (request, response) => {
  try {
    const { categoryId, subCategoryId, page, limit } = request.body;

    if (!categoryId || !subCategoryId) {
      return response.status(400).json({
        message: "Cung cấp categoryId và subCategoryId",
        error: true,
        success: false,
      });
    }

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 10;
    }

    const query = {
      category: { $in: categoryId },
      subCategory: { $in: subCategoryId },
    };

    const skip = (page - 1) * limit;

    const [data, dataCount] = await Promise.all([
      ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Danh sách sản phẩm",
      data: data,
      totalCount: dataCount,
      page: page,
      limit: limit,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductDetails = async (request, response) => {
  try {
    const { productId } = request.body;

    const product = await ProductModel.findOne({ _id: productId });

    return response.json({
      message: "Chi tiết sản phẩm",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//update product
export const updateProductDetails = async (request, response) => {
  try {
    const { _id, stock, price, discount } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Cung cấp id sản phẩm",
        error: true,
        success: false,
      });
    }

    // Kiểm tra các giá trị số
    if (stock !== undefined && (isNaN(stock) || Number(stock) < 0)) {
      return response.status(400).json({
        message: "Số lượng sản phẩm phải là số dương",
        error: true,
        success: false,
      });
    }

    if (price !== undefined && (isNaN(price) || Number(price) <= 0)) {
      return response.status(400).json({
        message: "Giá sản phẩm phải là số dương",
        error: true,
        success: false,
      });
    }

    if (
      discount !== undefined &&
      (isNaN(discount) || Number(discount) < 0 || Number(discount) > 100)
    ) {
      return response.status(400).json({
        message: "Giảm giá phải là số từ 0 đến 100",
        error: true,
        success: false,
      });
    }

    // Chuẩn hóa dữ liệu trước khi cập nhật
    const dataToUpdate = { ...request.body };

    if (stock !== undefined) {
      dataToUpdate.stock = Math.max(0, Number(stock));
    }

    if (price !== undefined) {
      dataToUpdate.price = Math.max(0.01, Number(price));
    }

    if (discount !== undefined) {
      dataToUpdate.discount = Math.min(100, Math.max(0, Number(discount)));
    }

    const updateProduct = await ProductModel.updateOne(
      { _id: _id },
      dataToUpdate
    );

    return response.json({
      message: "Cập nhật thành công",
      data: updateProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//delete product
export const deleteProductDetails = async (request, response) => {
  try {
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Cung cấp _id ",
        error: true,
        success: false,
      });
    }

    const deleteProduct = await ProductModel.deleteOne({ _id: _id });

    return response.json({
      message: "Xóa thành công",
      error: false,
      success: true,
      data: deleteProduct,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//search product
export const searchProduct = async (request, response) => {
  try {
    let { search, page, limit } = request.body;

    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 10;
    }

    const query = search
      ? {
          $text: {
            $search: search,
          },
        }
      : {};

    const skip = (page - 1) * limit;

    const [data, dataCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category subCategory"),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Product data",
      error: false,
      success: true,
      data: data,
      totalCount: dataCount,
      totalPage: Math.ceil(dataCount / limit),
      page: page,
      limit: limit,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Vietnamese text normalization function
const normalizeVietnameseText = (text) => {
  if (!text) return "";

  // Remove Vietnamese accents and normalize
  const vietnameseMap = {
    "à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ": "a",
    "è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ": "e",
    "ì|í|ị|ỉ|ĩ": "i",
    "ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ": "o",
    "ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ": "u",
    "ỳ|ý|ỵ|ỷ|ỹ": "y",
    đ: "d",
    "À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ": "A",
    "È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ": "E",
    "Ì|Í|Ị|Ỉ|Ĩ": "I",
    "Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ": "O",
    "Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ": "U",
    "Ỳ|Ý|Ỵ|Ỷ|Ỹ": "Y",
    Đ: "D",
  };

  let normalizedText = text.toLowerCase();

  for (const [vietnameseChars, latin] of Object.entries(vietnameseMap)) {
    const regex = new RegExp(`[${vietnameseChars}]`, "g");
    normalizedText = normalizedText.replace(regex, latin);
  }

  return normalizedText;
};

// Vietnamese search keywords mapping
const vietnameseKeywordMap = {
  // Sữa & Dairy
  sua: ["sữa", "milk", "dairy"],
  "sua tuoi": ["sữa tươi", "fresh milk"],
  "sua dac": ["sữa đặc", "condensed milk"],
  "sua chua": ["sữa chua", "yogurt"],
  bo: ["bơ", "butter"],
  "pho mai": ["phô mai", "cheese"],

  // Bánh & Bread
  banh: ["bánh"],
  "banh mi": ["bánh mì", "bread"],
  "banh quy": ["bánh quy", "biscuit", "cookie"],
  "banh ngot": ["bánh ngọt", "cake", "pastry"],
  "banh trang": ["bánh tráng", "rice paper"],

  // Thịt & Meat
  thit: ["thịt", "meat"],
  "thit bo": ["thịt bò", "beef"],
  "thit heo": ["thịt heo", "thịt lợn", "pork"],
  "thit ga": ["thịt gà", "chicken"],
  "thit de": ["thịt dê", "goat"],
  ca: ["cá", "fish"],
  tom: ["tôm", "shrimp", "prawn"],
  cua: ["cua", "crab"],

  // Rau & Vegetables
  rau: ["rau", "vegetable"],
  "rau xanh": ["rau xanh", "green vegetable"],
  "rau cu": ["rau củ", "root vegetable"],
  "cu cai": ["củ cải", "radish"],
  "ca rot": ["cà rốt", "carrot"],
  "khoai tay": ["khoai tây", "potato"],
  "ca chua": ["cà chua", "tomato"],

  // Gạo & Rice
  gao: ["gạo", "rice"],
  com: ["cơm", "cooked rice"],
  "gao te": ["gạo tẻ", "plain rice"],
  "gao nep": ["gạo nếp", "sticky rice"],
  "gao st25": ["gạo st25", "st25"],
  "gao jasmine": ["gạo jasmine", "jasmine"],

  // Mì & Noodles
  mi: ["mì", "noodle"],
  "mi goi": ["mì gói", "instant noodle"],
  "mi tom": ["mì tôm", "shrimp noodle"],
  pho: ["phở", "pho"],
  bun: ["bún", "vermicelli"],

  // Gia vị & Spices
  "nuoc mam": ["nước mắm", "fish sauce"],
  "nuoc tuong": ["nước tương", "soy sauce"],
  "tuong ot": ["tương ớt", "chili sauce"],
  "dau an": ["dầu ăn", "cooking oil"],
  muoi: ["muối", "salt"],
  duong: ["đường", "sugar"],
  tieu: ["tiêu", "pepper"],

  // Đồ uống & Beverages
  nuoc: ["nước", "water", "drink"],
  "nuoc ngot": ["nước ngọt", "soft drink"],
  bia: ["bia", "beer"],
  ruou: ["rượu", "alcohol", "wine"],
  tra: ["trà", "tea"],
  "ca phe": ["cà phê", "coffee"],
  "nuoc suoi": ["nước suối", "mineral water"],

  // Snacks
  "banh trang nuong": ["bánh tráng nướng", "grilled rice paper"],
  keo: ["kẹo", "candy"],
  socola: ["socola", "chocolate"],
  "bim bim": ["bim bim", "chips"],
  hat: ["hạt", "nuts", "seeds"],
};

// Create flexible search patterns
const createSearchPatterns = (searchText) => {
  const normalized = normalizeVietnameseText(searchText);
  const patterns = [searchText.toLowerCase(), normalized];

  // Add keyword expansions
  Object.entries(vietnameseKeywordMap).forEach(([key, variations]) => {
    if (
      normalized.includes(key) ||
      variations.some((v) => normalized.includes(normalizeVietnameseText(v)))
    ) {
      patterns.push(...variations.map((v) => normalizeVietnameseText(v)));
    }
  });

  // Add partial matches for Vietnamese
  const words = searchText
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 2);
  patterns.push(...words);

  return [...new Set(patterns)]; // Remove duplicates
};

// Enhanced search with multiple strategies
export const enhancedSearchProduct = async (request, response) => {
  try {
    let { search, page, limit, category, subCategory, priceRange, sortBy } =
      request.body;

    if (!page) page = 1;
    if (!limit) limit = 10;

    const skip = (page - 1) * limit;
    let query = {};
    let sortOptions = { createdAt: -1 }; // Default sort

    // FIX: Chỉ search khi có search term
    if (search && search.trim() && search.trim().length > 0) {
      const searchPatterns = createSearchPatterns(search.trim());

      // Simplified search query
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Category filter
    if (category && category.length > 0) {
      query.category = { $in: Array.isArray(category) ? category : [category] };
    }

    // SubCategory filter
    if (subCategory && subCategory.length > 0) {
      query.subCategory = {
        $in: Array.isArray(subCategory) ? subCategory : [subCategory],
      };
    }

    // Price range filter
    if (priceRange) {
      const { min, max } = priceRange;
      if (min !== undefined || max !== undefined) {
        query.price = {};
        if (min !== undefined) query.price.$gte = Number(min);
        if (max !== undefined) query.price.$lte = Number(max);
      }
    }

    // Only show published products
    query.publish = true;
    query.stock = { $gt: 0 };

    // Simple query instead of aggregation
    const [data, totalCount] = await Promise.all([
      ProductModel.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("category subCategory"),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Kết quả tìm kiếm",
      error: false,
      success: true,
      data: data,
      totalCount: totalCount,
      totalPage: Math.ceil(totalCount / limit),
      page: page,
      limit: limit,
      searchStats: {
        query: search,
        resultCount: totalCount,
        priceRange: { minPrice: 0, maxPrice: 0, avgPrice: 0 },
        categoryBreakdown: [],
      },
      suggestions: [],
    });
  } catch (error) {
    console.error("Enhanced search error:", error);
    return response.status(500).json({
      message: error.message || "Lỗi tìm kiếm",
      error: true,
      success: false,
    });
  }
};

// Fuzzy search for when exact search fails
const performFuzzySearch = async (searchTerm, limit = 10) => {
  try {
    // Create more flexible regex patterns
    const words = searchTerm
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 1);
    const patterns = words.map((word) => ({
      $or: [
        { name: { $regex: word, $options: "i" } },
        { description: { $regex: word, $options: "i" } },
      ],
    }));

    if (patterns.length === 0) return [];

    const fuzzyQuery = {
      $and: [{ $or: patterns }, { publish: true }, { stock: { $gt: 0 } }],
    };

    return await ProductModel.find(fuzzyQuery)
      .populate("category subCategory")
      .limit(limit)
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error("Fuzzy search error:", error);
    return [];
  }
};

// Generate smart search suggestions
const generateSearchSuggestions = async (searchTerm) => {
  const suggestions = [];

  try {
    // 1. Similar product names
    const similarProducts = await ProductModel.find({
      name: { $regex: searchTerm.split(" ")[0], $options: "i" },
      publish: true,
    })
      .limit(3)
      .select("name");

    suggestions.push(
      ...similarProducts.map((p) => ({
        type: "product",
        text: p.name,
        reason: "Sản phẩm tương tự",
      }))
    );

    // 2. Category suggestions
    const categories = await CategoryModel.find({
      name: { $regex: searchTerm, $options: "i" },
    })
      .limit(2)
      .select("name");

    suggestions.push(
      ...categories.map((c) => ({
        type: "category",
        text: c.name,
        reason: "Danh mục liên quan",
      }))
    );

    // 3. Vietnamese keyword suggestions
    const normalizedSearch = normalizeVietnameseText(searchTerm);
    Object.entries(vietnameseKeywordMap).forEach(([key, variations]) => {
      if (normalizedSearch.includes(key)) {
        variations.slice(0, 2).forEach((variation) => {
          if (!suggestions.find((s) => s.text === variation)) {
            suggestions.push({
              type: "keyword",
              text: variation,
              reason: "Từ khóa liên quan",
            });
          }
        });
      }
    });

    // 4. Popular searches fallback
    if (suggestions.length < 3) {
      const popularTerms = [
        "sữa tươi",
        "bánh mì",
        "thịt heo",
        "rau củ",
        "mì gói",
        "nước mắm",
        "gạo tẻ",
        "đồ uống",
      ];

      popularTerms.slice(0, 5 - suggestions.length).forEach((term) => {
        suggestions.push({
          type: "popular",
          text: term,
          reason: "Tìm kiếm phổ biến",
        });
      });
    }
  } catch (error) {
    console.error("Error generating suggestions:", error);
  }

  return suggestions.slice(0, 5);
};

// Auto-complete API for real-time suggestions
export const getSearchAutoComplete = async (request, response) => {
  try {
    const { query, limit = 8 } = request.query;

    if (!query || query.length < 2) {
      return response.json({
        message: "Query too short",
        data: [],
        success: true,
        error: false,
      });
    }

    const suggestions = [];
    const searchPatterns = createSearchPatterns(query);

    // Product suggestions
    const products = await ProductModel.find({
      $or: searchPatterns.map((pattern) => ({
        name: { $regex: pattern, $options: "i" },
      })),
      publish: true,
      stock: { $gt: 0 },
    })
      .select("name image")
      .limit(5)
      .sort({ createdAt: -1 });

    suggestions.push(
      ...products.map((p) => ({
        type: "product",
        text: p.name,
        id: p._id,
        image: p.image[0],
      }))
    );

    // Category suggestions
    const categories = await CategoryModel.find({
      name: { $regex: query, $options: "i" },
    })
      .select("name image")
      .limit(2);

    suggestions.push(
      ...categories.map((c) => ({
        type: "category",
        text: c.name,
        id: c._id,
        image: c.image,
      }))
    );

    // SubCategory suggestions
    const subCategories = await SubCategoryModel.find({
      name: { $regex: query, $options: "i" },
    })
      .select("name image")
      .limit(2);

    suggestions.push(
      ...subCategories.map((sc) => ({
        type: "subcategory",
        text: sc.name,
        id: sc._id,
        image: sc.image,
      }))
    );

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.text === item.text)
      )
      .slice(0, limit);

    return response.json({
      message: "Auto-complete suggestions",
      data: uniqueSuggestions,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Get trending/popular searches
export const getTrendingSearches = async (request, response) => {
  try {
    // This would typically come from analytics/search logs
    // For now, return predefined popular Vietnamese food searches
    const trendingSearches = [
      { text: "Sữa tươi TH True Milk", count: 1250, trend: "up" },
      { text: "Bánh mì sandwich", count: 980, trend: "up" },
      { text: "Thịt heo ba chỉ", count: 856, trend: "stable" },
      { text: "Rau củ quả tươi", count: 743, trend: "up" },
      { text: "Mì gói Hảo Hảo", count: 692, trend: "down" },
      { text: "Nước mắm Phú Quốc", count: 567, trend: "stable" },
      { text: "Gạo ST25", count: 498, trend: "up" },
      { text: "Cà phê Trung Nguyên", count: 445, trend: "stable" },
    ];

    return response.json({
      message: "Trending searches",
      data: trendingSearches,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Search filters for categories and price ranges
export const getSearchFilters = async (request, response) => {
  try {
    const { search } = request.query;

    let baseQuery = { publish: true, stock: { $gt: 0 } };

    if (search) {
      const searchPatterns = createSearchPatterns(search);
      baseQuery.$or = searchPatterns.map((pattern) => ({
        $or: [
          { name: { $regex: pattern, $options: "i" } },
          { description: { $regex: pattern, $options: "i" } },
        ],
      }));
    }

    // Get available categories for current search
    const categoryAggregation = await ProductModel.aggregate([
      { $match: baseQuery },
      { $unwind: "$category" },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          _id: 1,
          name: "$categoryInfo.name",
          image: "$categoryInfo.image",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get price ranges
    const priceStats = await ProductModel.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          avgPrice: { $avg: "$price" },
        },
      },
    ]);

    // Create price range buckets
    const priceRange = priceStats[0] || { minPrice: 0, maxPrice: 1000000 };
    const priceBuckets = [
      { label: "Dưới 50,000đ", min: 0, max: 50000 },
      { label: "50,000đ - 100,000đ", min: 50000, max: 100000 },
      { label: "100,000đ - 200,000đ", min: 100000, max: 200000 },
      { label: "200,000đ - 500,000đ", min: 200000, max: 500000 },
      { label: "Trên 500,000đ", min: 500000, max: null },
    ];

    return response.json({
      message: "Search filters",
      data: {
        categories: categoryAggregation,
        priceRange: priceRange,
        priceBuckets: priceBuckets,
        sortOptions: [
          { value: "relevance", label: "Liên quan nhất" },
          { value: "price_asc", label: "Giá thấp đến cao" },
          { value: "price_desc", label: "Giá cao đến thấp" },
          { value: "name_asc", label: "Tên A-Z" },
          { value: "name_desc", label: "Tên Z-A" },
          { value: "discount", label: "Giảm giá nhiều nhất" },
          { value: "popularity", label: "Phổ biến nhất" },
        ],
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
