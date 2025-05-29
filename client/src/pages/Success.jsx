import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import Loading from "../components/Loading";

const Success = () => {
  const location = useLocation();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy thông tin từ URL hoặc state
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("orderId");
  const message = location?.state?.text || "Đặt hàng thành công!";

  useEffect(() => {
    if (orderId) {
      fetchOrderInfo(orderId);
    }
  }, [orderId]);

  const fetchOrderInfo = async (id) => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.checkPaymentStatus,
        url: `${SummaryApi.checkPaymentStatus.url}/${id}`,
      });

      if (response.data.success) {
        setOrderInfo(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order info:", error);
      // Không hiển thị lỗi ở đây vì đây là trang thành công
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 max-w-2xl px-4">
      <div className="overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Success Header */}
        <div className="border-b border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto mb-4 text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-green-800">{message}</h2>
          {orderId && (
            <p className="mt-2 text-lg text-gray-600">
              Mã đơn hàng:{" "}
              <span className="font-semibold text-green-700">{orderId}</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="mb-6 text-center text-lg text-gray-700">
            Cảm ơn bạn đã tin tưởng và mua sắm tại Yumora. Đơn hàng của bạn đang
            được xử lý và sẽ được giao đến bạn sớm nhất!
          </p>

          {/* Loading State */}
          {loading && (
            <div className="mb-6 flex justify-center">
              <Loading />
            </div>
          )}

          {/* Order Information */}
          {orderInfo && !loading && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-800">
                Thông tin đơn hàng:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-medium">
                    {orderInfo.paymentMethod === "Online"
                      ? "Thanh toán trực tuyến VNPay"
                      : "Thanh toán khi nhận hàng (COD)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái thanh toán:</span>
                  <span
                    className={`font-medium ${
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái đơn hàng:</span>
                  <span className="font-medium text-blue-600">
                    {getOrderStatusText(orderInfo.orderStatus)}
                  </span>
                </div>
                {orderInfo.paymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-medium text-gray-800">
                      {orderInfo.paymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <h3 className="mb-3 font-semibold text-blue-800">
              Quy trình xử lý đơn hàng:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span>Đơn hàng đã được đặt thành công</span>
              </div>
              <div className="flex items-center text-blue-600">
                <span className="mr-2">🔄</span>
                <span>Đang xử lý và chuẩn bị hàng</span>
              </div>
              <div className="flex items-center text-gray-500">
                <span className="mr-2">📦</span>
                <span>Đóng gói và bàn giao vận chuyển</span>
              </div>
              <div className="flex items-center text-gray-500">
                <span className="mr-2">🚚</span>
                <span>Đang giao hàng</span>
              </div>
              <div className="flex items-center text-gray-500">
                <span className="mr-2">🏠</span>
                <span>Giao hàng thành công</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/dashboard/myorders"
              className="rounded-md bg-green-600 px-6 py-3 text-center font-medium text-white shadow-sm transition-colors hover:bg-green-700"
            >
              Xem đơn hàng của tôi
            </Link>
            <Link
              to="/"
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Thank You Message */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              🙏 Cảm ơn bạn đã lựa chọn Yumora!
            </p>
            <p className="text-sm text-gray-600">
              💬 Nếu có thắc mắc, vui lòng liên hệ:
              <span className="font-medium"> 1900-xxxx</span>
            </p>
          </div>
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

export default Success;
