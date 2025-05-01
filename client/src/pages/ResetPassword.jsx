import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validValue = Object.values(data).every((el) => el);

  useEffect(() => {
    if (!location?.state?.data?.success) {
      navigate("/");
    }

    if (location?.state?.email) {
      setData((pre) => {
        return {
          ...pre,
          email: location?.state?.email,
        };
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((pre) => {
      return {
        ...pre,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    ///optional
    if(data.newPassword!==data.confirmPassword){
        toast.error("New password and confirm password must be same.")
        return
    }

    try {
      const response = await Axios({
        ...SummaryApi.reset_password, //change
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem('accessToken',response.data.data.accessToken)
        localStorage.setItem('refreshToken',response.data.data.refreshToken)
        navigate("/login");
        setData({
          email: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="container mx-auto w-full px-2">
      <div className="mx-auto my-4 w-full max-w-lg rounded bg-white p-7">
        <p className="text-lg font-semibold">Enter Your Password</p>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="newPassword">New Password :</label>
            <div className="focus-within:border-primary-200 flex items-center rounded border border-slate-200 bg-blue-50 p-2">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                className="w-full outline-none"
                name="newPassword"
                value={data.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
              />
              <div
                onClick={() => setShowNewPassword((pre) => !pre)}
                className="cursor-pointer"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                role="button"
              >
                {showNewPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="confirmPassword">Confirm Password :</label>
            <div className="focus-within:border-primary-200 flex items-center rounded border border-slate-200 bg-blue-50 p-2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full outline-none"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder="Enter your confirm password"
              />
              <div
                onClick={() => setShowConfirmPassword((pre) => !pre)}
                className="cursor-pointer"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                role="button"
              >
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
          </div>

          <button
            disabled={!validValue}
            className={` ${validValue ? "bg-green-800 hover:bg-green-700" : "bg-gray-500"} my-3 rounded py-2 font-semibold tracking-wide text-white`}
          >
            Thay đổi mật khẩu
          </button>
        </form>

        <p>
          Đã có tài khoản ?
          <Link
            to={"/login"}
            className="font-semibold text-green-700 hover:text-green-800"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ResetPassword;
