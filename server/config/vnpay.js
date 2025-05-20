import qs from "qs";
import crypto from "crypto";
import moment from "moment";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình cho VNPay
const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  url: process.env.VNPAY_URL,
  returnUrl: process.env.VNPAY_RETURN_URL,
};

// Tạo URL thanh toán VNPay
const createPaymentUrl = (orderId, amount, orderInfo, ipAddr, redirectUrl) => {
  // Thông tin thanh toán
  const tmnCode = vnpayConfig.tmnCode;
  const secretKey = vnpayConfig.hashSecret;
  const returnUrl = redirectUrl || vnpayConfig.returnUrl;

  // Tạo các tham số thanh toán
  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  // Tạo đối tượng chứa thông tin thanh toán
  let vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100, // VNPay yêu cầu số tiền * 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  // Sắp xếp tham số theo thứ tự a-z
  vnpParams = sortObject(vnpParams);

  // Tạo chuỗi ký
  const signData = qs.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // Thêm chữ ký vào tham số
  vnpParams["vnp_SecureHash"] = signed;

  // Tạo URL thanh toán
  const paymentUrl = `${vnpayConfig.url}?${qs.stringify(vnpParams, { encode: false })}`;

  return paymentUrl;
};

// Kiểm tra chữ ký từ VNPay
const verifyReturnUrl = (vnpParams) => {
  // Xóa chữ ký từ tham số
  const secureHash = vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];

  // Sắp xếp tham số
  const sortedParams = sortObject(vnpParams);

  // Tạo chuỗi ký và kiểm tra
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", vnpayConfig.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return secureHash === signed;
};

// Hàm sắp xếp đối tượng theo khóa
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    sorted[key] = obj[key];
  }

  return sorted;
}

export default {
  config: vnpayConfig,
  createPaymentUrl,
  verifyReturnUrl,
};
