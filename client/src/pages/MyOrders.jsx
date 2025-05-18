import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import OrderCard from "../components/OrderCard";
import noDataImage from "../assets/nothing here yet.webp";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getMyOrders,
        params: {
          page: pagination.currentPage,
          limit: 10,
        },
      });

      if (response.data.success) {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between rounded bg-white p-2 shadow-md">
        <h2 className="font-semibold">Đơn hàng của tôi</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      ) : orders.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order, index) => (
              <OrderCard key={`${order.orderId}-${index}`} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handlePrevPage}
                disabled={pagination.currentPage === 1}
                className={`rounded border px-4 py-2 ${
                  pagination.currentPage === 1
                    ? "cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-green-600 text-green-600 hover:bg-green-50"
                }`}
              >
                Trang trước
              </button>

              <div className="text-sm">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </div>

              <button
                onClick={handleNextPage}
                disabled={pagination.currentPage >= pagination.totalPages}
                className={`rounded border px-4 py-2 ${
                  pagination.currentPage >= pagination.totalPages
                    ? "cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-green-600 text-green-600 hover:bg-green-50"
                }`}
              >
                Trang tiếp
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <img src={noDataImage} alt="Không có dữ liệu" className="mb-4 w-64" />
          <p className="text-lg text-gray-500">Bạn chưa có đơn hàng nào</p>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
