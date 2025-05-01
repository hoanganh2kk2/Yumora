import React from "react";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { Link } from "react-router-dom";
import { validURLConvert } from "../utils/validURLConvert";
import { priceWithDiscount } from "../utils/PriceWithDiscount";

const CardProduct = ({ data }) => {
  const url = `/product/${validURLConvert(data.name)}-${data._id}`;
  return (
    <Link
      to={url}
      className="grid w-full max-w-[180px] cursor-pointer gap-2 rounded border border-slate-200 bg-white p-2 sm:max-w-[200px] md:max-w-[220px] lg:max-w-[240px] xl:max-w-[260px]"
    >
      <div className="max-h-24 min-h-20 w-full overflow-hidden rounded lg:max-h-32">
        <img
          src={data.image[0]}
          alt={data.name}
          className="h-full w-full object-scale-down lg:scale-125"
        />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-fit rounded bg-green-50 p-[1px] px-2 text-xs text-green-600">
          10 phút
        </div>
        <div>
          {Boolean(data.discount) && (
            <p className="w-fit rounded-full bg-green-100 px-2 text-xs text-green-600">
              Giảm giá {data.discount}%
            </p>
          )}
        </div>
      </div>
      <div className="line-clamp-2 px-2 text-sm font-medium text-ellipsis lg:px-0 lg:text-base">
        {data.name}
      </div>
      <div className="w-fit gap-1 px-2 text-sm lg:px-0 lg:text-base">
        {data.unit}
      </div>

      <div className="flex items-center justify-between gap-1 px-2 text-sm lg:gap-3 lg:px-0 lg:text-base">
        <div className="flex items-center gap-1">
          <div className="font-semibold">
            {DisplayPriceInRupees(priceWithDiscount(data.price, data.discount))}
          </div>
        </div>
        <div className="">
          {data.stock == 0 ? (
            <p className="text-center text-sm text-red-500">Hết hàng</p>
          ) : (
            <button className="rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700 lg:px-4">
              Thêm
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CardProduct;
