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

    const ipAddr =
      request.headers["x-forwarded-for"] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      "127.0.0.1";

    const returnUrl = `${process.env.FRONTEND_URL}/payment-result`;

    const paymentUrl = vnpay.createPaymentUrl(
      orderId,
      amount,
      orderInfo,
      ipAddr,
      returnUrl
    );

    return response.json({
      message: "Đã tạo URL thanh toán",
      data: { paymentUrl },
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error creating payment URL:", error);
    return response.status(500).json({
      message: error.message || "Đã xảy ra lỗi khi tạo URL thanh toán",
      error: true,
      success: false,
    });
  }
};

// Xử lý kết quả thanh toán từ VNPay
export const vnpayReturnController = async (request, response) => {
  try {
    const vnpParams = { ...request.query };

    console.log("VNPay return params:", vnpParams);

    // Kiểm tra chữ ký
    const isValidSignature = vnpay.verifyReturnUrl(vnpParams);

    if (!isValidSignature) {
      console.error("Invalid VNPay signature");
      return response.redirect(
        `${process.env.FRONTEND_URL}/payment-result?status=error&message=invalid_signature`
      );
    }

    const vnpResponseCode = vnpParams["vnp_ResponseCode"];
    const orderId = vnpParams["vnp_TxnRef"];
    const amount = vnpParams["vnp_Amount"] / 100;
    const transactionNo = vnpParams["vnp_TransactionNo"];

    console.log(
      `Payment result: OrderId=${orderId}, ResponseCode=${vnpResponseCode}, Amount=${amount}`
    );

    // Kiểm tra đơn hàng tồn tại
    const orderItems = await OrderModel.find({ orderId });

    if (!orderItems || orderItems.length === 0) {
      console.error(`Order not found: ${orderId}`);
      return response.redirect(
        `${process.env.FRONTEND_URL}/payment-result?status=error&message=order_not_found&orderId=${orderId}`
      );
    }

    if (vnpResponseCode === "00") {
      // Thanh toán thành công
      await OrderModel.updateMany(
        { orderId },
        {
          $set: {
            payment_status: "Paid",
            paymentId: transactionNo,
            order_status: "Confirmed",
          },
        }
      );

      console.log(`Payment successful for order: ${orderId}`);

      return response.redirect(
        `${process.env.FRONTEND_URL}/payment-result?status=success&orderId=${orderId}&amount=${amount}`
      );
    } else {
      // Thanh toán thất bại
      console.log(
        `Payment failed for order: ${orderId}, code: ${vnpResponseCode}`
      );

      return response.redirect(
        `${process.env.FRONTEND_URL}/payment-result?status=failed&orderId=${orderId}&code=${vnpResponseCode}`
      );
    }
  } catch (error) {
    console.error("VNPay return error:", error);
    return response.redirect(
      `${process.env.FRONTEND_URL}/payment-result?status=error&message=system_error`
    );
  }
};

// Kiểm tra trạng thái thanh toán
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

    const orderItem = await OrderModel.findOne({ orderId });

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
        paymentMethod: orderItem.paymentMethod,
        paymentId: orderItem.paymentId || "",
      },
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return response.status(500).json({
      message:
        error.message || "Đã xảy ra lỗi khi kiểm tra trạng thái thanh toán",
      error: true,
      success: false,
    });
  }
};
