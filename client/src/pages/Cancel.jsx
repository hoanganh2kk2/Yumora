import React from "react";
import { Link, useLocation } from "react-router-dom";

const Cancel = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get("error");
  const code = searchParams.get("code");

  // Tạo thông báo lỗi dựa trên mã lỗi từ VNPay (nếu có)
  let errorMessage = "Đã hủy đơn hàng";

  if (error === "payment_failed") {
    errorMessage = "Thanh toán không thành công";
    if (code) {
      // Các mã lỗi phổ biến từ VNPay
      switch (code) {
        case "24":
          errorMessage =
            "Giao dịch không thành công do: Khách hàng hủy giao dịch";
          break;
        case "51":
          errorMessage =
            "Giao dịch không thành công do: Tài khoản không đủ số dư";
          break;
        case "99":
          errorMessage = "Lỗi không xác định";
          break;
        default:
          errorMessage = `Thanh toán không thành công (Mã lỗi: ${code})`;
      }
    }
  } else if (error === "order_not_found") {
    errorMessage = "Không tìm thấy thông tin đơn hàng";
  } else if (error === "system_error") {
    errorMessage = "Lỗi hệ thống, vui lòng liên hệ với chúng tôi";
  }

  return (
    <div className="m-2 mx-auto flex w-full max-w-md flex-col items-center justify-center gap-5 rounded bg-red-200 p-4 py-5">
      <p className="text-center text-lg font-bold text-red-800">
        {errorMessage}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/dashboard/myorders"
          className="border border-red-900 px-4 py-1 text-red-900 transition-all hover:bg-red-900 hover:text-white"
        >
          Xem đơn hàng
        </Link>
        <Link
          to="/"
          className="border border-blue-700 px-4 py-1 text-blue-700 transition-all hover:bg-blue-700 hover:text-white"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default Cancel;
