import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../provider/GlobalProvider";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import AddAddress from "../components/AddAddress";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { useNavigate } from "react-router-dom";
import { priceWithDiscount } from "../utils/PriceWithDiscount";
import Loading from "../components/Loading";

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem } =
    useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector((state) => state.addresses.addressList);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const cartItems = useSelector((state) => state.cartItem.cart);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Chọn địa chỉ đầu tiên mặc định nếu có
    if (addressList.length > 0) {
      const defaultAddress = addressList.find((addr) => addr.status);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      }
    }
  }, [addressList]);

  const handleProcessOrder = async (paymentMethod) => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      return;
    }

    try {
      setLoadingCheckout(true);

      // Chuẩn bị dữ liệu sản phẩm từ giỏ hàng
      const products = cartItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: priceWithDiscount(item.productId.price, item.productId.discount),
        name: item.productId.name,
        image: item.productId.image,
      }));

      const response = await Axios({
        ...SummaryApi.createOrder,
        data: {
          addressId: selectedAddressId,
          paymentMethod: paymentMethod,
          products: products,
        },
      });

      if (response.data.success) {
        toast.success("Đặt hàng thành công!");
        fetchCartItem(); // Làm mới giỏ hàng
        navigate("/dashboard/myorders");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <section className="bg-blue-50">
      <div className="container mx-auto flex w-full flex-col justify-between gap-5 p-4 lg:flex-row">
        <div className="w-full">
          {/* address */}
          <h3 className="text-lg font-semibold">Chọn địa chỉ của bạn</h3>
          <div className="grid gap-4 bg-white p-2">
            {addressList.filter((address) => address.status).length === 0 && (
              <p className="p-4 text-center text-red-500">
                Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ.
              </p>
            )}

            {addressList.map((address, index) => {
              return (
                <label
                  key={address._id || index}
                  htmlFor={"address" + index}
                  className={!address.status ? "hidden" : ""}
                >
                  <div
                    className={`flex gap-3 rounded border p-3 ${selectedAddressId === address._id ? "border-green-500 bg-green-50" : "border-slate-200 hover:bg-blue-50"}`}
                  >
                    <div>
                      <input
                        id={"address" + index}
                        type="radio"
                        value={address._id}
                        checked={selectedAddressId === address._id}
                        onChange={() => setSelectedAddressId(address._id)}
                        name="address"
                      />
                    </div>
                    <div>
                      <p>Địa chỉ chi tiết: {address.address_line}</p>
                      <p>Thành phố: {address.city}</p>
                      <p>Tỉnh/Bang: {address.state}</p>
                      <p>
                        Quốc gia: {address.country} - {address.pincode}
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
              <p className="flex items-center gap-2">{totalQty} sản phẩm</p>
            </div>
            <div className="ml-1 flex justify-between gap-4">
              <p>Phí giao hàng</p>
              <p className="flex items-center gap-2">Miễn phí</p>
            </div>
            <div className="flex items-center justify-between gap-4 font-semibold">
              <p>Tổng cộng</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
          </div>
          <div className="mt-4 flex w-full flex-col gap-4">
            <button
              onClick={() => handleProcessOrder("Online")}
              disabled={
                loadingCheckout || !selectedAddressId || cartItems.length === 0
              }
              className={`rounded ${
                loadingCheckout || !selectedAddressId || cartItems.length === 0
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-green-600 hover:bg-green-700"
              } px-4 py-3 font-semibold text-white`}
            >
              {loadingCheckout ? <Loading /> : "Thanh toán Online"}
            </button>

            <button
              onClick={() => handleProcessOrder("COD")}
              disabled={
                loadingCheckout || !selectedAddressId || cartItems.length === 0
              }
              className={`border-2 ${
                loadingCheckout || !selectedAddressId || cartItems.length === 0
                  ? "cursor-not-allowed border-gray-400 text-gray-400"
                  : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              } px-4 py-3 font-semibold`}
            >
              {loadingCheckout ? <Loading /> : "Thanh toán khi nhận hàng"}
            </button>
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;
