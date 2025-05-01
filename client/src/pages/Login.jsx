import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { Link, useNavigate } from "react-router-dom";
import fetchUserDetails from "../utils/fetchUserDetails";
import { useDispatch } from "react-redux";
import {setUserDetails} from "../store/userSlice"

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((pre) => {
      return {
        ...pre,
        [name]: value,
      };
    });
  };

  const validValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios({
        ...SummaryApi.login,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem("accessToken", response.data.data.accessToken);
        localStorage.setItem("refreshToken", response.data.data.refreshToken);

        const userDetails = await fetchUserDetails();
        dispatch(setUserDetails(userDetails.data));

        setData({
          email: "",
          password: "",
        });
        navigate("/");
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="container mx-auto w-full px-2">
      <div className="mx-auto my-4 w-full max-w-lg rounded bg-white p-7">
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="email">Email :</label>
            <input
              type="email"
              id="email"
              autoFocus
              className="focus:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Nhập email"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="password">Mật khẩu :</label>
            <div className="focus-within:border-primary-200 flex items-center rounded border border-slate-200 bg-blue-50 p-2">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full outline-none"
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
              />
              <div
                onClick={() => setShowPassword((pre) => !pre)}
                className="cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
                role="button"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
            <Link
              to={"/forgot-password"}
              className="hover:text-primary-200 ml-auto block"
            >
              Quên mật khẩu ?
            </Link>
          </div>

          <button
            disabled={!validValue}
            className={` ${validValue ? "bg-green-800 hover:bg-green-700" : "bg-gray-500"} my-3 rounded py-2 font-semibold tracking-wide text-white`}
          >
            Đăng nhập
          </button>
        </form>

        <p>
          Bạn chưa có tài khoản ?
          <Link
            to={"/register"}
            className="font-semibold text-green-700 hover:text-green-800"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
