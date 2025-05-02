import React, { useState } from "react";
import { useSelector } from "react-redux";
import AddAddress from "../components/AddAddress";
import { MdDelete, MdEdit } from "react-icons/md";
import EditAddressDetails from "../components/EditAddressDetails";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { useGlobalContext } from "../provider/GlobalProvider";

const Address = () => {
  const addressList = useSelector((state) => state.addresses.addressList);
  const [openAddress, setOpenAddress] = useState(false);
  const [OpenEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const { fetchAddress } = useGlobalContext();

  const handleDisableAddress = async (id) => {
    try {
      const response = await Axios({
        ...SummaryApi.disableAddress,
        data: {
          _id: id,
        },
      });
      if (response.data.success) {
        toast.success("Đã xóa địa chỉ");
        if (fetchAddress) {
          fetchAddress();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between gap-4 bg-white px-2 py-2 shadow-lg">
        <h2 className="line-clamp-1 font-semibold text-ellipsis">
          Danh sách địa chỉ
        </h2>
        <button
          onClick={() => setOpenAddress(true)}
          className="border-primary-200 text-primary-200 hover:bg-primary-200 rounded-full border px-3 py-1 hover:text-black"
        >
          Thêm địa chỉ
        </button>
      </div>

      <div className="grid gap-4 bg-blue-50 p-2">
        {addressList.map((address, index) => {
          return (
            <div
              key={index}
              className={`flex gap-3 rounded border border-slate-200 bg-white p-3 ${!address.status && "hidden"}`}
            >
              <div className="w-full">
                <p>Địa chỉ chi tiết: {address.address_line}</p>
                <p>Thành phố: {address.city}</p>
                <p>Tỉnh/Bang: {address.state}</p>
                <p>Quốc gia: 
                  {address.country} - {address.pincode}
                </p>
                <p>Số điện thoại: {address.mobile}</p>
              </div>
              <div className="grid gap-10">
                <button
                  onClick={() => {
                    setOpenEdit(true);
                    setEditData(address);
                  }}
                  className="rounded bg-green-200 p-1 hover:bg-green-600 hover:text-white"
                >
                  <MdEdit />
                </button>
                <button
                  onClick={() => handleDisableAddress(address._id)}
                  className="rounded bg-red-200 p-1 hover:bg-red-600 hover:text-white"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </div>
          );
        })}
        <div
          onClick={() => setOpenAddress(true)}
          className="flex h-16 cursor-pointer items-center justify-center border-2 border-dashed border-slate-200 bg-blue-50"
        >
          Thêm địa chỉ
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}

      {OpenEdit && (
        <EditAddressDetails data={editData} close={() => setOpenEdit(false)} />
      )}
    </div>
  );
};

export default Address;
