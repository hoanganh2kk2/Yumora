import React, { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import SummaryApi from "../common/SummaryApi";
import { updatedAvatar } from "../store/userSlice";
import { IoClose } from "react-icons/io5";

const UserProfileAvatarEdit = ({close}) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleUploadAvatarImage = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.uploadAvatar,
        data: formData,
      });
      const { data: responseData } = response;

      dispatch(updatedAvatar(responseData.data.avatar));
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-neutral-900/60 p-4">
      <div className="flex w-full max-w-sm flex-col items-center justify-center rounded bg-white p-4">
        <button onClick={close} className="text-neutral-800 w-fit block ml-auto">
          <IoClose size={20} />
        </button>
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-red-500 drop-shadow-sm">
          {user.avatar ? (
            <img
              alt={user.name}
              src={user.avatar}
              className="h-full w-full object-cover"
            />
          ) : (
            <FaRegUserCircle size={65} />
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="uploadProfile">
            <div className="border-primary-200 hover:bg-primary-200 my-3 cursor-pointer rounded border px-4 py-1 text-sm">
              {loading ? "Loading..." : "Upload"}
            </div>
          </label>
          <input
            onChange={handleUploadAvatarImage}
            type="file"
            id="uploadProfile"
            className="hidden"
          />
        </form>
      </div>
    </section>
  );
};

export default UserProfileAvatarEdit;
