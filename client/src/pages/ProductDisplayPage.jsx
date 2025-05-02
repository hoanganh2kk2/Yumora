import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import Divider from "../components/Divider";
import image1 from "../assets/minute_delivery.png";
import image2 from "../assets/Best_Prices_Offers.png";
import image3 from "../assets/Wide_Assortment2.png";
import { priceWithDiscount } from "../utils/PriceWithDiscount";
import AddToCartButton from "../components/AddToCartButton";
// import AddToCartButton from "../components/AddToCartButton";

const ProductDisplayPage = () => {
  const params = useParams();
  let productId = params?.product?.split("-")?.slice(-1)[0];
  const [data, setData] = useState({
    name: "",
    image: [],
  });
  const [image, setImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const imageContainer = useRef();

  const fetchProductDetails = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId,
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
    fetchProductDetails();
  }, [params]);

  const handleScrollRight = () => {
    imageContainer.current.scrollLeft += 100;
  };
  const handleScrollLeft = () => {
    imageContainer.current.scrollLeft -= 100;
  };
  console.log("product data", data);
  return (
    <section className="container mx-auto grid p-4 lg:grid-cols-2">
      <div className="">
        <div className="h-full max-h-56 min-h-56 w-full rounded bg-white lg:max-h-[65vh] lg:min-h-[65vh]">
          <img
            src={data.image[image]}
            className="h-full w-full object-scale-down"
          />
        </div>
        <div className="my-2 flex items-center justify-center gap-3">
          {data.image.map((img, index) => {
            return (
              <div
                key={img + index + "point"}
                className={`h-3 w-3 rounded-full bg-slate-200 lg:h-5 lg:w-5 ${index === image && "bg-slate-300"}`}
              ></div>
            );
          })}
        </div>
        <div className="relative grid">
          <div
            ref={imageContainer}
            className="scrollbar-none relative z-10 flex w-full gap-4 overflow-x-auto"
          >
            {data.image.map((img, index) => {
              return (
                <div
                  className="scr h-20 min-h-20 w-20 min-w-20 cursor-pointer shadow-md"
                  key={img + index}
                >
                  <img
                    src={img}
                    alt="min-product"
                    onClick={() => setImage(index)}
                    className="h-full w-full object-scale-down"
                  />
                </div>
              );
            })}
          </div>
          <div className="absolute -ml-3 hidden h-full w-full items-center justify-between lg:flex">
            <button
              onClick={handleScrollLeft}
              className="relative z-10 rounded-full bg-white p-1 shadow-lg"
            >
              <FaAngleLeft />
            </button>
            <button
              onClick={handleScrollRight}
              className="relative z-10 rounded-full bg-white p-1 shadow-lg"
            >
              <FaAngleRight />
            </button>
          </div>
        </div>
        <div></div>

        <div className="my-4 hidden gap-3 lg:grid">
          <div>
            <p className="font-semibold">Miêu tả</p>
            <p className="text-base">{data.description}</p>
          </div>
          <div>
            <p className="font-semibold">Khối lượng</p>
            <p className="text-base">{data.unit}</p>
          </div>
          {data?.more_details &&
            Object.keys(data?.more_details).map((element, index) => {
              return (
                <div>
                  <p className="font-semibold">{element}</p>
                  <p className="text-base">{data?.more_details[element]}</p>
                </div>
              );
            })}
        </div>
      </div>

      <div className="p-4 text-base lg:pl-7 lg:text-lg">
        <p className="w-fit rounded-full bg-green-300 px-2">10 phút</p>
        <h2 className="text-lg font-semibold lg:text-3xl">{data.name}</h2>
        <p className="">{data.unit}</p>
        <Divider />
        <div>
          <p className="">Giá</p>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="w-fit rounded border border-green-600 bg-green-50 px-4 py-2">
              <p className="text-lg font-semibold lg:text-xl">
                {DisplayPriceInRupees(
                  priceWithDiscount(data.price, data.discount),
                )}
              </p>
            </div>
            {data.discount && (
              <p className="line-through">{DisplayPriceInRupees(data.price)}</p>
            )}
            {data.discount && (
              <p className="font-bold text-green-600 lg:text-2xl">
                <span className="text-base text-neutral-500">Giảm giá </span>
                {data.discount}%
              </p>
            )}
          </div>
        </div>

        {data.stock === 0 ? (
          <p className="my-2 text-lg text-red-500">Hết hàng</p>
        ) : (
          <div className="my-4">
            <AddToCartButton data={data} />
          </div>
        )}

        <h2 className="font-semibold">Tại sao nên mua sắm tại Yumora? </h2>
        <div>
          <div className="my-4 flex items-center gap-4">
            <img src={image1} alt="superfast delivery" className="h-20 w-20" />
            <div className="text-sm">
              <div className="font-semibold">Giao hàng siêu nhanh</div>
              <p>
                Nhận đơn hàng được giao đến tận nhà sớm nhất từ các cửa hàng tối
                gần bạn.
              </p>
            </div>
          </div>
          <div className="my-4 flex items-center gap-4">
            <img src={image2} alt="Best prices offers" className="h-20 w-20" />
            <div className="text-sm">
              <div className="font-semibold">Giá tốt nhất và nhiều ưu đãi</div>
              <p>
                Điểm đến có giá tốt nhất với các ưu đãi trực tiếp từ nhà sản
                xuất.
              </p>
            </div>
          </div>
          <div className="my-4 flex items-center gap-4">
            <img src={image3} alt="Wide Assortment" className="h-20 w-20" />
            <div className="text-sm">
              <div className="font-semibold">Nhiều mặt hàng</div>
              <p>
              Chọn từ hơn 5000 sản phẩm trong danh mục thực phẩm, chăm sóc cá nhân, gia dụng
              & các danh mục khác.
              </p>
            </div>
          </div>
        </div>

        {/****only mobile */}
        <div className="my-4 grid gap-3">
          <div>
            <p className="font-semibold">Miêu tả</p>
            <p className="text-base">{data.description}</p>
          </div>
          <div>
            <p className="font-semibold">Khối lượng</p>
            <p className="text-base">{data.unit}</p>
          </div>
          {data?.more_details &&
            Object.keys(data?.more_details).map((element, index) => {
              return (
                <div>
                  <p className="font-semibold">{element}</p>
                  <p className="text-base">{data?.more_details[element]}</p>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default ProductDisplayPage;
