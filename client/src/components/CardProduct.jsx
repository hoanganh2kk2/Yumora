import React from "react";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { Link } from "react-router-dom";
import { validURLConvert } from "../utils/validURLConvert";

const CardProduct = ({ data }) => {
  const url = `/product/${validURLConvert(data.name)}-${data._id}`;
  return (
    <Link
      to={url}
      className="grid min-w-36 cursor-pointer gap-1 rounded border border-slate-200 bg-white py-2 lg:min-w-52 lg:gap-3 lg:p-4"
    >
      <div className="max-h-24 min-h-20 w-full overflow-hidden rounded lg:max-h-32">
        <img
          src={data.image[0]}
          className="h-full w-full object-scale-down lg:scale-125"
        />
      </div>
      <div className="w-fit rounded bg-green-50 p-[1px] px-2 text-xs text-green-600">
        10 min
      </div>
      <div className="line-clamp-2 px-2 text-sm font-medium text-ellipsis lg:px-0 lg:text-base">
        {data.name}
      </div>
      <div className="w-fit gap-1 px-2 text-sm lg:px-0 lg:text-base">
        {data.unit}
      </div>

      <div className="flex items-center justify-between gap-1 px-2 text-sm lg:gap-3 lg:px-0 lg:text-base">
        <div className="font-semibold">{DisplayPriceInRupees(data.price)}</div>
        <div className="">
          <button className="rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700 lg:px-4">
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CardProduct;
