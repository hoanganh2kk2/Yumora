import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Lấy thông tin từ URL parameters
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const checkPaymentStatus = async (id) => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.checkPaymentStatus,
        url: `${SummaryApi.checkPaymentStatus.url}/${id}`,
      });

      if (response.data.success) {
        setOrderInfo(response.data.data);
        setPaymentStatus(response.data.data.paymentStatus);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "success":
        return {
          icon: "✅",
          title: "Thanh toán thành công!",
          message:
            "Cảm ơn bạn đã đặt hàng tại Yumora. Đơn hàng của bạn đang được xử lý.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          buttonColor: "bg-green-600 hover:bg-green-700",
        };
      case "failed":
        return {
          icon: "❌",
          title: "Thanh toán không thành công",
          message: getFailureMessage(errorCode),
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          buttonColor: "bg-red-600 hover:bg-red-700",
        };
      case "error":
        return {
          icon: "⚠️",
          title: "Đã xảy ra lỗi",
          message: getErrorMessage(errorMessage),
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
        };
      default:
        return {
          icon: "❓",
          title: "Trạng thái không xác định",
          message: "Không thể xác định trạng thái thanh toán",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          buttonColor: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  const getFailureMessage = (code) => {
    const errorMessages = {
      "07": "Giao dịch bị nghi ngờ. Vui lòng liên hệ ngân hàng để biết thêm chi tiết.",
      "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.",
      10: "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
      11: "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.",
      12: "Thẻ/Tài khoản bị khóa.",
      13: "Mật khẩu xác thực giao dịch (OTP) không đúng.",
      24: "Khách hàng hủy giao dịch.",
      51: "Tài khoản không đủ số dư để thực hiện giao dịch.",
      65: "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
      75: "Ngân hàng thanh toán đang bảo trì.",
      79: "Nhập sai mật khẩu thanh toán quá số lần quy định.",
      99: "Lỗi không xác định từ hệ thống ngân hàng.",
    };

    return errorMessages[code] || `Giao dịch không thành công. Mã lỗi: ${code}`;
  };

  const getErrorMessage = (message) => {
    const errorMessages = {
      invalid_signature: "Chữ ký giao dịch không hợp lệ",
      order_not_found: "Không tìm thấy thông tin đơn hàng",
      system_error: "Lỗi hệ thống, vui lòng liên hệ với chúng tôi",
    };

    return errorMessages[message] || "Đã xảy ra lỗi không xác định";
  };

  const statusDisplay = getStatusDisplay();

  if (loading) {
    return (
      <div className="container mx-auto my-8 max-w-2xl px-4">
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 max-w-2xl px-4">
      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div
          className={`${statusDisplay.bgColor} ${statusDisplay.borderColor} border-b p-6 text-center`}
        >
          <div className="mx-auto mb-4 text-6xl">{statusDisplay.icon}</div>
          <h2 className={`text-2xl font-bold ${statusDisplay.textColor}`}>
            {statusDisplay.title}
          </h2>
          {orderId && (
            <p className="mt-2 text-lg text-gray-600">
              Mã đơn hàng: <span className="font-semibold">{orderId}</span>
            </p>
          )}
          {amount && status === "success" && (
            <p className="mt-1 text-lg text-gray-600">
              Số tiền:{" "}
              <span className="font-semibold text-green-600">
                {DisplayPriceInRupees(parseFloat(amount))}
              </span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-6 text-center text-lg text-gray-700">
            {statusDisplay.message}
          </p>

          {/* Order Info */}
          {orderInfo && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-800">
                Thông tin đơn hàng:
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Trạng thái thanh toán:</span>
                  <span
                    className={`ml-2 font-medium ${
                      orderInfo.paymentStatus === "Paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {orderInfo.paymentStatus === "Paid"
                      ? "Đã thanh toán"
                      : "Chờ thanh toán"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Trạng thái đơn hàng:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {getOrderStatusText(orderInfo.orderStatus)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="ml-2 font-medium">
                    {orderInfo.paymentMethod === "Online" ? "VNPay" : "COD"}
                  </span>
                </div>
                {orderInfo.paymentId && (
                  <div>
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {orderInfo.paymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {status === "success" && (
              <Link
                to="/dashboard/myorders"
                className={`rounded-md px-6 py-3 text-center font-medium text-white shadow-sm transition-colors ${statusDisplay.buttonColor}`}
              >
                Xem đơn hàng của tôi
              </Link>
            )}

            {(status === "failed" || status === "error") && (
              <button
                onClick={() => navigate("/checkout")}
                className={`rounded-md px-6 py-3 font-medium text-white shadow-sm transition-colors ${statusDisplay.buttonColor}`}
              >
                Thử lại thanh toán
              </button>
            )}

            <Link
              to="/"
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              Về trang chủ
            </Link>
          </div>

          {/* Support Info */}
          {(status === "failed" || status === "error") && (
            <div className="mt-6 rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-800">
                Nếu bạn gặp vấn đề, vui lòng liên hệ với chúng tôi:
              </p>
              <p className="text-sm font-medium text-blue-900">
                📞 Hotline: 1900-xxxx | 📧 Email: support@yumora.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getOrderStatusText = (status) => {
  const statusTexts = {
    Processing: "Đang xử lý",
    Confirmed: "Đã xác nhận",
    Shipped: "Đang giao hàng",
    Delivered: "Đã giao hàng",
    Cancelled: "Đã hủy",
  };

  return statusTexts[status] || status;
};

export default PaymentResult;
