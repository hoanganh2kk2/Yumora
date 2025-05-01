import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

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

    if (data.password !== data.confirmPassword) {
      toast.error("password and confirm password must be same");
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.register,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        navigate("/login");
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="container mx-auto w-full px-2">
      <div className="mx-auto my-4 w-full max-w-lg rounded bg-white p-7">
        <p className="font-semibold">Chào mừng đến với Yumora</p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="name">Họ và Tên :</label>
            <input
              type="text"
              id="name"
              autoFocus
              className="focus:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên của bạn"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="email">Email :</label>
            <input
              type="email"
              id="email"
              className="focus:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
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
                placeholder="Nhập mật khẩu của bạn"
              />
              <div
                onClick={() => setShowPassword((pre) => !pre)}
                className="cursor-pointer"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
          </div>
          <div className="grid gap-1">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu :</label>
            <div className="focus-within:border-primary-200 flex items-center rounded border border-slate-200 bg-blue-50 p-2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full outline-none"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu của bạn"
              />
              <div
                onClick={() => setShowConfirmPassword((pre) => !pre)}
                className="cursor-pointer"
              >
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
          </div>

          <button
            disabled={!validValue}
            className={` ${validValue ? "bg-green-800 hover:bg-green-700" : "bg-gray-500"} my-3 rounded py-2 font-semibold tracking-wide text-white`}
          >
            Đăng ký
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

export default Register;
