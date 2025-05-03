import React, { useState } from "react";
import { useGlobalContext } from "../provider/GlobalProvider";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import AddAddress from "../components/AddAddress";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import {loadStripe} from "@stripe/stripe-js";

const CheckoutPage = () => {
  const {
    notDiscountTotalPrice,
    totalPrice,
    totalQty,
    fetchCartItem,
    fetchOrder,
  } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector((state) => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector((state) => state.cartItem.cart);
  const navigate = useNavigate();

  const handleCashOnDelivery = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) {
          fetchCartItem();
        }
        if (fetchOrder) {
          fetchOrder();
        }
        navigate("/success", {
          state: {
            text: "Order",
          },
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      toast.loading("Loading...");
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      const stripePromise = await loadStripe(stripePublicKey);

      const response = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });
      const { data: responseData } = response;

      stripePromise.redirectToCheckout({ sessionId: responseData.id });

      if (fetchCartItem) {
        fetchCartItem();
      }
      if (fetchOrder) {
        fetchOrder();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };
  return (
    <section className="bg-blue-50">
      <div className="container mx-auto flex w-full flex-col justify-between gap-5 p-4 lg:flex-row">
        <div className="w-full">
          {/* address */}
          <h3 className="text-lg font-semibold">Chọn địa chỉ của bạn</h3>
          <div className="grid gap-4 bg-white p-2">
            {addressList.map((address, index) => {
              return (
                <label
                  htmlFor={"address" + index}
                  className={!address.status && "hidden"}
                >
                  <div className="flex gap-3 rounded border border-slate-200 p-3 hover:bg-blue-50">
                    <div>
                      <input
                        id={"address" + index}
                        type="radio"
                        value={index}
                        onChange={(e) => setSelectAddress(e.target.value)}
                        name="address"
                      />
                    </div>
                    <div>
                      <p>Địa chỉ chi tiết: {address.address_line}</p>
                      <p>Thành phố: {address.city}</p>
                      <p>Tỉnh/Bang: {address.state}</p>
                      <p>
                        Quốc gia:
                        {address.country} - {address.pincode}
                      </p>
                      <p>Số điện thoại: {address.mobile}</p>
                    </div>
                  </div>
                </label>
              );
            })}
            <div
              onClick={() => setOpenAddress(true)}
              className="flex h-16 cursor-pointer items-center justify-center border-2 border-dashed border-slate-200 bg-blue-50"
            >
              Thêm địa chỉ
            </div>
          </div>
        </div>

        <div className="w-full max-w-md bg-white px-2 py-4">
          {/* summary */}
          <h3 className="text-lg font-semibold">Tóm tắt</h3>
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
          <div className="flex w-full flex-col gap-4">
            <button
              className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
              onClick={handleOnlinePayment}
            >
              Thanh toán Online
            </button>
            <button
              className="border-2 border-green-600 px-4 py-2 font-semibold text-green-600 hover:bg-green-600 hover:text-white"
              onClick={handleCashOnDelivery}
            >
              Thanh toán khi nhận hàng
            </button>
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;
