import React from "react";
import { Link } from "react-router-dom";

const Cancel = () => {
  return (
    <div className="m-2 mx-auto flex w-full max-w-md flex-col items-center justify-center gap-5 rounded bg-red-200 p-4 py-5">
      <p className="text-center text-lg font-bold text-red-800">
        Đã hủy đơn hàng
      </p>
      <Link
        to="/"
        className="border border-red-900 px-4 py-1 text-red-900 transition-all hover:bg-red-900 hover:text-white"
      >
        Về trang chủ
      </Link>
    </div>
  );
};

export default Cancel;
