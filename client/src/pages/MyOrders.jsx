import React from "react";
import { useSelector } from "react-redux";
import NoData from "../components/NoData";

const MyOrders = () => {
  const orders = useSelector((state) => state.orders.order);

  console.log("Danh sách đơn hàng:", orders);

  return (
    <div>
      <div className="bg-white p-3 font-semibold shadow-md">
        <h1>Đơn hàng của tôi</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <NoData />
      ) : (
        orders.map((order, index) => (
          <div
            key={order._id + index + "order"}
            className="order rounded border-b border-slate-200 p-4 text-sm"
          >
            <p>Mã đơn hàng: {order?.orderId}</p>
            <div className="mt-2 flex gap-3">
              <img
                src={order.product_details?.image?.[0] || "/default.png"}
                alt="Ảnh sản phẩm"
                className="h-14 w-14 object-cover"
              />
              <p className="font-medium">{order.product_details?.name}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
