import React from "react";

const CardLoading = () => {
  return (
    <div className="grid min-w-36 animate-pulse cursor-pointer gap-1 rounded border border-slate-200 bg-white py-2 lg:min-w-52 lg:gap-3 lg:p-4">
      <div className="min-h-24 rounded bg-blue-50"></div>
      <div className="w-20 rounded bg-blue-50 p-2 lg:p-3"></div>
      <div className="rounded bg-blue-50 p-2 lg:p-3"></div>
      <div className="w-14 rounded bg-blue-50 p-2 lg:p-3"></div>

      <div className="flex items-center justify-between gap-3">
        <div className="w-20 rounded bg-blue-50 p-2 lg:p-3"></div>
        <div className="w-20 rounded bg-blue-50 p-2 lg:p-3"></div>
      </div>
    </div>
  );
};

export default CardLoading;
