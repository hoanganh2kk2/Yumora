import ProductModel from "../models/product.model.js";

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
