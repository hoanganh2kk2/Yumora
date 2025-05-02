import React from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../provider/GlobalProvider";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import AddToCartButton from "./AddToCartButton";
import { priceWithDiscount } from "../utils/PriceWithDiscount";
import imageEmpty from "../assets/empty_cart.webp";
import toast from "react-hot-toast";

const DisplayCartItem = ({ close }) => {
  const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext();
  console.log(notDiscountTotalPrice);
  
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const redirectToCheckoutPage = () => {
    if (user?._id) {
      navigate("/checkout");
      if (close) {
        close();
      }
      return;
    }
    toast("Please Login");
  };
  return (
    <section className="fixed top-0 right-0 bottom-0 left-0 z-50 bg-neutral-900/70">
      <div className="ml-auto max-h-screen min-h-screen w-full max-w-sm bg-white">
        <div className="flex items-center justify-between gap-3 p-4 shadow-md">
          <h2 className="font-semibold">Giỏ hàng</h2>
          <Link to={"/"} className="lg:hidden">
            <IoClose size={25} />
          </Link>
          <button onClick={close} className="hidden lg:block">
            <IoClose size={25} />
          </button>
        </div>

        <div className="flex h-full max-h-[calc(100vh-150px)] min-h-[75vh] flex-col gap-4 bg-blue-50 p-2 lg:min-h-[80vh]">
          {/***display items */}
          {cartItem[0] ? (
            <>
              <div className="flex items-center justify-between rounded-full bg-blue-100 px-4 py-2 text-blue-500">
                <p>Bạn đã tiết kiệm được:</p>
                <p>
                  {DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}
                </p>
              </div>
              <div className="grid gap-5 overflow-auto rounded-lg bg-white p-4">
                {cartItem[0] &&
                  cartItem.map((item, index) => {
                    return (
                      <div
                        key={item?._id + "cartItemDisplay"}
                        className="flex w-full gap-4"
                      >
                        <div className="h-16 min-h-16 w-16 min-w-16 rounded border border-slate-200 bg-red-500">
                          <img
                            src={item?.productId?.image[0]}
                            className="object-scale-down"
                          />
                        </div>
                        <div className="w-full max-w-sm text-xs">
                          <p className="line-clamp-2 text-xs text-ellipsis">
                            {item?.productId?.name}
                          </p>
                          <p className="text-neutral-400">
                            {item?.productId?.unit}
                          </p>
                          <p className="font-semibold">
                            {DisplayPriceInRupees(
                              priceWithDiscount(
                                item?.productId?.price,
                                item?.productId?.discount,
                              ),
                            )}
                          </p>
                        </div>
                        <div>
                          <AddToCartButton data={item?.productId} />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="bg-white p-4">
                <h3 className="font-semibold">Chi tiết hóa đơn</h3>
                <div className="ml-1 flex justify-between gap-4">
                  <p>Tổng số sản phẩm</p>
                  <p className="flex items-center gap-2">
                    <span className="text-neutral-400 line-through">
                      {DisplayPriceInRupees(notDiscountTotalPrice)}
                    </span>
                    <span>{DisplayPriceInRupees(totalPrice)}</span>
                  </p>
                </div>
                <div className="ml-1 flex justify-between gap-4">
                  <p>Tổng số lượng</p>
                  <p className="flex items-center gap-2">{totalQty} item</p>
                </div>
                <div className="ml-1 flex justify-between gap-4">
                  <p>Phí giao hàng</p>
                  <p className="flex items-center gap-2">Free</p>
                </div>
                <div className="flex items-center justify-between gap-4 font-semibold">
                  <p>Tổng cộng</p>
                  <p>{DisplayPriceInRupees(totalPrice)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white">
              <img
                src={imageEmpty}
                className="h-full w-full object-scale-down"
              />
              <Link
                onClick={close}
                to={"/"}
                className="block rounded bg-green-600 px-4 py-2 text-white"
              >
                Mua ngay
              </Link>
            </div>
          )}
        </div>

        {cartItem[0] && (
          <div className="p-2">
            <div className="static bottom-3 flex items-center justify-between gap-4 rounded bg-green-700 px-4 py-4 text-base font-bold text-neutral-100">
              <div>{DisplayPriceInRupees(totalPrice)}</div>
              <button
                onClick={redirectToCheckoutPage}
                className="flex items-center gap-1"
              >
                Thanh toán
                <span>
                  <FaCaretRight />
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DisplayCartItem;
