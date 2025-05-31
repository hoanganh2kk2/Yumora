import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createProductController,
  deleteProductDetails,
  getProductByCategory,
  getProductByCategoryAndSubCategory,
  getProductController,
  getProductDetails,
  searchProduct,
  updateProductDetails,
  // Enhanced search functions từ images
  enhancedSearchProduct,
  getSearchAutoComplete,
  getTrendingSearches,
  getSearchFilters,
} from "../controllers/product.controller.js";
import { admin } from "../middleware/Admin.js";

const productRouter = Router();

// Các routes...
productRouter.post("/create", auth, admin, createProductController);
productRouter.post("/get", getProductController);
productRouter.post("/get-product-by-category", getProductByCategory);
productRouter.post(
  "/get-product-by-category-and-subcategory",
  getProductByCategoryAndSubCategory
);
productRouter.post("/get-product-details", getProductDetails);
productRouter.put("/update-product-details", auth, admin, updateProductDetails);
productRouter.delete("/delete-product", auth, admin, deleteProductDetails);

// Enhanced search routes
productRouter.post("/search-product", searchProduct);
productRouter.get("/search-autocomplete", getSearchAutoComplete);
productRouter.get("/trending-searches", getTrendingSearches);
productRouter.get("/search-filters", getSearchFilters);

// Backup old search
productRouter.post("/search-product-basic", searchProduct);

export default productRouter;
