import React from "react";
import { useForm } from "react-hook-form";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from "../provider/GlobalProvider";

const AddAddress = ({ close }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { fetchAddress } = useGlobalContext();

  const onSubmit = async (data) => {
    try {
      const response = await Axios({
        ...SummaryApi.createAddress,
        data: {
          address_line: data.addressline,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          mobile: data.mobile,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (close) {
          close();
          reset();
          fetchAddress();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="fixed top-0 right-0 bottom-0 left-0 z-50 h-screen overflow-auto bg-black/70">
      <div className="mx-auto mt-8 w-full max-w-lg rounded bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Thêm địa chỉ</h2>
          <button onClick={close} className="hover:text-red-500">
            <IoClose size={25} />
          </button>
        </div>
        <form className="mt-4 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <label htmlFor="addressline">Địa chỉ cụ thể:</label>
            <input
              type="text"
              id="addressline"
              className="rounded border border-slate-200 bg-blue-50 p-2"
              {...register("addressline", {
                required: "Vui lòng nhập địa chỉ",
              })}
            />
            {errors.addressline && (
              <p className="text-sm text-red-500">
                {errors.addressline.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <label htmlFor="city">Thành phố:</label>
            <input
              type="text"
              id="city"
              className="rounded border border-slate-200 bg-blue-50 p-2"
              {...register("city", { required: "Vui lòng nhập thành phố" })}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>

          <div className="grid gap-1">
            <label htmlFor="state">Tỉnh / Quận:</label>
            <input
              type="text"
              id="state"
              className="rounded border border-slate-200 bg-blue-50 p-2"
              {...register("state", { required: "Vui lòng nhập tỉnh/quận" })}
            />
            {errors.state && (
              <p className="text-sm text-red-500">{errors.state.message}</p>
            )}
          </div>

          <div className="grid gap-1">
            <label htmlFor="pincode">Mã bưu điện:</label>
            <input
              type="text"
              id="pincode"
              className="rounded border border-slate-200 bg-blue-50 p-2"
              {...register("pincode", {
                required: "Vui lòng nhập mã bưu điện",
                pattern: {
                  value: /^[0-9]{5,6}$/,
                  message: "Mã bưu điện không hợp lệ",
                },
              })}
            />
            {errors.pincode && (
              <p className="text-sm text-red-500">{errors.pincode.message}</p>
            )}
          </div>

          <div className="grid gap-1">
            <label htmlFor="country">Quốc gia:</label>
            <input
              type="text"
              id="country"
              className="rounded border border-slate-200 bg-blue-50 p-2"
              defaultValue="Việt Nam"
              {...register("country", { required: "Vui lòng nhập quốc gia" })}
            />
            {errors.country && (
              <p className="text-sm text-red-500">{errors.country.message}</p>
            )}
          </div>

          <div className="grid gap-1">
            <label htmlFor="mobile">Số điện thoại:</label>
            <input
              type="text"
              id="mobile"
              className="rounded border border-slate-200 bg-blue-50 p-2"
              {...register("mobile", {
                required: "Vui lòng nhập số điện thoại",
                pattern: {
                  value: /^0\d{9,10}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              })}
            />
            {errors.mobile && (
              <p className="text-sm text-red-500">{errors.mobile.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-primary-200 hover:bg-primary-100 mt-4 w-full py-2 font-semibold"
          >
            Gửi
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddAddress;
