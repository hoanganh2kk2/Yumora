import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import uploadImage from "../utils/UploadImage";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";

const UploadCategoryModel = ({ close, fetchData }) => {
  const [data, setData] = useState({
    name: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((preve) => {
      return {
        ...preve,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.addCategory,
        data: data,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        close();
        fetchData();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCategoryImage = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const response = await uploadImage(file);
    const { data: ImageResponse } = response;

    setData((preve) => {
      return {
        ...preve,
        image: ImageResponse.data.url,
      };
    });
  };
  return (
    <section className="bg-opacity-60 fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-neutral-800 p-4">
      <div className="w-full max-w-4xl rounded bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold">Category</h1>
          <button onClick={close} className="ml-auto block w-fit">
            <IoClose size={25} />
          </button>
        </div>
        <form className="my-3 grid gap-2" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label id="categoryName">Name</label>
            <input
              type="text"
              id="categoryName"
              placeholder="Enter category name"
              value={data.name}
              name="name"
              onChange={handleOnChange}
              className="focus-within:border-primary-200 rounded border border-blue-100 bg-blue-50 p-2 outline-none"
            />
          </div>
          <div className="grid gap-1">
            <p>Image</p>
            <div className="flex flex-col items-center gap-4 lg:flex-row">
              <div className="flex h-36 w-full items-center justify-center rounded border bg-blue-50 lg:w-36">
                {data.image ? (
                  <img
                    alt="category"
                    src={data.image}
                    className="h-full w-full object-scale-down"
                  />
                ) : (
                  <p className="text-sm text-neutral-500">No Image</p>
                )}
              </div>
              <label htmlFor="uploadCategoryImage">
                <div
                  className={` ${!data.name ? "bg-gray-300" : "border-primary-200 hover:bg-primary-100"} cursor-pointer rounded border px-4 py-2 font-medium`}
                >
                  Upload Image
                </div>

                <input
                  disabled={!data.name}
                  onChange={handleUploadCategoryImage}
                  type="file"
                  id="uploadCategoryImage"
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            className={` ${data.name && data.image ? "bg-primary-200 hover:bg-primary-100" : "bg-gray-300"} py-2 font-semibold`}
          >
            Add Category
          </button>
        </form>
      </div>
    </section>
  );
};

export default UploadCategoryModel;
