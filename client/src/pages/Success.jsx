import React from "react";
import { Link, useLocation } from "react-router-dom";

const Success = () => {
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get("orderId");
  const message = location?.state?.text || "Đơn hàng đã được xác nhận";

  return (
    <div className="m-2 mx-auto flex w-full max-w-md flex-col items-center justify-center gap-5 rounded bg-green-200 p-4 py-5">
      <p className="text-center text-lg font-bold text-green-800">{message}</p>
      {orderId && (
        <p className="text-center text-green-700">
          Mã đơn hàng: <span className="font-medium">{orderId}</span>
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/dashboard/myorders"
          className="border border-green-900 px-4 py-1 text-green-900 transition-all hover:bg-green-900 hover:text-white"
        >
          Xem đơn hàng
        </Link>
        <Link
          to="/"
          className="border border-blue-700 px-4 py-1 text-blue-700 transition-all hover:bg-blue-700 hover:text-white"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default Success;
