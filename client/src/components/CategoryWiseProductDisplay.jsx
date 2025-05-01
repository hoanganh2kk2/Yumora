import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AxiosToastError from "../utils/AxiosToastError";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import CardLoading from "./CardLoading";
import CardProduct from "./CardProduct";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { validURLConvert } from "../utils/validURLConvert";

const CategoryWiseProductDisplay = ({ id, name }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef();
  const subCategoryData = useSelector((state) => state.product.allSubCategory);
  const loadingCardNumber = new Array(6).fill(null);

  const fetchCategoryWiseProduct = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductByCategory,
        data: {
          id: id,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryWiseProduct();
  }, []);

  const handleScrollRight = () => {
    containerRef.current.scrollLeft += 200;
  };

  const handleScrollLeft = () => {
    containerRef.current.scrollLeft -= 200;
  };

  const handleRedirectProductListPage = () => {
    const subcategory = subCategoryData.find((sub) => {
      const filterData = sub.category.some((c) => {
        return c._id == id;
      });

      return filterData ? true : null;
    });
    const url = `/${validURLConvert(name)}-${id}/${validURLConvert(subcategory?.name)}-${subcategory?._id}`;

    return url;
  };

  const redirectURL = handleRedirectProductListPage();
  return (
    <div>
      <div className="container mx-auto flex items-center justify-between gap-4 p-4">
        <h3 className="text-lg font-semibold md:text-xl">{name}</h3>
        <Link to={redirectURL} className="text-green-600 hover:text-green-400">
          Xem tất cả
        </Link>
      </div>
      <div className="relative flex items-center">
        <div
          className="scrollbar-none container mx-auto flex gap-4 overflow-x-scroll scroll-smooth px-4 md:gap-6 lg:gap-8"
          ref={containerRef}
        >
          {loading &&
            loadingCardNumber.map((_, index) => {
              return (
                <CardLoading key={"CategoryWiseProductDisplay123" + index} />
              );
            })}

          {data.map((p, index) => {
            return (
              <CardProduct
                data={p}
                key={p._id + "CategoryWiseProductDisplay" + index}
              />
            );
          })}
        </div>
        <div className="absolute right-0 left-0 container mx-auto hidden w-full justify-between px-2 lg:flex">
          <button
            onClick={handleScrollLeft}
            className="relative z-10 rounded-full bg-white p-2 text-lg shadow-lg hover:bg-gray-100"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={handleScrollRight}
            className="relative z-10 rounded-full bg-white p-2 text-lg shadow-lg hover:bg-gray-100"
          >
            <FaAngleRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryWiseProductDisplay;
