import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../provider/GlobalProvider";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "./Loading";
import { useSelector } from "react-redux";
import { FaMinus, FaPlus } from "react-icons/fa6";

const AddToCartButton = ({ data }) => {
  const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const [isAvailableCart, setIsAvailableCart] = useState(false);
  const [qty, setQty] = useState(0);
  const [cartItemDetails, setCartItemsDetails] = useState();

  const handleADDToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);

      const response = await Axios({
        ...SummaryApi.addToCart,
        data: {
          productId: data?._id,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) {
          fetchCartItem();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  //checking this item in cart or not
  useEffect(() => {
    const checkingItem = cartItem.some(
      (item) => item.productId._id === data._id,
    );
    setIsAvailableCart(checkingItem);

    const product = cartItem.find((item) => item.productId._id === data._id);
    setQty(product?.quantity);
    setCartItemsDetails(product);
  }, [data, cartItem]);

  const increaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const response = await updateCartItem(cartItemDetails?._id, qty + 1);

    if (response.success) {
      toast.success("Đã thêm sản phẩm");
    }
  };

  const decreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (qty === 1) {
      deleteCartItem(cartItemDetails?._id);
    } else {
      const response = await updateCartItem(cartItemDetails?._id, qty - 1);

      if (response.success) {
        toast.success("Đã xóa sản phẩm");
      }
    }
  };
  return (
    <div className="w-full max-w-[150px]">
      {isAvailableCart ? (
        <div className="flex h-full w-full">
          <button
            onClick={decreaseQty}
            className="flex w-full flex-1 items-center justify-center rounded bg-green-600 p-1 text-white hover:bg-green-700"
          >
            <FaMinus />
          </button>
          <p className="flex w-full flex-1 items-center justify-center px-1 font-semibold">
            {qty}
          </p>
          <button
            onClick={increaseQty}
            className="flex w-full flex-1 items-center justify-center rounded bg-green-600 p-1 text-white hover:bg-green-700"
          >
            <FaPlus />
          </button>
        </div>
      ) : (
        <button
          onClick={handleADDToCart}
          className="rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700 lg:px-4"
        >
          {loading ? <Loading /> : "Thêm"}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;
