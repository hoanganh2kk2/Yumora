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

  // Lấy thông tin từ URL
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");
  const responseCode = queryParams.get("vnp_ResponseCode");
  const isSuccess = responseCode === "00" || !responseCode; // Nếu không có mã, giả định là thành công

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
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Trường hợp lỗi hoặc hủy
  if (!isSuccess && !loading) {
    return (
      <div className="m-2 mx-auto flex w-full max-w-md flex-col items-center justify-center gap-5 rounded bg-red-200 p-4 py-5">
        <p className="text-center text-lg font-bold text-red-800">
          Thanh toán không thành công
        </p>
        <Link
          to="/dashboard/myorders"
          className="border border-red-900 px-4 py-1 text-red-900 transition-all hover:bg-red-900 hover:text-white"
        >
          Xem đơn hàng của tôi
        </Link>
      </div>
    );
  }

  // Trường hợp thành công
  return (
    <div className="container mx-auto my-8 max-w-2xl px-4">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-green-50 p-6 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 p-2 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800">
              Thanh toán thành công!
            </h2>
            {orderId && (
              <p className="mt-2 text-gray-600">
                Mã đơn hàng: <span className="font-semibold">{orderId}</span>
              </p>
            )}
            {paymentStatus && (
              <p className="mt-1 text-gray-600">
                Trạng thái thanh toán:{" "}
                <span
                  className={`font-semibold ${
                    paymentStatus === "Paid"
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {paymentStatus === "Paid" ? "Đã thanh toán" : "Chờ xác nhận"}
                </span>
              </p>
            )}
          </div>

          <div className="p-6">
            <p className="text-center text-gray-700">
              Cảm ơn bạn đã đặt hàng tại Yumora. Đơn hàng của bạn đang được xử
              lý.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/dashboard/myorders"
                className="rounded-md bg-green-600 px-6 py-2 text-center font-medium text-white shadow-sm transition-colors hover:bg-green-700"
              >
                Xem đơn hàng của tôi
              </Link>
              <Link
                to="/"
                className="rounded-md border border-gray-300 bg-white px-6 py-2 text-center font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentResult;
