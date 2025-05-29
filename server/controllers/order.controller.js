import OrderModel from "../models/order.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import { nanoid } from "nanoid";
import vnpay from "../config/vnpay.js";

// Tạo đơn hàng mới
export const createOrderController = async (request, response) => {
  try {
    const userId = request.userId;
    const { addressId, paymentMethod, products } = request.body;

    // Validation
    if (!addressId || !paymentMethod || !products || products.length === 0) {
      return response.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin đơn hàng",
        error: true,
        success: false,
      });
    }

    // Tạo orderId duy nhất
    const orderId = `YM-${nanoid(10)}`;

    // Tính tổng tiền và tạo order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of products) {
      const { productId, quantity, price, name, image } = item;
      const itemTotal = price * quantity;
      totalAmount += itemTotal;

      const orderItem = new OrderModel({
        userId,
        orderId,
        productId,
        product_details: { name, image },
        quantity,
        price_per_unit: price,
        itemTotal,
        paymentMethod,
        payment_status: "Pending",
        delivery_address: addressId,
        order_status: "Processing",
      });

      const savedItem = await orderItem.save();
      orderItems.push(savedItem);
    }

    // Cập nhật user order history
    await UserModel.findByIdAndUpdate(userId, {
      $push: { orderHistory: { $each: orderItems.map((item) => item._id) } },
    });

    // Xóa giỏ hàng
    await CartProductModel.deleteMany({ userId });
    await UserModel.findByIdAndUpdate(userId, { $set: { shopping_cart: [] } });

    // Xử lý thanh toán
    if (paymentMethod === "Online") {
      const ipAddr =
        request.headers["x-forwarded-for"] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        "127.0.0.1";

      const orderInfo = `Thanh toan don hang ${orderId}`;
      const returnUrl = `${process.env.FRONTEND_URL}/payment-result`;

      const paymentUrl = vnpay.createPaymentUrl(
        orderId,
        totalAmount,
        orderInfo,
        ipAddr,
        returnUrl
      );

      return response.status(200).json({
        message: "Đơn hàng đã được tạo, chuyển đến trang thanh toán",
        data: {
          orderId,
          totalAmount,
          paymentUrl,
          paymentMethod,
        },
        error: false,
        success: true,
      });
    }

    // COD payment
    return response.status(200).json({
      message: "Đặt hàng thành công",
      data: {
        orderId,
        totalAmount,
        paymentMethod,
        items: orderItems,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return response.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tạo đơn hàng",
      error: true,
      success: false,
    });
  }
};

// Lấy danh sách đơn hàng của người dùng
export const getUserOrdersController = async (request, response) => {
  try {
    const userId = request.userId;
    const { page = 1, limit = 6 } = request.query;

    // Tìm các orderId duy nhất
    const distinctOrderIds = await OrderModel.distinct("orderId", { userId });

    const totalOrders = distinctOrderIds.length;
    const totalPages = Math.ceil(totalOrders / limit);
    const skip = (page - 1) * limit;

    // Lấy orderId cho trang hiện tại
    const paginatedOrderIds = distinctOrderIds.slice(
      skip,
      skip + parseInt(limit)
    );

    const orders = [];

    // Lấy chi tiết cho từng đơn hàng
    for (const orderId of paginatedOrderIds) {
      const orderItems = await OrderModel.find({ userId, orderId })
        .populate("delivery_address")
        .sort({ createdAt: -1 });

      if (orderItems.length > 0) {
        const totalAmount = orderItems.reduce(
          (sum, item) => sum + item.itemTotal,
          0
        );

        orders.push({
          orderId,
          items: orderItems,
          createdAt: orderItems[0].createdAt,
          status: orderItems[0].order_status,
          paymentMethod: orderItems[0].paymentMethod,
          payment_status: orderItems[0].payment_status,
          address: orderItems[0].delivery_address,
          totalAmount,
        });
      }
    }

    // Sắp xếp theo thời gian tạo mới nhất
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return response.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    return response.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi lấy danh sách đơn hàng",
      error: true,
      success: false,
    });
  }
};

// Lấy chi tiết đơn hàng
export const getOrderDetailController = async (request, response) => {
  try {
    const userId = request.userId;
    const { orderId } = request.params;

    if (!orderId) {
      return response.status(400).json({
        message: "Vui lòng cung cấp mã đơn hàng",
        error: true,
        success: false,
      });
    }

    const orderItems = await OrderModel.find({ userId, orderId }).populate(
      "delivery_address productId"
    );

    if (!orderItems || orderItems.length === 0) {
      return response.status(404).json({
        message: "Không tìm thấy đơn hàng",
        error: true,
        success: false,
      });
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.itemTotal,
      0
    );

    const orderInfo = {
      orderId,
      createdAt: orderItems[0].createdAt,
      status: orderItems[0].order_status,
      paymentMethod: orderItems[0].paymentMethod,
      payment_status: orderItems[0].payment_status,
      address: orderItems[0].delivery_address,
      items: orderItems,
      totalAmount,
    };

    return response.status(200).json({
      message: "Lấy chi tiết đơn hàng thành công",
      data: orderInfo,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error getting order detail:", error);
    return response.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi lấy chi tiết đơn hàng",
      error: true,
      success: false,
    });
  }
};

// Hủy đơn hàng
export const cancelOrderController = async (request, response) => {
  try {
    const userId = request.userId;
    const { orderId } = request.body;

    if (!orderId) {
      return response.status(400).json({
        message: "Vui lòng cung cấp mã đơn hàng",
        error: true,
        success: false,
      });
    }

    // Kiểm tra đơn hàng tồn tại
    const order = await OrderModel.findOne({ userId, orderId });

    if (!order) {
      return response.status(404).json({
        message: "Không tìm thấy đơn hàng",
        error: true,
        success: false,
      });
    }

    // Chỉ cho phép hủy đơn hàng đang xử lý
    if (order.order_status !== "Processing") {
      return response.status(400).json({
        message: "Không thể hủy đơn hàng ở trạng thái này",
        error: true,
        success: false,
      });
    }

    // Cập nhật trạng thái tất cả items trong đơn hàng
    const updateResult = await OrderModel.updateMany(
      { userId, orderId },
      { $set: { order_status: "Cancelled" } }
    );

    return response.status(200).json({
      message: "Hủy đơn hàng thành công",
      data: updateResult,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return response.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi hủy đơn hàng",
      error: true,
      success: false,
    });
  }
};
