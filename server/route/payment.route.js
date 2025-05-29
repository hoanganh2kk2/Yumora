import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createPaymentUrlController,
  vnpayReturnController,
  checkPaymentStatusController,
} from "../controllers/payment.controller.js";

const paymentRouter = Router();

// Tạo URL thanh toán VNPay
paymentRouter.post("/create-payment", auth, createPaymentUrlController);

// Xử lý kết quả thanh toán từ VNPay (không cần auth vì đây là callback)
paymentRouter.get("/vnpay-return", vnpayReturnController);

// Kiểm tra trạng thái thanh toán
paymentRouter.get("/check-status/:orderId", auth, checkPaymentStatusController);

export default paymentRouter;
