import vnpay from "../config/vnpay.js";
import OrderModel from "../models/order.model.js";

// Tạo URL thanh toán VNPay
export const createPaymentUrlController = async (request, response) => {
  try {
    const { orderId, amount, orderInfo } = request.body;

    if (!orderId || !amount || !orderInfo) {
      return response.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin thanh toán",
        error: true,
        success: false,
      });
    }

    // Lấy IP của người dùng
    const ipAddr =
      request.headers["x-forwarded-for"] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.connection.socket.remoteAddress;

    // Tạo URL thanh toán
    const paymentUrl = vnpay.createPaymentUrl(
      orderId,
      amount,
      orderInfo,
      ipAddr,
      process.env.VNPAY_RETURN_URL
    );

    return response.json({
      message: "Đã tạo URL thanh toán",
      data: { paymentUrl },
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

// Xử lý kết quả thanh toán từ VNPay
export const vnpayReturnController = async (request, response) => {
  try {
    const vnpParams = request.query;

    // Kiểm tra chữ ký từ VNPay
    const isValidSignature = vnpay.verifyReturnUrl(vnpParams);

    if (!isValidSignature) {
      return response.status(400).json({
        message: "Chữ ký không hợp lệ",
        error: true,
        success: false,
      });
    }

    // Kiểm tra kết quả thanh toán
    const vnpResponseCode = vnpParams["vnp_ResponseCode"];
    const orderId = vnpParams["vnp_TxnRef"];
    const amount = vnpParams["vnp_Amount"] / 100; // Chuyển về đơn vị tiền

    // Nếu thanh toán thành công (mã 00)
    if (vnpResponseCode === "00") {
      // Cập nhật trạng thái thanh toán trong database
      // Tìm tất cả sản phẩm trong đơn hàng
      const orderItems = await OrderModel.find({
        orderId: { $regex: new RegExp(`^${orderId}-\\d+$`) },
      });

      if (orderItems && orderItems.length > 0) {
        // Cập nhật trạng thái thanh toán cho tất cả sản phẩm trong đơn hàng
        await OrderModel.updateMany(
          { orderId: { $regex: new RegExp(`^${orderId}-\\d+$`) } },
          {
            $set: {
              payment_status: "Paid",
              paymentId: vnpParams["vnp_TransactionNo"] || "",
              order_status: "Confirmed",
            },
          }
        );

        return response.redirect(
          `${process.env.FRONTEND_URL}/success?orderId=${orderId}`
        );
      } else {
        return response.redirect(
          `${process.env.FRONTEND_URL}/cancel?error=order_not_found`
        );
      }
    } else {
      // Thanh toán thất bại
      return response.redirect(
        `${process.env.FRONTEND_URL}/cancel?error=payment_failed&code=${vnpResponseCode}`
      );
    }
  } catch (error) {
    console.error("VNPay return error:", error);
    return response.redirect(
      `${process.env.FRONTEND_URL}/cancel?error=system_error`
    );
  }
};

// API kiểm tra trạng thái thanh toán
export const checkPaymentStatusController = async (request, response) => {
  try {
    const { orderId } = request.params;

    if (!orderId) {
      return response.status(400).json({
        message: "Vui lòng cung cấp mã đơn hàng",
        error: true,
        success: false,
      });
    }

    // Kiểm tra trạng thái thanh toán trong database
    const orderItem = await OrderModel.findOne({
      orderId: { $regex: new RegExp(`^${orderId}-\\d+$`) },
    });

    if (!orderItem) {
      return response.status(404).json({
        message: "Không tìm thấy đơn hàng",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Thông tin thanh toán",
      data: {
        orderId: orderId,
        paymentStatus: orderItem.payment_status,
        orderStatus: orderItem.order_status,
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
