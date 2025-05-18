import OrderModel from "../models/order.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import { nanoid } from "nanoid";

// Tạo đơn hàng mới
export const createOrderController = async (request, response) => {
  try {
    const userId = request.userId; // Lấy từ middleware auth
    const { addressId, paymentMethod, products } = request.body;

    if (!addressId || !paymentMethod || !products || products.length === 0) {
      return response.status(400).json({
        message:
          "Vui lòng cung cấp địa chỉ giao hàng, phương thức thanh toán và sản phẩm",
        error: true,
        success: false,
      });
    }

    // Tạo mã đơn hàng duy nhất với nanoid
    const uniqueOrderId = `YM-${nanoid(10)}`;

    // Tính tổng tiền
    let subTotalAmt = 0;
    let totalAmt = 0;

    // Tạo mảng chứa đơn hàng cho từng sản phẩm
    const orderItems = [];

    for (const [index, item] of products.entries()) {
      const { productId, quantity, price, name, image } = item;

      // Tính tiền cho từng sản phẩm
      const itemTotal = price * quantity;
      subTotalAmt += itemTotal;

      // THAY ĐỔI: Thêm chỉ số vào orderId để đảm bảo duy nhất
      // Giải pháp tạm thời nếu không thể xóa chỉ mục trong cơ sở dữ liệu
      const modifiedOrderId = `${uniqueOrderId}-${index + 1}`;

      // Tạo đơn hàng cho từng sản phẩm
      const orderItem = new OrderModel({
        userId,
        orderId: modifiedOrderId, // Sử dụng orderId đã sửa đổi
        productId,
        product_details: {
          name,
          image,
        },
        quantity,
        price_per_unit: price,
        itemTotal,
        paymentMethod,
        payment_status: paymentMethod === "COD" ? "Pending" : "Paid",
        delivery_address: addressId,
        order_status: "Processing",
      });

      const savedItem = await orderItem.save();
      orderItems.push(savedItem);
    }

    // Cập nhật tổng tiền (có thể thêm phí vận chuyển sau)
    totalAmt = subTotalAmt; // Nếu có phí vận chuyển: subTotalAmt + shippingFee

    // Cập nhật danh sách đơn hàng cho user
    const orderIds = orderItems.map((item) => item._id);
    await UserModel.findByIdAndUpdate(userId, {
      $push: {
        orderHistory: { $each: orderIds },
      },
    });

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await CartProductModel.deleteMany({ userId });

    // Xóa sản phẩm khỏi danh sách shopping_cart của user
    await UserModel.findByIdAndUpdate(userId, {
      $set: { shopping_cart: [] },
    });

    return response.status(200).json({
      message: "Đặt hàng thành công",
      data: {
        orderId: uniqueOrderId, // Trả về orderId gốc trong phản hồi
        items: orderItems,
        subTotalAmt,
        totalAmt,
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
    const userId = request.userId; // Lấy từ middleware auth
    const { page = 1, limit = 10 } = request.query;

    const skip = (page - 1) * limit;

    // THAY ĐỔI: Điều chỉnh cách tìm đơn hàng để tính đến tiền tố orderId
    // Tìm tất cả đơn hàng của user và sắp xếp theo thời gian tạo mới nhất
    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("delivery_address");

    // Nhóm các đơn hàng theo orderId, nhưng bỏ qua phần "-number" ở cuối
    const groupedOrders = {};
    orders.forEach((order) => {
      // Tách phần tiền tố orderId (không có số thứ tự)
      const baseOrderId = order.orderId.split("-").slice(0, -1).join("-");

      if (!groupedOrders[baseOrderId]) {
        groupedOrders[baseOrderId] = {
          orderId: baseOrderId, // Sử dụng orderId gốc
          items: [],
          createdAt: order.createdAt,
          status: order.order_status,
          paymentMethod: order.paymentMethod,
          payment_status: order.payment_status,
          address: order.delivery_address,
          totalAmount: 0,
        };
      }

      groupedOrders[baseOrderId].items.push(order);
      groupedOrders[baseOrderId].totalAmount += order.itemTotal || 0;
    });

    // Chuyển đổi object thành array để dễ xử lý ở frontend
    const formattedOrders = Object.values(groupedOrders);

    // Đếm tổng số đơn hàng để phân trang
    // THAY ĐỔI: Đếm số lượng orderId duy nhất (không bao gồm số thứ tự)
    const distinctOrderIds = await OrderModel.distinct("orderId", { userId });
    const uniqueBaseOrderIds = new Set();
    distinctOrderIds.forEach((orderId) => {
      const baseOrderId = orderId.split("-").slice(0, -1).join("-");
      uniqueBaseOrderIds.add(baseOrderId);
    });

    const totalOrders = uniqueBaseOrderIds.size;

    return response.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      data: formattedOrders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi lấy danh sách đơn hàng",
      error: true,
      success: false,
    });
  }
};

// Lấy chi tiết đơn hàng theo orderId
export const getOrderDetailController = async (request, response) => {
  try {
    const userId = request.userId; // Lấy từ middleware auth
    const { orderId } = request.params;

    if (!orderId) {
      return response.status(400).json({
        message: "Vui lòng cung cấp mã đơn hàng",
        error: true,
        success: false,
      });
    }

    // THAY ĐỔI: Tìm tất cả sản phẩm trong đơn hàng có orderId bắt đầu bằng orderId gốc
    const orderItems = await OrderModel.find({
      userId,
      orderId: { $regex: new RegExp(`^${orderId}-\\d+$`) },
    }).populate("delivery_address productId");

    if (!orderItems || orderItems.length === 0) {
      return response.status(404).json({
        message: "Không tìm thấy đơn hàng",
        error: true,
        success: false,
      });
    }

    // Tính tổng tiền đơn hàng
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + (item.itemTotal || 0),
      0
    );

    // Lấy thông tin chung của đơn hàng từ item đầu tiên
    const orderInfo = {
      orderId, // Sử dụng orderId gốc
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
    const userId = request.userId; // Lấy từ middleware auth
    const { orderId } = request.body;

    if (!orderId) {
      return response.status(400).json({
        message: "Vui lòng cung cấp mã đơn hàng",
        error: true,
        success: false,
      });
    }

    // THAY ĐỔI: Tìm và hủy tất cả các mục trong đơn hàng có orderId bắt đầu bằng orderId gốc
    // Kiểm tra tình trạng đơn hàng
    const order = await OrderModel.findOne({
      userId,
      orderId: { $regex: new RegExp(`^${orderId}-\\d+$`) },
    });

    if (!order) {
      return response.status(404).json({
        message: "Không tìm thấy đơn hàng",
        error: true,
        success: false,
      });
    }

    // Chỉ cho phép hủy đơn hàng nếu đang ở trạng thái "Processing"
    if (order.order_status !== "Processing") {
      return response.status(400).json({
        message: "Không thể hủy đơn hàng ở trạng thái này",
        error: true,
        success: false,
      });
    }

    // Cập nhật trạng thái cho tất cả sản phẩm trong đơn hàng
    const updateResult = await OrderModel.updateMany(
      {
        userId,
        orderId: { $regex: new RegExp(`^${orderId}-\\d+$`) },
      },
      { $set: { order_status: "Cancelled" } }
    );

    return response.status(200).json({
      message: "Hủy đơn hàng thành công",
      data: updateResult,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi hủy đơn hàng",
      error: true,
      success: false,
    });
  }
};

// Cập nhật mô hình đơn hàng để thêm các trường mới
export const updateOrderModel = async () => {
  try {
    // Thêm các trường mới vào schema nếu cần
    await OrderModel.updateMany(
      { quantity: { $exists: false } },
      {
        $set: {
          quantity: 1,
          price_per_unit: 0,
          itemTotal: 0,
          order_status: "Processing",
          paymentMethod: "COD",
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating order model:", error);
    return { success: false, error };
  }
};
