import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import OrderDetail from "../components/OrderDetail";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getOrderDetail,
        url: `${SummaryApi.getOrderDetail.url}/${orderId}`,
      });

      if (response.data.success) {
        setOrderData(response.data.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    // Hiển thị xác nhận trước khi hủy đơn hàng
    const result = await Swal.fire({
      title: "Xác nhận hủy đơn hàng?",
      text: "Bạn không thể hoàn tác hành động này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý, hủy đơn hàng!",
      cancelButtonText: "Quay lại",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await Axios({
          ...SummaryApi.cancelOrder,
          data: {
            orderId: orderId,
          },
        });

        if (response.data.success) {
          toast.success("Đơn hàng đã được hủy thành công");
          // Cập nhật trạng thái đơn hàng
          fetchOrderDetails();
        }
      } catch (error) {
        AxiosToastError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={() => navigate("/dashboard/myorders")}
        className="mb-4 flex items-center gap-1 text-green-600 hover:text-green-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Quay lại danh sách đơn hàng
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      ) : orderData ? (
        <OrderDetail order={orderData} onCancel={handleCancelOrder} />
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">
            Không tìm thấy thông tin đơn hàng
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
