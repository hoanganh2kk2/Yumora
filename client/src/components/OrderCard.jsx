import React from "react";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Component hiển thị các trạng thái đơn hàng với màu sắc tương ứng
export const OrderStatusBadge = ({ status }) => {
  const getStatusColor = (orderStatus) => {
    switch (orderStatus) {
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Delivered":
        return "bg-emerald-100 text-emerald-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (orderStatus) => {
    switch (orderStatus) {
      case "Processing":
        return "Đang xử lý";
      case "Confirmed":
        return "Đã xác nhận";
      case "Shipped":
        return "Đang giao hàng";
      case "Delivered":
        return "Đã giao hàng";
      case "Cancelled":
        return "Đã hủy";
      default:
        return orderStatus;
    }
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
        status,
      )}`}
    >
      {getStatusText(status)}
    </span>
  );
};

// Component hiển thị trạng thái thanh toán
export const PaymentStatusBadge = ({ status }) => {
  const getStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      case "Refunded":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case "Pending":
        return "Chờ thanh toán";
      case "Paid":
        return "Đã thanh toán";
      case "Failed":
        return "Thanh toán thất bại";
      case "Refunded":
        return "Đã hoàn tiền";
      default:
        return paymentStatus;
    }
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
        status,
      )}`}
    >
      {getStatusText(status)}
    </span>
  );
};

// Component hiển thị thông tin phương thức thanh toán
export const PaymentMethodBadge = ({ method }) => {
  const getMethodColor = (paymentMethod) => {
    switch (paymentMethod) {
      case "COD":
        return "bg-amber-100 text-amber-700";
      case "Online":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getMethodText = (paymentMethod) => {
    switch (paymentMethod) {
      case "COD":
        return "Thanh toán khi nhận hàng";
      case "Online":
        return "Thanh toán trực tuyến";
      default:
        return paymentMethod;
    }
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${getMethodColor(
        method,
      )}`}
    >
      {getMethodText(method)}
    </span>
  );
};

// Component hiển thị thẻ đơn hàng trong danh sách
const OrderCard = ({ order }) => {
  const { orderId, createdAt, status, items, totalAmount } = order;

  // Hiển thị tối đa 3 sản phẩm, còn lại sẽ hiện "+X sản phẩm khác"
  const displayItems = items.slice(0, 3);
  const remainingItems = items.length - 3;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-semibold">Đơn hàng #{orderId}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      <div className="border-t border-gray-100 pt-3 pb-2">
        {displayItems.map((item, index) => (
          <div key={index} className="mb-2 flex items-center gap-2">
            <div className="h-10 w-10 overflow-hidden rounded border border-gray-200 bg-gray-50">
              {item.product_details?.image && item.product_details.image[0] && (
                <img
                  src={item.product_details.image[0]}
                  alt={item.product_details.name}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <p className="line-clamp-1 text-sm">{item.product_details?.name}</p>
          </div>
        ))}

        {remainingItems > 0 && (
          <p className="mb-2 ml-12 text-sm text-gray-500">
            +{remainingItems} sản phẩm khác
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
        <span className="font-medium">Tổng cộng:</span>
        <span className="font-semibold text-green-700">
          {DisplayPriceInRupees(totalAmount)}
        </span>
      </div>

      <div className="mt-3 text-right">
        <Link
          to={`/dashboard/order-detail/${orderId}`}
          className="text-sm font-medium text-green-600 hover:text-green-700"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
