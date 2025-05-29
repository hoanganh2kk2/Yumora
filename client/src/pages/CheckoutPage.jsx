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
  const [paymentMethod, setPaymentMethod] = useState("");
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!user?._id) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      navigate("/login");
      return;
    }

    // Kiểm tra giỏ hàng
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      navigate("/");
      return;
    }

    // Chọn địa chỉ đầu tiên mặc định
    if (addressList.length > 0) {
      const defaultAddress = addressList.find((addr) => addr.status);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      }
    }
  }, [addressList, user, cartItems, navigate]);

  const validateOrder = () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return false;
    }

    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return false;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      return false;
    }

    return true;
  };

  const prepareOrderData = () => {
    return cartItems.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: priceWithDiscount(item.productId.price, item.productId.discount),
      name: item.productId.name,
      image: item.productId.image,
    }));
  };

  const handleCreateOrder = async () => {
    if (!validateOrder()) return;

    try {
      setLoadingCheckout(true);

      const products = prepareOrderData();

      const response = await Axios({
        ...SummaryApi.createOrder,
        data: {
          addressId: selectedAddressId,
          paymentMethod: paymentMethod,
          products: products,
        },
      });

      if (response.data.success) {
        const orderData = response.data.data;

        if (paymentMethod === "Online") {
          // Chuyển đến trang thanh toán VNPay
          if (orderData.paymentUrl) {
            window.location.href = orderData.paymentUrl;
          } else {
            toast.error("Không thể tạo liên kết thanh toán");
          }
        } else {
          // COD - chuyển đến trang thành công
          toast.success("Đặt hàng thành công!");
          fetchCartItem(); // Làm mới giỏ hàng
          navigate(`/success?orderId=${orderData.orderId}`);
        }
      }
    } catch (error) {
      console.error("Order creation error:", error);
      AxiosToastError(error);
    } finally {
      setLoadingCheckout(false);
    }
  };

  if (!user?._id) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">Vui lòng đăng nhập để tiếp tục</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">Giỏ hàng của bạn đang trống</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-blue-50">
      <div className="container mx-auto flex w-full flex-col justify-between gap-5 p-4 lg:flex-row">
        {/* Left Column - Address & Payment */}
        <div className="w-full lg:flex-1">
          {/* Address Section */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">
              Chọn địa chỉ giao hàng
            </h3>
            <div className="grid gap-4 rounded-lg bg-white p-4 shadow">
              {addressList.filter((address) => address.status).length === 0 ? (
                <p className="p-4 text-center text-red-500">
                  Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ.
                </p>
              ) : (
                addressList
                  .filter((address) => address.status)
                  .map((address, index) => (
                    <label
                      key={address._id || index}
                      htmlFor={`address${index}`}
                      className="cursor-pointer"
                    >
                      <div
                        className={`flex gap-3 rounded border p-4 transition-colors ${
                          selectedAddressId === address._id
                            ? "border-green-500 bg-green-50"
                            : "border-slate-200 hover:bg-blue-50"
                        }`}
                      >
                        <div className="pt-1">
                          <input
                            id={`address${index}`}
                            type="radio"
                            value={address._id}
                            checked={selectedAddressId === address._id}
                            onChange={() => setSelectedAddressId(address._id)}
                            name="address"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {address.address_line}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.city}, {address.state}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.country} - {address.pincode}
                          </div>
                          <div className="text-sm text-gray-600">
                            Số điện thoại: {address.mobile}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))
              )}

              <button
                onClick={() => setOpenAddress(true)}
                className="flex h-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-blue-50 transition-colors hover:bg-blue-100"
              >
                <span className="font-medium text-blue-600">
                  + Thêm địa chỉ mới
                </span>
              </button>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">
              Chọn phương thức thanh toán
            </h3>
            <div className="space-y-3 rounded-lg bg-white p-4 shadow">
              <label className="cursor-pointer">
                <div
                  className={`flex items-center gap-3 rounded border p-4 transition-colors ${
                    paymentMethod === "COD"
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 hover:bg-blue-50"
                  }`}
                >
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    name="paymentMethod"
                    className="text-green-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      Thanh toán khi nhận hàng (COD)
                    </div>
                    <div className="text-sm text-gray-600">
                      Thanh toán bằng tiền mặt khi nhận được hàng
                    </div>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </label>

              <label className="cursor-pointer">
                <div
                  className={`flex items-center gap-3 rounded border p-4 transition-colors ${
                    paymentMethod === "Online"
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 hover:bg-blue-50"
                  }`}
                >
                  <input
                    type="radio"
                    value="Online"
                    checked={paymentMethod === "Online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    name="paymentMethod"
                    className="text-green-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      Thanh toán trực tuyến VNPay
                    </div>
                    <div className="text-sm text-gray-600">
                      Thanh toán qua thẻ ATM, Internet Banking, QR Code
                    </div>
                  </div>
                  <div className="text-2xl">💳</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="h-fit w-full max-w-md rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Tóm tắt đơn hàng</h3>

          {/* Cart Items */}
          <div className="mb-4 max-h-60 overflow-y-auto">
            <h4 className="mb-2 font-medium text-gray-700">
              Sản phẩm ({totalQty})
            </h4>
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center gap-3 border-b border-gray-100 py-2"
                >
                  <div className="h-12 w-12 overflow-hidden rounded bg-gray-100">
                    {item.productId?.image?.[0] && (
                      <img
                        src={item.productId.image[0]}
                        alt={item.productId.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.productId?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x{" "}
                      {DisplayPriceInRupees(
                        priceWithDiscount(
                          item.productId?.price,
                          item.productId?.discount,
                        ),
                      )}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {DisplayPriceInRupees(
                      priceWithDiscount(
                        item.productId?.price,
                        item.productId?.discount,
                      ) * item.quantity,
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính:</span>
              <span className="text-gray-500 line-through">
                {DisplayPriceInRupees(notDiscountTotalPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Sau giảm giá:</span>
              <span className="font-medium">
                {DisplayPriceInRupees(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Phí giao hàng:</span>
              <span className="text-green-600">Miễn phí</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-green-600">
                  {DisplayPriceInRupees(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleCreateOrder}
            disabled={loadingCheckout || !selectedAddressId || !paymentMethod}
            className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
              loadingCheckout || !selectedAddressId || !paymentMethod
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loadingCheckout ? (
              <div className="flex items-center justify-center gap-2">
                <Loading />
                <span>Đang xử lý...</span>
              </div>
            ) : (
              `Đặt hàng - ${DisplayPriceInRupees(totalPrice)}`
            )}
          </button>

          {/* Security Info */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>🔒 Thông tin của bạn được bảo mật</p>
            <p>✅ Đảm bảo giao hàng an toàn</p>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;
