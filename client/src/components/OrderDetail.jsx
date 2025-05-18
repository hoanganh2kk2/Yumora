import React from "react";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  PaymentMethodBadge,
} from "./OrderCard";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const OrderDetail = ({ order, onCancel }) => {
  if (!order) return null;

  const {
    orderId,
    createdAt,
    status,
    items,
    totalAmount,
    payment_status,
    paymentMethod,
    address,
  } = order;

  const canCancel = status === "Processing";

  const formatAddress = (addr) => {
    if (!addr) return "Không có thông tin địa chỉ";

    return `${addr.address_line}, ${addr.city}, ${addr.state}, ${addr.country}, ${addr.pincode}`;
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Đơn hàng #{orderId}</h2>
            <p className="text-sm text-gray-500">
              Ngày đặt:{" "}
              {format(new Date(createdAt), "HH:mm - dd/MM/yyyy", {
                locale: vi,
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={status} />
            <PaymentStatusBadge status={payment_status} />
            <PaymentMethodBadge method={paymentMethod} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="mb-2 font-semibold">Địa chỉ giao hàng</h3>
        <div className="rounded bg-gray-50 p-3">
          <p>{formatAddress(address)}</p>
          {address && <p className="mt-1">Điện thoại: {address.mobile}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="p-4">
        <h3 className="mb-3 font-semibold">Sản phẩm</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Sản phẩm
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
                  Đơn giá
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
                  Số lượng
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="mr-3 h-12 w-12 flex-shrink-0 rounded border border-gray-200 bg-gray-50">
                        {item.product_details?.image &&
                          item.product_details.image[0] && (
                            <img
                              src={item.product_details.image[0]}
                              alt={item.product_details.name}
                              className="h-full w-full object-contain"
                            />
                          )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {item.product_details?.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {DisplayPriceInRupees(item.price_per_unit)}
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {DisplayPriceInRupees(item.itemTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right font-semibold">
                  Tổng cộng:
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-700">
                  {DisplayPriceInRupees(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <button
            onClick={onCancel}
            className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Hủy đơn hàng
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
