import React from "react";
import { Link, useLocation } from "react-router-dom";

const Success = () => {
  const location = useLocation();
  const message = location?.state?.text || "Thanh toán";

  console.log(location); // Hiển thị thông tin vị trí để debug nếu cần

  return (
    <div className="m-2 mx-auto flex w-full max-w-md flex-col items-center justify-center gap-5 rounded bg-green-200 p-4 py-5">
      <p className="text-center text-lg font-bold text-green-800">
        {message} thành công
      </p>
      <Link
        to="/"
        className="border border-green-900 px-4 py-1 text-green-900 transition-all hover:bg-green-900 hover:text-white"
      >
        Về trang chủ
      </Link>
    </div>
  );
};

export default Success;
