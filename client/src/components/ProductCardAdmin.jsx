import React, { useState } from "react";
import EditProductAdmin from "./EditProductAdmin";
import { IoClose } from "react-icons/io5";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import toast from "react-hot-toast";

const ProductCardAdmin = ({ data, fetchProductData }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleDeleteCancel = () => {
    setOpenDelete(false);
  };

  const handleDelete = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: {
          _id: data._id,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchProductData) {
          fetchProductData();
        }
        setOpenDelete(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };
  return (
    <div className="w-36 rounded bg-white p-4">
      <div>
        <img
          src={data?.image[0]}
          alt={data?.name}
          className="h-full w-full object-scale-down"
        />
      </div>
      <p className="line-clamp-2 font-medium text-ellipsis">{data?.name}</p>
      <p className="text-slate-400">{data?.unit}</p>
      <div className="grid grid-cols-2 gap-3 py-2">
        <button
          onClick={() => setEditOpen(true)}
          className="rounded border border-green-600 bg-green-100 px-1 py-1 text-sm text-green-800 hover:bg-green-200"
        >
          Sửa
        </button>
        <button
          onClick={() => setOpenDelete(true)}
          className="rounded border border-red-600 bg-red-100 px-1 py-1 text-sm text-red-600 hover:bg-red-200"
        >
          Xóa
        </button>
      </div>

      {editOpen && (
        <EditProductAdmin
          fetchProductData={fetchProductData}
          data={data}
          close={() => setEditOpen(false)}
        />
      )}

      {openDelete && (
        <section className="fixed top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-neutral-600/70 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold">Xóa vĩnh viễn</h3>
              <button onClick={() => setOpenDelete(false)}>
                <IoClose size={25} />
              </button>
            </div>
            <p className="my-2">Bạn có chắc chắn muốn xóa vĩnh viễn không?</p>
            <div className="flex justify-end gap-5 py-4">
              <button
                onClick={handleDeleteCancel}
                className="rounded border border-red-500 bg-red-100 px-3 py-1 text-red-500 hover:bg-red-200"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                className="rounded border border-green-500 bg-green-100 px-3 py-1 text-green-500 hover:bg-green-200"
              >
                Xóa
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductCardAdmin;
