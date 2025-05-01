import React, { useEffect, useRef, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import toast from "react-hot-toast";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { Link, useLocation, useNavigate } from "react-router-dom";

const OtpVerification = () => {
  const [data, setData] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const inputRef = useRef([]);
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = location?.state?.email || localStorage.getItem("otp_email");



  useEffect(() => {
    if (inputRef.current[0]) {
      inputRef.current[0].focus();
    }
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("otp_email");
    if (location?.state?.email) {
      localStorage.setItem("otp_email", location.state.email);
    } else if (storedEmail) {
      navigate("/forgot-password", { state: { email: storedEmail } });
    } else {
      navigate("/forgot-password");
    }
  }, [location, navigate]);
  

  const validValue = data.every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await Axios({
        ...SummaryApi.forgot_password_otp_verification,
        data: {
          otp: data.join(""),
          email: email,
        },
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setData(["", "", "", "", "", ""]);
        navigate("/reset-password", {
          state: {
            data: response.data,
            email: location?.state?.email,
          },
        });
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending) return; // Chặn spam gửi liên tục

    setIsResending(true);
    try {
      const response = await Axios({
        ...SummaryApi.forgot_password, // Gửi lại OTP như ForgotPassWord.jsx
        data: { email: location?.state?.email },
      });

      if (response.data.error) {
        toast.error(response.data.message);
      } else {
        toast.success("OTP has been resent to your email!");
      }
    } catch (error) {
      AxiosToastError(error);
    }

    setTimeout(() => setIsResending(false), 30000); // Chặn resend trong 30 giây
  };

  return (
    <section className="container mx-auto w-full px-2">
      <div className="mx-auto my-4 w-full max-w-lg rounded bg-white p-7">
        <p className="text-lg font-semibold">Nhập mã OTP</p>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="otp">Nhập mã OTP của bạn :</label>
            <div className="mt-3 flex items-center justify-between gap-2">
              {data.map((element, index) => {
                return (
                  <input
                    key={"otp" + index}
                    type="text"
                    id={`otp-${index}`}
                    ref={(ref) => {
                      inputRef.current[index] = ref;
                    }}
                    value={data[index]}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");

                      if (value.length > 1) {
                        // Nếu người dùng paste cả mã OTP
                        const otpArray = value.split("").slice(0, 6);
                        setData(otpArray);
                        inputRef.current[5]?.focus();
                        return;
                      }

                      const newData = [...data];
                      newData[index] = value.charAt(0);
                      setData(newData);

                      if (value && index < data.length - 1) {
                        inputRef.current[index + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        setData((prevData) => {
                          const newData = [...prevData];
                          if (!newData[index] && index > 0) {
                            newData[index - 1] = "";
                            setTimeout(
                              () => inputRef.current[index - 1]?.focus(),
                              0,
                            );
                          } else {
                            newData[index] = "";
                          }
                          return newData;
                        });
                      }
                    }}
                    maxLength={1}
                    autoFocus={index === 0}
                    className="focus:border-primary-200 w-full max-w-16 rounded border border-slate-200 bg-blue-50 p-2 text-center font-semibold outline-none"
                  />
                );
              })}
            </div>
          </div>

          <p className="text-sm">
            Không nhận được mã OTP ?
            <button
              className={`ml-2 font-semibold ${
                isResending
                  ? "cursor-not-allowed text-gray-400"
                  : "text-green-700 hover:text-green-800"
              }`}
              onClick={handleResendOtp}
              disabled={isResending}
            >
              {isResending ? "Đang gửi lại ..." : "Gửi lại mã OTP"}
            </button>
          </p>

          <button
            disabled={!validValue|| isSubmitting}
            className={` ${validValue ? "bg-green-800 hover:bg-green-700" : "bg-gray-500"} my-3 rounded py-2 font-semibold tracking-wide text-white`}
          >
            {isSubmitting ? "Đang xác minh..." : "Xác minh OTP"}
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

export default OtpVerification;
