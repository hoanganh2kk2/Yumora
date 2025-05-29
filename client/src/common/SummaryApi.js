export const baseUrl = import.meta.env.VITE_API_URL;

const SummaryApi = {
  register: {
    url: "/api/user/register",
    method: "post",
  },
  login: {
    url: "/api/user/login",
    method: "post",
  },
  forgot_password: {
    url: "/api/user/forgot-password",
    method: "put",
  },
  forgot_password_otp_verification: {
    url: "/api/user/verify-forgot-password-otp",
    method: "put",
  },
  reset_password: {
    url: "/api/user/reset-password",
    method: "put",
  },
  refreshToken: {
    url: "/api/user/refresh-token",
    method: "post",
  },
  userDetails: {
    url: "/api/user/user-details",
    method: "get",
  },
  logout: {
    url: "/api/user/logout",
    method: "get",
  },
  uploadAvatar: {
    url: "/api/user/upload-avatar",
    method: "put",
  },
  updateUserDetails: {
    url: "/api/user/upload-user",
    method: "put",
  },
  addCategory: {
    url: "/api/category/add-category",
    method: "post",
  },
  uploadImage: {
    url: "/api/file/upload",
    method: "post",
  },
  getCategory: {
    url: "/api/category/get",
    method: "get",
  },
  updateCategory: {
    url: "/api/category/update",
    method: "put",
  },
  deleteCategory: {
    url: "/api/category/delete",
    method: "delete",
  },
  createSubCategory: {
    url: "/api/subcategory/create",
    method: "post",
  },
  getSubCategory: {
    url: "/api/subcategory/get",
    method: "post",
  },
  updateSubCategory: {
    url: "/api/subcategory/update",
    method: "put",
  },
  deleteSubCategory: {
    url: "/api/subcategory/delete",
    method: "delete",
  },
  createProduct: {
    url: "/api/product/create",
    method: "post",
  },
  getProduct: {
    url: "/api/product/get",
    method: "post",
  },
  getProductByCategory: {
    url: "/api/product/get-product-by-category",
    method: "post",
  },
  getProductByCategoryAndSubCategory: {
    url: "/api/product/get-product-by-category-and-subcategory",
    method: "post",
  },
  getProductDetails: {
    url: "/api/product/get-product-details",
    method: "post",
  },
  updateProductDetails: {
    url: "/api/product/update-product-details",
    method: "put",
  },
  deleteProduct: {
    url: "/api/product/delete-product",
    method: "delete",
  },
  searchProduct: {
    url: "/api/product/search-product",
    method: "post",
  },
  addToCart: {
    url: "/api/cart/create",
    method: "post",
  },
  getCartItem: {
    url: "/api/cart/get",
    method: "get",
  },
  updateCartItemQty: {
    url: "/api/cart/update-qty",
    method: "put",
  },
  deleteCartItem: {
    url: "/api/cart/delete-cart-item",
    method: "delete",
  },
  createAddress: {
    url: "/api/address/create",
    method: "post",
  },
  getAddress: {
    url: "/api/address/get",
    method: "get",
  },
  updateAddress: {
    url: "/api/address/update",
    method: "put",
  },
  disableAddress: {
    url: "/api/address/disable",
    method: "delete",
  },
  // Order APIs - Đã cập nhật
  createOrder: {
    url: "/api/order/create",
    method: "post",
  },
  getMyOrders: {
    url: "/api/order/my-orders",
    method: "get",
  },
  getOrderDetail: {
    url: "/api/order/detail",
    method: "get",
  },
  cancelOrder: {
    url: "/api/order/cancel",
    method: "put",
  },
  // Payment APIs - Đã cập nhật
  createPayment: {
    url: "/api/payment/create-payment",
    method: "post",
  },
  vnpayReturn: {
    url: "/api/payment/vnpay-return",
    method: "get",
  },
  checkPaymentStatus: {
    url: "/api/payment/check-status",
    method: "get",
  },
};

export default SummaryApi;
