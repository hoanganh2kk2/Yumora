import qs from "qs";
import crypto from "crypto";
import moment from "moment";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình VNPay
const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  url:
    process.env.VNPAY_URL ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: process.env.VNPAY_RETURN_URL,
};

// Validate config
if (!vnpayConfig.tmnCode || !vnpayConfig.hashSecret) {
  console.error(
    "Missing VNPay configuration. Please check environment variables."
  );
}

// Tạo URL thanh toán VNPay
const createPaymentUrl = (orderId, amount, orderInfo, ipAddr, returnUrl) => {
  try {
    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");
    const expireDate = moment(date).add(15, "minutes").format("YYYYMMDDHHmmss");

    let vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnpayConfig.tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "other",
      vnp_Amount: Math.round(amount * 100), // VNPay yêu cầu số tiền * 100
      vnp_ReturnUrl: returnUrl || vnpayConfig.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sắp xếp params theo thứ tự alphabet
    vnpParams = sortObject(vnpParams);

    // Tạo query string
    const signData = qs.stringify(vnpParams, { encode: false });

    // Tạo secure hash
    const hmac = crypto.createHmac("sha512", vnpayConfig.hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnpParams["vnp_SecureHash"] = signed;

    // Tạo payment URL
    const paymentUrl = `${vnpayConfig.url}?${qs.stringify(vnpParams, { encode: false })}`;

    console.log("Generated VNPay URL:", paymentUrl);
    return paymentUrl;
  } catch (error) {
    console.error("Error creating VNPay payment URL:", error);
    throw new Error("Không thể tạo URL thanh toán");
  }
};

// Xác thực return URL từ VNPay
const verifyReturnUrl = (vnpParams) => {
  try {
    const secureHash = vnpParams["vnp_SecureHash"];

    // Tạo bản copy và xóa hash
    const paramsToVerify = { ...vnpParams };
    delete paramsToVerify["vnp_SecureHash"];
    delete paramsToVerify["vnp_SecureHashType"];

    // Sắp xếp params
    const sortedParams = sortObject(paramsToVerify);

    // Tạo sign data
    const signData = qs.stringify(sortedParams, { encode: false });

    // Tạo hash để so sánh
    const hmac = crypto.createHmac("sha512", vnpayConfig.hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    console.log("VNPay signature verification:", {
      received: secureHash,
      calculated: signed,
      isValid: secureHash === signed,
    });

    return secureHash === signed;
  } catch (error) {
    console.error("Error verifying VNPay signature:", error);
    return false;
  }
};

// Sắp xếp object theo key
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    sorted[key] = obj[key];
  }

  return sorted;
}

// Lấy mã lỗi VNPay
const getVNPayErrorMessage = (responseCode) => {
  const errorMessages = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    10: "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    11: "Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
    12: "Thẻ/Tài khoản của khách hàng bị khóa.",
    13: "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
    24: "Khách hàng hủy giao dịch",
    51: "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
    65: "Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    75: "Ngân hàng thanh toán đang bảo trì.",
    79: "KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
    99: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
  };

  return errorMessages[responseCode] || `Lỗi không xác định (${responseCode})`;
};

export default {
  config: vnpayConfig,
  createPaymentUrl,
  verifyReturnUrl,
  getVNPayErrorMessage,
};
